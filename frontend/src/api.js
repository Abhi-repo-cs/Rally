import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function runRecovery(transaction) {
  // 1. Register failed payment
  await api.post("/transactions/failed", {
    transaction_id: transaction.id,
    customer_id: transaction.customer_id || "CUS_TEST_001",
    amount: transaction.amount_number || 999,
    currency: "INR",
    failure_code: transaction.failure_code || "INSUFFICIENT_FUNDS",
    failure_reason: transaction.reason || "Insufficient Funds",
  });

  // 2. Ask ML/decision engine
  const decisionResponse = await api.post("/transactions/decide", {
    transaction_id: transaction.id,
  });

  // 3. Simulate successful recovery for demo
  const successResponse = await api.post(
    "/transactions/simulate-success",
    {
      transaction_id: transaction.id,
    }
  );

  return {
    decision: decisionResponse.data,
    success: successResponse.data,
  };
}

export async function getDecision(transactionId) {
  const response = await api.post("/transactions/decide", {
    transaction_id: transactionId,
  });

  return response.data;
}

export async function simulateSuccess(transactionId) {
  const response = await api.post(
    "/transactions/simulate-success",
    {
      transaction_id: transactionId,
    }
  );

  return response.data;
}

export default api;