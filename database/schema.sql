-- =====================================================
-- RALLY DATABASE
-- =====================================================

-- ---------------------------------------------
-- TRANSACTIONS
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,

    merchant_id VARCHAR(50),

    customer_id VARCHAR(50) NOT NULL,

    amount DECIMAL(12, 2) NOT NULL,

    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),

    payment_method VARCHAR(50),

    issuing_bank VARCHAR(100),

    initial_status VARCHAR(20),

    failure_code VARCHAR(100),

    failure_reason VARCHAR(255),

    retry_count INT DEFAULT 0,

    final_status VARCHAR(30),

    recovered_amount DECIMAL(12, 2) DEFAULT 0
);


-- ---------------------------------------------
-- RECOVERY ACTIONS
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS recovery_actions (
    action_id SERIAL PRIMARY KEY,

    transaction_id VARCHAR(50) NOT NULL,

    action_type VARCHAR(50) NOT NULL,

    channel VARCHAR(50),

    message_content TEXT,

    sent_at TIMESTAMP DEFAULT NOW(),

    status VARCHAR(30),

    metadata JSONB,

    CONSTRAINT fk_recovery_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE
);


-- ---------------------------------------------
-- CUSTOMER HISTORY
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS customer_history (
    customer_id VARCHAR(50),

    merchant_id VARCHAR(50),

    tenure_days INT DEFAULT 0,

    previous_success_rate DECIMAL(5, 4) DEFAULT 0,

    customer_value DECIMAL(12, 2) DEFAULT 0,

    opt_out_whatsapp BOOLEAN DEFAULT FALSE,

    opt_out_email BOOLEAN DEFAULT FALSE,

    opt_out_sms BOOLEAN DEFAULT FALSE,

    last_contact_at TIMESTAMP,

    contact_count_last_7_days INT DEFAULT 0,

    PRIMARY KEY (
        customer_id,
        merchant_id
    )
);


-- ---------------------------------------------
-- AUDIT LOG
-- ---------------------------------------------

CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,

    transaction_id VARCHAR(50),

    event_type VARCHAR(50),

    input_features JSONB,

    model_prediction DECIMAL(6, 5),

    rule_evaluations JSONB,

    action_taken VARCHAR(100),

    outcome VARCHAR(50),

    timestamp TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_audit_transaction
        FOREIGN KEY (transaction_id)
        REFERENCES transactions(transaction_id)
        ON DELETE CASCADE
);


-- ---------------------------------------------
-- INDEXES
-- ---------------------------------------------

CREATE INDEX IF NOT EXISTS idx_transactions_customer
ON transactions(customer_id);

CREATE INDEX IF NOT EXISTS idx_transactions_status
ON transactions(initial_status);

CREATE INDEX IF NOT EXISTS idx_transactions_timestamp
ON transactions(timestamp);

CREATE INDEX IF NOT EXISTS idx_audit_transaction
ON audit_log(transaction_id);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp
ON audit_log(timestamp);

CREATE INDEX IF NOT EXISTS idx_recovery_transaction
ON recovery_actions(transaction_id);