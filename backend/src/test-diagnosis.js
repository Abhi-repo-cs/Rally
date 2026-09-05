const { diagnoseFailure } = require("./services/diagnosisService");

const testTransactions = [
  {
    failure_code: "CARD_EXPIRED",
    failure_reason: "Card expired",
  },
  {
    failure_code: "INSUFFICIENT_FUNDS",
    failure_reason: "Insufficient funds",
  },
  {
    failure_code: "AUTH_REQUIRED",
    failure_reason: "Authentication required",
  },
  {
    failure_code: "FRAUD_BLOCKED",
    failure_reason: "Transaction blocked",
  },
];

for (const transaction of testTransactions) {
  console.log("\nInput:", transaction);

  const diagnosis = diagnoseFailure(transaction);

  console.log("Diagnosis:", diagnosis);
}