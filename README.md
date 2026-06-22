# Unified Telemetry API v2.0

A powerful, single-endpoint telemetry collection system with PostgreSQL backend. Send data from any service using one API key, and automatically create tables for new services.

**Live API:** https://telemetry-api-96pk.onrender.com

## Features

- ✅ **Single Unified Endpoint** — One `/telemetry` endpoint for all services
- ✅ **One Bearer Token** — Single authentication for all services
- ✅ **Dynamic Table Creation** — Automatically create tables for new services
- ✅ **Service Discovery** — List all services and their stats
- ✅ **PostgreSQL Backend** — JSONB support for flexible schemas
- ✅ **Automatic Indexing** — Fast queries on timestamps
- ✅ **CORS Enabled** — Accept requests from any origin
- ✅ **Large Payload Support** — Handle up to 50MB JSON payloads

## Quick Start

### Health Check
```bash
curl https://telemetry-api-96pk.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

## API Endpoints

### Send Telemetry (POST)
```http
POST https://telemetry-api-96pk.onrender.com/telemetry
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN
  X-Service: salesforce
Body:
  { actual JSON data }
```

### Fetch Telemetry (GET)
```http
GET https://telemetry-api-96pk.onrender.com/telemetry
Headers:
  Authorization: Bearer YOUR_TOKEN
  X-Service: salesforce
Query Parameters:
  ?limit=50&offset=0
```

### Delete Record (DELETE)
```http
DELETE https://telemetry-api-96pk.onrender.com/telemetry/:id
Headers:
  Authorization: Bearer YOUR_TOKEN
  X-Service: salesforce
```

### List All Services (GET)
```http
GET https://telemetry-api-96pk.onrender.com/services
Headers:
  Authorization: Bearer YOUR_TOKEN
```

Response:
```json
{
  "total_services": 3,
  "services": [
    {
      "name": "salesforce",
      "table": "salesforce_telemetry",
      "records": 150,
      "lastUpdate": "2026-06-09T10:06:05.604Z"
    },
    {
      "name": "bhoomi",
      "table": "bhoomi_telemetry",
      "records": 42,
      "lastUpdate": "2026-06-09T09:20:34.189Z"
    },
    {
      "name": "d365",
      "table": "d365_telemetry",
      "records": 28,
      "lastUpdate": "2026-06-08T15:45:12.000Z"
    }
  ]
}
```

### Service Stats (GET)
```http
GET https://telemetry-api-96pk.onrender.com/services/salesforce/stats
Headers:
  Authorization: Bearer YOUR_TOKEN
```

Response:
```json
{
  "service": "salesforce",
  "stats": {
    "totalRecords": 150,
    "firstRecord": "2026-05-21T10:30:45.000Z",
    "lastRecord": "2026-06-09T10:06:05.604Z",
    "last24Hours": 45,
    "last7Days": 128
  }
}
```

## Authentication

**Single Bearer Token:**
```
Authorization: Bearer sk-telemetry-master-key-123
```

Use this token for all services. No separate keys needed!

## Service Header

**Required for all /telemetry endpoints:**
```
X-Service: service-name
```

Examples:
- `X-Service: salesforce`
- `X-Service: bhoomi`
- `X-Service: d365`
- `X-Service: custom-agent`
- `X-Service: any-new-service` (automatically creates table)

## Usage Examples

### Send Data from Salesforce

```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  -d '{
    "status": "success",
    "executionId": "sf-sync-001",
    "responseTime": 250,
    "data": {
      "recordsProcessed": 1000,
      "recordsCreated": 200,
      "recordsUpdated": 800
    }
  }'
```

Response:
```json
{
  "success": true,
  "service": "salesforce",
  "id": 45,
  "timestamp": "2026-06-09T10:06:05.604Z",
  "message": "Data saved to salesforce service"
}
```

### Send Data from New Service

```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: custom-agent" \
  -d '{
    "status": "running",
    "agentId": "agent-123",
    "taskId": "task-456"
  }'
```

**Result:** New table `custom_agent_telemetry` is automatically created! ✅

### Fetch Data with Pagination

```bash
# Get first 50 records
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  "https://telemetry-api-96pk.onrender.com/telemetry?limit=50&offset=0"

# Get next 50 records
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  "https://telemetry-api-96pk.onrender.com/telemetry?limit=50&offset=50"
```

### Delete a Record

```bash
curl -X DELETE \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  "https://telemetry-api-96pk.onrender.com/telemetry/45"
```

### List All Services

```bash
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services
```

### Get Service Statistics

```bash
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services/salesforce/stats
```

## Postman Examples

### POST Request Setup
1. **Method:** POST
2. **URL:** `https://telemetry-api-96pk.onrender.com/telemetry`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer sk-telemetry-master-key-123`
   - `X-Service: salesforce`
