const express = require("express");
const axios = require("axios");

const pool = require("../config/db");
const { diagnoseFailure } = require("../services/diagnosisService");

const router = express.Router();

/*
=========================================================
POST /api/transactions/failed

Records a failed subscription payment,
diagnoses the failure,
and writes the diagnosis to audit_log.
=========================================================
*/

router.post("/failed", async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("\n========== RALLY TRANSACTION ==========");

    console.log("Incoming request:");
    console.log(JSON.stringify(req.body, null, 2));

    const {
      transaction_id,
      merchant_id,
      customer_id,
      amount,
      payment_method,
      issuing_bank,
      failure_code,
      failure_reason,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!transaction_id) {
      return res.status(400).json({
        error: "transaction_id is required",
      });
    }

    if (!customer_id) {
      return res.status(400).json({
        error: "customer_id is required",
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        error: "amount is required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        error: "amount must be greater than zero",
      });
    }

    // -----------------------------
    // DATABASE TRANSACTION
    // -----------------------------

    await client.query("BEGIN");

    console.log("1. Database transaction started");

    // -----------------------------
    // INSERT FAILED TRANSACTION
    // -----------------------------

    const transactionResult = await client.query(
      `
      INSERT INTO transactions (
        transaction_id,
        merchant_id,
        customer_id,
        amount,
        timestamp,
        payment_method,
        issuing_bank,
        initial_status,
        failure_code,
        failure_reason,
        retry_count,
        final_status,
        recovered_amount
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        NOW(),
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12
      )
      RETURNING *
      `,
      [
        transaction_id,
        merchant_id || "demo_merchant",
        customer_id,
        Number(amount),
        payment_method || null,
        issuing_bank || null,
        "failed",
        failure_code || null,
        failure_reason || null,
        0,
        "pending",
        0,
      ]
    );

    const transaction = transactionResult.rows[0];

    console.log(
      "2. Transaction inserted:",
      transaction.transaction_id
    );

    // -----------------------------
    // DIAGNOSE FAILURE
    // -----------------------------

    const diagnosis = diagnoseFailure(transaction);

    console.log("3. Rally diagnosis:");
    console.log(JSON.stringify(diagnosis, null, 2));

    // -----------------------------
    // AUDIT DIAGNOSIS
    // -----------------------------

    const auditResult = await client.query(
      `
      INSERT INTO audit_log (
        transaction_id,
        event_type,
        input_features,
        model_prediction,
        rule_evaluations,
        action_taken,
        outcome,
        timestamp
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        NOW()
      )
      RETURNING *
      `,
      [
        transaction.transaction_id,

        "DIAGNOSIS",

        JSON.stringify({
          failure_code: transaction.failure_code,
          failure_reason: transaction.failure_reason,
          payment_method: transaction.payment_method,
          issuing_bank: transaction.issuing_bank,
          amount: Number(transaction.amount),
        }),

        null,

        JSON.stringify({
          category: diagnosis.category,
          recoverable: diagnosis.recoverable,
          reason: diagnosis.reason,
        }),

        diagnosis.recommended_action,

        diagnosis.recoverable
          ? "RECOVERABLE"
          : "NOT_RECOVERABLE",
      ]
    );

    console.log(
      "4. Audit log inserted:",
      auditResult.rows[0].log_id
    );

    // -----------------------------
    // COMMIT
    // -----------------------------

    await client.query("COMMIT");

    console.log("5. Database transaction committed");
    console.log("======================================\n");

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.status(201).json({
      message: "Failed payment recorded successfully",

      transaction,

      diagnosis,

      audit: {
        log_id: auditResult.rows[0].log_id,
        event_type: auditResult.rows[0].event_type,
      },
    });

  } catch (error) {

    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error(
        "Rollback failed:",
        rollbackError.message
      );
    }

    console.error("\n========== RALLY ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("=================================\n");

    if (error.code === "23505") {
      return res.status(409).json({
        error: "Transaction already exists",
        transaction_id: req.body.transaction_id,
      });
    }

    return res.status(500).json({
      error: "Failed to process transaction",
      message: error.message,
      code: error.code || null,
    });

  } finally {
    client.release();
  }
});


/*
=========================================================
POST /api/transactions/decide

Gets transaction from PostgreSQL,
sends it to Rally ML Service,
stores the AI prediction,
and creates a recovery action.
=========================================================
*/

