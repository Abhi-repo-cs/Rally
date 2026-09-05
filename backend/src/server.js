const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const transactionRoutes = require("./routes/transactions");

const app = express();

// ---------------------------------------------
// MIDDLEWARE
// ---------------------------------------------

app.use(cors());

app.use(express.json());

// ---------------------------------------------
// ROUTES
// ---------------------------------------------

app.get("/", (req, res) => {
  res.json({
    service: "Rally Backend",
    status: "running",
    version: "1.0.0",
  });
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS database_time"
    );

    res.json({
      status: "ok",
      service: "Rally Backend",
      database: "connected",
      timestamp: result.rows[0].database_time,
    });

  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(500).json({
      status: "error",
      service: "Rally Backend",
      database: "disconnected",
      message: error.message,
    });
  }
});

// Transaction API
app.use(
  "/api/transactions",
  transactionRoutes
);

// ---------------------------------------------
// 404 HANDLER
// ---------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
  });
});

// ---------------------------------------------
// ERROR HANDLER
// ---------------------------------------------

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);

  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("PostgreSQL connection verified");

    app.listen(PORT, () => {
      console.log("");
      console.log("======================================");
      console.log("           RALLY BACKEND");
      console.log("======================================");
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
      console.log(
        `Transactions: http://localhost:${PORT}/api/transactions/failed`
      );
      console.log("======================================");
      console.log("");
    });

  } catch (error) {
    console.error(
      "Unable to connect to PostgreSQL:"
    );

    console.error(error.message);

    process.exit(1);
  }
}

startServer();