4. **Body (raw JSON):**
   ```json
   {
     "status": "success",
     "executionId": "test-001",
     "responseTime": 250,
     "data": {
       "recordsProcessed": 100
     }
   }
   ```

### GET Request Setup
1. **Method:** GET
2. **URL:** `https://telemetry-api-96pk.onrender.com/telemetry?limit=50&offset=0`
3. **Headers:**
   - `Authorization: Bearer sk-telemetry-master-key-123`
   - `X-Service: salesforce`

## JavaScript Client

```javascript
const API_URL = "https://telemetry-api-96pk.onrender.com";
const BEARER_TOKEN = "sk-telemetry-master-key-123";

async function sendTelemetry(service, data) {
  const response = await fetch(`${API_URL}/telemetry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BEARER_TOKEN}`,
      "X-Service": service
    },
    body: JSON.stringify(data)
  });
  return await response.json();
}

async function fetchTelemetry(service, limit = 50, offset = 0) {
  const response = await fetch(
    `${API_URL}/telemetry?limit=${limit}&offset=${offset}`,
    {
      headers: {
        "Authorization": `Bearer ${BEARER_TOKEN}`,
        "X-Service": service
      }
    }
  );
  return await response.json();
}

async function listServices() {
  const response = await fetch(`${API_URL}/services`, {
    headers: {
      "Authorization": `Bearer ${BEARER_TOKEN}`
    }
  });
  return await response.json();
}

// Usage
await sendTelemetry("salesforce", {
  status: "success",
  executionId: "sf-001",
  data: { recordsProcessed: 100 }
});
```

## Python Client

```python
import requests

API_URL = "https://telemetry-api-96pk.onrender.com"
BEARER_TOKEN = "sk-telemetry-master-key-123"

def send_telemetry(service, data):
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "X-Service": service
    }
    response = requests.post(
        f"{API_URL}/telemetry",
        json=data,
        headers=headers
    )
    return response.json()

def fetch_telemetry(service, limit=50, offset=0):
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "X-Service": service
    }
    response = requests.get(
        f"{API_URL}/telemetry?limit={limit}&offset={offset}",
        headers=headers
    )
    return response.json()

def list_services():
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}"
    }
    response = requests.get(
        f"{API_URL}/services",
        headers=headers
    )
    return response.json()

# Usage
send_telemetry("salesforce", {
    "status": "success",
    "executionId": "sf-001",
    "data": {"recordsProcessed": 100}
})
```

## Database Structure

**Automatically Created Tables:**
- `{service}_telemetry` — For each service

**Schema:**
```sql
CREATE TABLE {service}_telemetry (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_{service}_telemetry_timestamp 
ON {service}_telemetry(timestamp DESC);
```

## Error Handling

### Missing Authorization
```json
{
  "error": "Missing authorization header. Use: Authorization: Bearer YOUR_TOKEN"
}
```
Status: `401`

### Invalid Token
```json
{
  "error": "Invalid bearer token"
}
```
Status: `401`

### Missing X-Service Header
```json
{
  "error": "Missing X-Service header. Specify service: X-Service: salesforce"
}
```
Status: `400`

### Empty Payload
```json
{
  "success": false,
  "error": "Payload cannot be empty. Send valid JSON data in request body."
}
```
Status: `400`

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | Server port |
| DATABASE_URL | - | PostgreSQL connection string |
| BEARER_TOKEN | sk-telemetry-master-key-123 | Authentication token |

## Local Development

### Install
```bash
npm install
```

### Run
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

## Deployment

This API is deployed on **Render** at: https://telemetry-api-96pk.onrender.com

### Environment Variables on Render
1. Go to your Render service dashboard
2. Add:
   ```
   DATABASE_URL=your-postgresql-url
   BEARER_TOKEN=your-secure-token
   ```
3. Redeploy

## Features Included

- ✅ Single unified endpoint
- ✅ Dynamic table creation for new services
- ✅ Service discovery with stats
- ✅ Pagination support
- ✅ Record deletion
- ✅ Automatic timestamp indexing
- ✅ JSONB flexible schema
- ✅ Request logging
- ✅ Error handling
- ✅ Health checks
- ✅ CORS enabled

## What's New in v2.0

✨ **Unified Architecture:**
- One endpoint instead of 3
- One bearer token instead of 3 API keys
- Service type in header

🚀 **Auto Service Discovery:**
- New services auto-create tables
- List all services
- Get service statistics

📊 **Better Analytics:**
- Record counts per service
- Last update timestamps
- 24-hour and 7-day stats

🔍 **Improved Querying:**
- Pagination support
- Timestamp indexing
- Better performance

## Next Steps

- Monitor service usage with `/services` endpoint
- Set up data retention policies
- Build analytics dashboard
- Implement webhooks for alerts
- Add data export features

## Support

For help:
1. Check error responses
2. Verify bearer token and X-Service header
3. Ensure JSON is valid
4. Check server logs: `npm start`
5. Query database: `node query-db.js`

## License

MIT