router.post("/decide", async (req, res) => {

  try {

    const { transaction_id } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!transaction_id) {
      return res.status(400).json({
        error: "transaction_id is required",
      });
    }

    // -----------------------------
    // GET TRANSACTION
    // -----------------------------

    const result = await pool.query(
      `
      SELECT *
      FROM transactions
      WHERE transaction_id = $1
      `,
      [transaction_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Transaction not found",
      });
    }

    const transaction = result.rows[0];

    console.log(
      `Sending ${transaction_id} to Rally ML service...`
    );

    // -----------------------------
    // DIAGNOSE
    // -----------------------------

    const diagnosis = diagnoseFailure(transaction);

    // -----------------------------
    // CALL ML SERVICE
    // -----------------------------

    const aiResponse = await axios.post(
      "http://localhost:8000/predict",

      {
        amount: Number(transaction.amount),

        payment_method:
          transaction.payment_method,

        issuing_bank:
          transaction.issuing_bank,

        failure_code:
          transaction.failure_code,

        failure_reason:
          transaction.failure_reason,

        retry_count:
          transaction.retry_count || 0,
      },

      {
        timeout: 5000,
      }
    );

    const decision = aiResponse.data;

    console.log("Rally ML prediction:");

    console.log(
      JSON.stringify(decision, null, 2)
    );

    // -----------------------------
    // SAVE RECOVERY ACTION
    // -----------------------------

    await pool.query(
      `
      INSERT INTO recovery_actions (
        transaction_id,
        action_type,
        channel,
        status
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        transaction.transaction_id,

        decision.recommended_action,

        decision.recommended_action ===
        "PAYMENT_LINK"
          ? "PAYMENT_LINK"
          : "SYSTEM",

        "PENDING",
      ]
    );

    // -----------------------------
    // SAVE AI DECISION AUDIT
    // -----------------------------

    await pool.query(
      `
      INSERT INTO audit_log (
        transaction_id,
        event_type,
        input_features,
        model_prediction,
        rule_evaluations,
        action_taken,
        outcome
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        transaction.transaction_id,

        "DECISION",

        JSON.stringify({
          amount:
            Number(transaction.amount),

          payment_method:
            transaction.payment_method,

          issuing_bank:
            transaction.issuing_bank,

          failure_code:
            transaction.failure_code,

          failure_reason:
            transaction.failure_reason,

          retry_count:
            transaction.retry_count || 0,
        }),

        // IMPORTANT:
        // model_prediction is NUMERIC
        decision.recovery_probability,

        // Store additional AI information as JSON
        JSON.stringify({
          diagnosis,

          recovery_percentage:
            decision.recovery_percentage,

          confidence:
            decision.confidence,

          reason:
            decision.reason,
        }),

        decision.recommended_action,

        "DECISION_MADE",
      ]
    );

    // -----------------------------
    // RESPONSE
    // -----------------------------

    return res.json({

      transaction_id:
        transaction.transaction_id,

      recovery_probability:
        decision.recovery_probability,

      recovery_percentage:
        decision.recovery_percentage,

      recommended_action:
        decision.recommended_action,

      confidence:
        decision.confidence,

      reason:
        decision.reason,

      diagnosis,

    });

  } catch (error) {

    console.error(
      "Recovery decision error:",
      error.message
    );

    // -----------------------------
    // ML SERVICE OFFLINE
    // -----------------------------

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED"
    ) {

      return res.status(503).json({
        error:
          "Rally ML service unavailable",

        message:
          "Start the ML service on port 8000.",
      });
    }

    return res.status(500).json({
      error:
        "Failed to make recovery decision",

      message:
        error.message,
    });
  }
});


/*
=========================================================
POST /api/transactions/simulate-success

DEMO ONLY.

Simulates a successful payment recovery.
=========================================================
*/

router.post(
  "/simulate-success",
  async (req, res) => {

    try {

      const { transaction_id } = req.body;

      // -----------------------------
      // VALIDATION
      // -----------------------------

      if (!transaction_id) {
        return res.status(400).json({
          error:
            "transaction_id is required",
        });
      }

      // -----------------------------
      // GET TRANSACTION
      // -----------------------------

      const result = await pool.query(
        `
        SELECT *
        FROM transactions
        WHERE transaction_id = $1
        `,
        [transaction_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Transaction not found",
        });
      }

      const transaction =
        result.rows[0];

      // -----------------------------
      // MARK PAYMENT RECOVERED
      // -----------------------------

      const updated =
        await pool.query(
          `
          UPDATE transactions
          SET
            final_status = 'recovered',
            recovered_amount = amount
          WHERE transaction_id = $1
          RETURNING *
          `,
          [transaction_id]
        );

      // -----------------------------
      // MARK RECOVERY ACTION SUCCESS
      // -----------------------------

      await pool.query(
        `
        UPDATE recovery_actions
        SET
          status = 'SUCCESS'
        WHERE transaction_id = $1
          AND status = 'PENDING'
        `,
        [transaction_id]
      );

      // -----------------------------
      // AUDIT RECOVERY
      // -----------------------------

      await pool.query(
        `
        INSERT INTO audit_log (
          transaction_id,
          event_type,
          input_features,
          rule_evaluations,
          action_taken,
          outcome
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          transaction_id,

          "PAYMENT_RECOVERED",

          JSON.stringify({
            amount:
              Number(transaction.amount),
          }),

          JSON.stringify({
            simulated: true,
            recovery_completed: true,
          }),

          "RECOVERED",

          "SUCCESS",
        ]
      );

      // -----------------------------
      // RESPONSE
      // -----------------------------

      return res.json({

        message:
          "Payment successfully recovered",

        transaction_id,

        recovered_amount:
          updated.rows[0]
            .recovered_amount,

        final_status:
          updated.rows[0]
            .final_status,

      });

    } catch (error) {

      console.error(
        "Recovery simulation error:",
        error.message
      );

      return res.status(500).json({
        error:
          "Failed to simulate recovery",

        message:
          error.message,
      });
    }
  }
);


module.exports = router;