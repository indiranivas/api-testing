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

// Single API Key
const BEARER_TOKEN = process.env.BEARER_TOKEN || "sk-telemetry-master-key-123";

app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Track created services
const createdServices = new Set();

// Request logging middleware
app.use((req, res, next) => {
    if (req.path.startsWith("/telemetry") || req.path.startsWith("/services")) {
        console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
        console.log("Headers:", {
            "content-type": req.headers["content-type"],
            "x-service": req.headers["x-service"],
            "authorization": req.headers["authorization"] ? "Bearer ***" : "missing"
        });
        console.log("Body Size:", JSON.stringify(req.body).length, "bytes");
    }
    next();
});

// API Key Middleware
function validateBearerToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: "Missing authorization header. Use: Authorization: Bearer YOUR_TOKEN"
        });
    }

    const token = authHeader.replace("Bearer ", "");

    if (token !== BEARER_TOKEN) {
        return res.status(401).json({
            error: "Invalid bearer token"
        });
    }

    next();
}

// Validate service header
function validateServiceHeader(req, res, next) {
    const service = req.headers["x-service"];

    if (!service) {
        return res.status(400).json({
            error: "Missing X-Service header. Specify service: X-Service: salesforce"
        });
    }

    // Sanitize service name (alphanumeric and hyphens only)
    if (!/^[a-zA-Z0-9-]+$/.test(service)) {
        return res.status(400).json({
            error: "Invalid service name. Use alphanumeric characters and hyphens only."
        });
    }

    req.service = service.toLowerCase();
    req.tableName = `${req.service}_telemetry`;
    next();
}

