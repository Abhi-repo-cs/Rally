/**
 * Rally Failure Diagnosis Engine
 *
 * Determines whether a failed subscription payment
 * is potentially recoverable and recommends the
 * next action.
 */

function diagnoseFailure(transaction) {
  const failureCode = String(transaction.failure_code || "").toUpperCase();
  const failureReason = String(transaction.failure_reason || "").toLowerCase();

  // --------------------------------------------------
  // HARD DECLINES
  // --------------------------------------------------

  const hardDeclineKeywords = [
    "FRAUD",
    "STOLEN",
    "CLOSED_ACCOUNT",
    "ACCOUNT_CLOSED",
    "DO_NOT_HONOR",
    "LOST_CARD",
    "BLOCKED_CARD",
  ];

  const isHardDecline = hardDeclineKeywords.some(
    (keyword) =>
      failureCode.includes(keyword) ||
      failureReason.includes(keyword.toLowerCase())
  );

  if (isHardDecline) {
    return {
      recoverable: false,
      category: "HARD_DECLINE",
      recommended_action: "STOP",
      reason: "Permanent or high-risk payment failure",
    };
  }

  // --------------------------------------------------
  // INSUFFICIENT FUNDS
  // --------------------------------------------------

  if (
    failureCode.includes("INSUFFICIENT") ||
    failureCode.includes("FUNDS") ||
    failureCode.includes("NSF") ||
    failureReason.includes("insufficient") ||
    failureReason.includes("insufficient balance")
  ) {
    return {
      recoverable: true,
      category: "INSUFFICIENT_FUNDS",
      recommended_action: "RETRY",
      reason: "Temporary balance-related failure; retry may succeed later",
    };
  }

  // --------------------------------------------------
  // EXPIRED CARD
  // --------------------------------------------------

  if (
    failureCode.includes("EXPIRED") ||
    failureCode.includes("CARD_EXPIRED") ||
    failureReason.includes("expired card") ||
    failureReason.includes("card expired")
  ) {
    return {
      recoverable: true,
      category: "EXPIRED_CARD",
      recommended_action: "PAYMENT_LINK",
      reason: "Customer may need to update payment credentials",
    };
  }

  // --------------------------------------------------
  // BANK TIMEOUT / NETWORK
  // --------------------------------------------------

  if (
    failureCode.includes("TIMEOUT") ||
    failureCode.includes("NETWORK") ||
    failureCode.includes("TECHNICAL") ||
    failureCode.includes("BANK_ERROR") ||
    failureReason.includes("timeout") ||
    failureReason.includes("network") ||
    failureReason.includes("technical")
  ) {
    return {
      recoverable: true,
      category: "BANK_TIMEOUT",
      recommended_action: "RETRY",
      reason: "Temporary technical failure; immediate retry may succeed",
    };
  }

  // --------------------------------------------------
  // MANDATE
  // --------------------------------------------------

  if (
    failureCode.includes("MANDATE") ||
    failureCode.includes("AUTOPAY") ||
    failureCode.includes("UPI") ||
    failureReason.includes("mandate") ||
    failureReason.includes("autopay")
  ) {
    return {
      recoverable: true,
      category: "MANDATE_ISSUE",
      recommended_action: "PAYMENT_LINK",
      reason: "Customer may need to re-authorize the payment",
    };
  }

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  if (
    failureCode.includes("AUTH") ||
    failureCode.includes("AUTHENTICATION") ||
    failureReason.includes("authentication") ||
    failureReason.includes("authorization")
  ) {
    return {
      recoverable: true,
      category: "AUTHENTICATION",
      recommended_action: "PAYMENT_LINK",
      reason: "Customer intervention may be required",
    };
  }

  // --------------------------------------------------
  // UNKNOWN FAILURE
  // --------------------------------------------------

  return {
    recoverable: true,
    category: "UNKNOWN",
    recommended_action: "RETRY",
    reason: "Failure does not match a known hard-decline pattern",
  };
}

module.exports = {
  diagnoseFailure,
};