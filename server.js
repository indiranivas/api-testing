const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

const API_KEYS = {
    salesforce: process.env.SALESFORCE_API_KEY || "sk-salesforce-123456",
    bhoomi: process.env.BHOOMI_API_KEY || "sk-bhoomi-789abc",
    d365: process.env.D365_API_KEY || "sk-d365-xyz789"
};

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// SQLite DB
const db = new sqlite3.Database("./telemetry.db");

// Create tables
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS salesforce_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        payload TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS bhoomi_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        payload TEXT
    )
    `);

    db.run(`
    CREATE TABLE IF NOT EXISTS d365_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        payload TEXT
    )
    `);
});

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

// --------------------------------------
// Helper functions
//--------------------------------------
function saveTelemetry(tableName, payload, res) {
    db.run(
        `INSERT INTO ${tableName} (payload) VALUES (?)`,
        [JSON.stringify(payload)],
        function (err) {
            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            return res.json({
                success: true,
                id: this.lastID
            });
        }
    );
}

function fetchTelemetry(tableName, res) {
    db.all(
        `SELECT * FROM ${tableName} ORDER BY id DESC`,
        [],
        (err, rows) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const formatted = rows.map(row => ({
                id: row.id,
                timestamp: row.timestamp,
                payload: JSON.parse(row.payload)
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


// Health
app.get("/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.listen(PORT, () => {
    console.log(
        `Telemetry API running on ${PORT}`
    );
});
