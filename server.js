const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// PostgreSQL Connection Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const API_KEYS = {
    salesforce: process.env.SALESFORCE_API_KEY || "sk-salesforce-123456",
    bhoomi: process.env.BHOOMI_API_KEY || "sk-bhoomi-789abc",
    d365: process.env.D365_API_KEY || "sk-d365-xyz789"
};

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Initialize database tables
async function initializeDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS salesforce_telemetry (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payload JSONB
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bhoomi_telemetry (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payload JSONB
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS d365_telemetry (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payload JSONB
            )
        `);

        console.log("Database tables initialized");
    } catch (error) {
        console.error("Database initialization error:", error);
    }
}

// Initialize database on startup
initializeDatabase();

// --------------------------------------
// API Key Middleware (Per Service)
// --------------------------------------
function validateApiKey(service) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: `Missing API key for ${service}. Use Authorization: Bearer YOUR_API_KEY`
            });
        }

        const token = authHeader.replace("Bearer ", "");

        if (token !== API_KEYS[service]) {
            return res.status(401).json({
                error: `Invalid API key for ${service}`
            });
        }

        next();
    };
}

// Helper functions
function saveTelemetry(tableName, payload, res) {
    pool.query(
        `INSERT INTO ${tableName} (payload) VALUES ($1) RETURNING id`,
        [payload],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            return res.json({
                success: true,
                id: result.rows[0].id
            });
        }
    );
}

function fetchTelemetry(tableName, res) {
    pool.query(
        `SELECT id, timestamp, payload FROM ${tableName} ORDER BY id DESC`,
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    error: err.message
                });
            }

            const formatted = result.rows.map(row => ({
                id: row.id,
                timestamp: row.timestamp,
                payload: row.payload
            }));

            res.json(formatted);
        }
    );
}

// --------------------------------------
// Salesforce Endpoints
// --------------------------------------
app.post("/telemetry/salesforce", validateApiKey("salesforce"), (req, res) => {
    saveTelemetry(
        "salesforce_telemetry",
        req.body,
        res
    );
});

app.get("/telemetry/salesforce", validateApiKey("salesforce"), (req, res) => {
    fetchTelemetry("salesforce_telemetry", res);
});

// --------------------------------------
// Bhoomi Endpoints
// --------------------------------------
app.post("/telemetry/bhoomi", validateApiKey("bhoomi"), (req, res) => {
    saveTelemetry(
        "bhoomi_telemetry",
        req.body,
        res
    );
});

app.get("/telemetry/bhoomi", validateApiKey("bhoomi"), (req, res) => {
    fetchTelemetry("bhoomi_telemetry", res);
});

// --------------------------------------
// D365 Endpoints
// --------------------------------------
app.post("/telemetry/d365", validateApiKey("d365"), (req, res) => {
    saveTelemetry(
        "d365_telemetry",
        req.body,
        res
    );
});

app.get("/telemetry/d365", validateApiKey("d365"), (req, res) => {
    fetchTelemetry("d365_telemetry", res);
});

// Health Check
app.get("/health", (req, res) => {
    pool.query("SELECT NOW()", (err) => {
        if (err) {
            return res.status(500).json({
                status: "error",
                message: "Database connection failed"
            });
        }
        res.json({
            status: "ok",
            timestamp: new Date().toISOString()
        });
    });
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing pool");
    pool.end(() => {
        console.log("pool ended");
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Telemetry API running on port ${PORT}`);
    console.log("Connected to PostgreSQL database");
});
