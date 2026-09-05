function calculateRecoveryDecision(transaction, diagnosis) {
    const code = (transaction.failure_code || "").toUpperCase();
  
    let recovery_probability = 0.50;
    let recommended_action = "RETRY";
    let reason = "Failure appears potentially recoverable.";
  
    if (code.includes("INSUFFICIENT")) {
      recovery_probability = 0.82;
      recommended_action = "RETRY";
      reason =
        "Insufficient funds may be temporary. Rally recommends a controlled retry.";
    } else if (code.includes("EXPIRED")) {
      recovery_probability = 0.87;
      recommended_action = "PAYMENT_LINK";
      reason =
        "The payment instrument appears expired. Rally recommends requesting an updated payment method.";
    } else if (
      code.includes("TIMEOUT") ||
      code.includes("NETWORK") ||
      code.includes("TECHNICAL")
    ) {
      recovery_probability = 0.76;
      recommended_action = "RETRY";
      reason =
        "The failure appears technical or temporary. Rally recommends retrying.";
    } else if (
      code.includes("MANDATE") ||
      code.includes("AUTOPAY") ||
      code.includes("UPI")
    ) {
      recovery_probability = 0.72;
      recommended_action = "PAYMENT_LINK";
      reason =
        "The recurring payment authorization failed. Rally recommends an alternate payment flow.";
    } else if (
      code.includes("FRAUD") ||
      code.includes("BLOCKED") ||
      code.includes("DO_NOT_HONOR")
    ) {
      recovery_probability = 0.05;
      recommended_action = "STOP";
      reason =
        "The failure should not be automatically retried. Rally stops recovery attempts.";
    }
  
    if (diagnosis && diagnosis.recoverable === false) {
      recovery_probability = Math.min(recovery_probability, 0.10);
      recommended_action = "STOP";
      reason = "Diagnosis marked this failure as non-recoverable.";
    }
  
    return {
      recovery_probability,
      recommended_action,
      reason,
    };
  }
  
  module.exports = {
    calculateRecoveryDecision,
  };