// Dynamically create table for service
async function ensureTableExists(tableName) {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS ${tableName} (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                payload JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create index for faster queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_${tableName}_timestamp
            ON ${tableName}(timestamp DESC)
        `);

        if (!createdServices.has(tableName)) {
            createdServices.add(tableName);
            console.log(`✅ Table created/verified: ${tableName}`);
        }
    } catch (error) {
        console.error(`Error creating table ${tableName}:`, error.message);
        throw error;
    }
}

// Save telemetry data
async function saveTelemetry(req, res) {
    const { service, tableName } = req;
    const payload = req.body;

    // Validate payload
    if (!payload || Object.keys(payload).length === 0) {
        return res.status(400).json({
            success: false,
            error: "Payload cannot be empty. Send valid JSON data in request body."
        });
    }

    try {
        // Ensure table exists
        await ensureTableExists(tableName);

        console.log(`\n>>> Saving to ${tableName}`);
        console.log("Payload:", JSON.stringify(payload, null, 2));

        const result = await pool.query(
            `INSERT INTO ${tableName} (payload) VALUES ($1) RETURNING id, timestamp, payload`,
            [payload]
        );

        const savedRecord = result.rows[0];
        console.log("✅ Saved successfully!");
        console.log("Record ID:", savedRecord.id);

        res.status(201).json({
            success: true,
            service: service,
            id: savedRecord.id,
            timestamp: savedRecord.timestamp,
            message: `Data saved to ${service} service`
        });
    } catch (error) {
        console.error("Error saving telemetry:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Fetch telemetry data
async function fetchTelemetry(req, res) {
    const { tableName, service } = req;
    const limit = Math.min(parseInt(req.query.limit) || 50, 1000);
    const offset = parseInt(req.query.offset) || 0;

    try {
        await ensureTableExists(tableName);

        const result = await pool.query(
            `SELECT id, timestamp, payload FROM ${tableName}
             ORDER BY id DESC LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM ${tableName}`
        );

        res.json({
            service: service,
            total: parseInt(countResult.rows[0].total),
            limit: limit,
            offset: offset,
            count: result.rows.length,
            data: result.rows.map(row => ({
                id: row.id,
                timestamp: row.timestamp,
                payload: row.payload
            }))
        });
    } catch (error) {
        console.error("Error fetching telemetry:", error.message);
        res.status(500).json({
            error: error.message
        });
    }
}

// Delete telemetry record
async function deleteTelemetry(req, res) {
    const { tableName, service } = req;
    const id = parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            error: "Invalid id. Use a positive integer"
        });
    }

    try {
        await ensureTableExists(tableName);

        const result = await pool.query(
            `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: `Record ${id} not found in ${service}`
            });
        }

        res.json({
            success: true,
            service: service,
            deletedId: result.rows[0].id,
            message: `Record deleted from ${service}`
        });
    } catch (error) {
        console.error("Error deleting telemetry:", error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}

// Get all services
app.get("/services", validateBearerToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name LIKE '%_telemetry'
            ORDER BY table_name
        `);

        const services = [];

        for (const row of result.rows) {
            const tableName = row.table_name;
            const service = tableName.replace("_telemetry", "");

            const countResult = await pool.query(
                `SELECT COUNT(*) as total FROM ${tableName}`
            );

            const latestResult = await pool.query(
                `SELECT timestamp FROM ${tableName} ORDER BY id DESC LIMIT 1`
            );

            services.push({
                name: service,
                table: tableName,
                records: parseInt(countResult.rows[0].total),
                lastUpdate: latestResult.rows[0]?.timestamp || null
            });
        }

        res.json({
            total_services: services.length,
            services: services
        });
    } catch (error) {
        console.error("Error fetching services:", error.message);
        res.status(500).json({
            error: error.message
        });
    }
});

// Get service stats
app.get("/services/:service/stats", validateBearerToken, async (req, res) => {
    const service = req.params.service.toLowerCase();
    const tableName = `${service}_telemetry`;

    try {
        await ensureTableExists(tableName);

        const result = await pool.query(`
            SELECT
                COUNT(*) as total_records,
                MIN(timestamp) as first_record,
                MAX(timestamp) as last_record,
                COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '24 hours') as records_24h,
                COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '7 days') as records_7d
            FROM ${tableName}
        `);

        const stats = result.rows[0];

        res.json({
            service: service,
            stats: {
                totalRecords: parseInt(stats.total_records),
                firstRecord: stats.first_record,
                lastRecord: stats.last_record,
                last24Hours: parseInt(stats.records_24h),
                last7Days: parseInt(stats.records_7d)
            }
        });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).json({
            error: error.message
        });
    }
});

// Main telemetry endpoints
app.post(
    "/telemetry",
    validateBearerToken,
    validateServiceHeader,
    saveTelemetry
);

app.get(
    "/telemetry",
    validateBearerToken,
    validateServiceHeader,
    fetchTelemetry
);

app.delete(
    "/telemetry/:id",
    validateBearerToken,
    validateServiceHeader,
    deleteTelemetry
);

// Health check
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT NOW()");
        res.json({
            status: "ok",
            timestamp: new Date().toISOString(),
            database: "connected"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Database connection failed"
        });
    }
});

// API info
app.get("/", (req, res) => {
    res.json({
        name: "Unified Telemetry API",
        version: "2.0.0",
        endpoints: {
            "POST /telemetry": "Send telemetry data (requires X-Service header)",
            "GET /telemetry": "Fetch telemetry data (requires X-Service header)",
            "DELETE /telemetry/:id": "Delete record (requires X-Service header)",
            "GET /services": "List all services and their record counts",
            "GET /services/:service/stats": "Get stats for a specific service",
            "GET /health": "Health check"
        },
        headers: {
            "Authorization": "Bearer YOUR_TOKEN (required)",
            "X-Service": "Service name - salesforce, bhoomi, d365, or any new service (required for /telemetry)"
        }
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
    console.log(`🚀 Telemetry API running on port ${PORT}`);
    console.log(`📊 Connected to PostgreSQL database`);
    console.log(`🔐 Using unified bearer token authentication`);
    console.log(`📖 Visit http://localhost:${PORT} for API documentation`);
});
