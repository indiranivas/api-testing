const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function getBhooomiData() {
    try {
        const result = await pool.query(
            "SELECT id, timestamp, payload FROM bhoomi_telemetry ORDER BY id DESC LIMIT 20"
        );

        console.log("\n=== BHOOMI TELEMETRY DATA ===\n");
        console.log(`Total records: ${result.rows.length}\n`);

        result.rows.forEach((row, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(`  ID: ${row.id}`);
            console.log(`  Timestamp: ${row.timestamp}`);
            console.log(`  Payload:`, JSON.stringify(row.payload, null, 2));
            console.log("---");
        });

        await pool.end();
    } catch (error) {
        console.error("Error querying database:", error);
        process.exit(1);
    }
}

getBhooomiData();
