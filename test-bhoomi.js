// Test script to send data to Bhoomi endpoint
// Set these environment variables before running:
// export API_URL="https://telemetry-api-96pk.onrender.com"
// export BHOOMI_API_KEY="your-api-key-here"

const API_URL = process.env.API_URL || "https://telemetry-api-96pk.onrender.com";
const BHOOMI_API_KEY = process.env.BHOOMI_API_KEY;

if (!BHOOMI_API_KEY) {
    console.error("Error: BHOOMI_API_KEY environment variable not set");
    console.error("Set it with: export BHOOMI_API_KEY='your-api-key'");
    process.exit(1);
}

// Test data - change this to your actual data
const testPayload = {
    status: "success",
    executionId: "bhoomi-test-2026-06-09-001",
    responseTime: 450,
    data: {
        registrationsProcessed: 250,
        registrationsApproved: 240,
        registrationsPending: 10,
        errors: 0,
        warnings: 0
    }
};

async function sendBhooomiTelemetry() {
    try {
        console.log("Sending Bhoomi telemetry...\n");
        console.log("URL:", `${API_URL}/telemetry/bhoomi`);
        console.log("Payload:", JSON.stringify(testPayload, null, 2));

        const response = await fetch(`${API_URL}/telemetry/bhoomi`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${BHOOMI_API_KEY}`
            },
            body: JSON.stringify(testPayload)
        });

        const data = await response.json();

        console.log("\nResponse Status:", response.status);
        console.log("Response:", JSON.stringify(data, null, 2));

        if (response.ok) {
            console.log("\n✅ Data sent successfully!");
            console.log(`Saved with ID: ${data.id}`);
        } else {
            console.log("\n❌ Error sending data");
        }
    } catch (error) {
        console.error("Request failed:", error.message);
    }
}

// Fetch and display latest Bhoomi data
async function fetchBhooomiData() {
    try {
        console.log("\n\n=== FETCHING LATEST BHOOMI DATA ===\n");

        const response = await fetch(`${API_URL}/telemetry/bhoomi`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${BHOOMI_API_KEY}`
            }
        });

        const data = await response.json();

        console.log(`Total records: ${data.length}\n`);

        data.slice(0, 5).forEach((record, index) => {
            console.log(`Record ${index + 1}:`);
            console.log(`  ID: ${record.id}`);
            console.log(`  Timestamp: ${record.timestamp}`);
            console.log(`  Payload:`, JSON.stringify(record.payload, null, 2));
            console.log("");
        });
    } catch (error) {
        console.error("Fetch failed:", error.message);
    }
}

// Run the tests
(async () => {
    await sendBhooomiTelemetry();
    await fetchBhooomiData();
})();
