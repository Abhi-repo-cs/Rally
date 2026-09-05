from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional


app = FastAPI(
    title="Rally ML Service",
    description="AI-powered subscription payment recovery service",
    version="1.0.0"
)


class PredictionRequest(BaseModel):
    amount: float
    payment_method: Optional[str] = None
    issuing_bank: Optional[str] = None
    failure_code: Optional[str] = None
    failure_reason: Optional[str] = None
    retry_count: int = 0


class PredictionResponse(BaseModel):
    recovery_probability: float
    recovery_percentage: str
    recommended_action: str
    confidence: float
    reason: str


def predict_recovery(data: PredictionRequest):

    code = (data.failure_code or "").upper()
    reason = (data.failure_reason or "").lower()

    # Permanent / unsafe failures
    if any(x in code for x in [
        "FRAUD",
        "BLOCKED",
        "DO_NOT_HONOR",
        "DECLINED_PERMANENTLY"
    ]):
        return PredictionResponse(
            recovery_probability=0.05,
            recovery_percentage="5%",
            recommended_action="STOP",
            confidence=0.95,
            reason="Failure appears non-recoverable. Rally stops automated recovery."
        )

    # Insufficient funds
    if "INSUFFICIENT" in code or "INSUFFICIENT" in reason:
        probability = 0.82

        if data.retry_count > 0:
            probability -= 0.10

        return PredictionResponse(
            recovery_probability=probability,
            recovery_percentage=f"{round(probability * 100)}%",
            recommended_action="RETRY",
            confidence=0.91,
            reason="Balance-related failure may be temporary. Rally recommends a controlled retry."
        )

    # Expired card
    if "EXPIRED" in code or "EXPIRED" in reason:
        return PredictionResponse(
            recovery_probability=0.87,
            recovery_percentage="87%",
            recommended_action="PAYMENT_LINK",
            confidence=0.94,
            reason="Payment instrument appears expired. Rally recommends collecting an updated payment method."
        )

    # Technical failures
    if any(x in code for x in [
        "TIMEOUT",
        "NETWORK",
        "TECHNICAL"
    ]):
        return PredictionResponse(
            recovery_probability=0.76,
            recovery_percentage="76%",
            recommended_action="RETRY",
            confidence=0.88,
            reason="Failure appears temporary or technical. Rally recommends retrying."
        )

    # Mandate / recurring payment
    if any(x in code for x in [
        "MANDATE",
        "AUTOPAY",
        "UPI"
    ]):
        return PredictionResponse(
            recovery_probability=0.72,
            recovery_percentage="72%",
            recommended_action="PAYMENT_LINK",
            confidence=0.86,
            reason="Recurring payment authorization failed. Rally recommends an alternate payment flow."
        )

    # Unknown failure
    return PredictionResponse(
        recovery_probability=0.50,
        recovery_percentage="50%",
        recommended_action="RETRY",
        confidence=0.65,
        reason="Failure appears potentially recoverable. Rally recommends a controlled retry."
    )


@app.get("/")
def root():
    return {
        "service": "Rally ML Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "Rally ML Service"
    }


@app.post("/predict", response_model=PredictionResponse)
def predict(data: PredictionRequest):
    return predict_recovery(data)