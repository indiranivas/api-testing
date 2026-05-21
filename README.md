# Telemetry API

A lightweight, multi-agent telemetry collection system with SQLite backend. Store and track execution data from multiple services (Salesforce, Bhoomi, D365) with separate API keys and isolated data storage.

**Live API:** https://telemetry-api-96pk.onrender.com

## Features

- ✅ **Multi-Agent Support** — Separate endpoints for Salesforce, Bhoomi, and D365
- ✅ **API Key Authentication** — Unique API key per service for security
- ✅ **SQLite Backend** — Lightweight, no external dependencies
- ✅ **Isolated Data** — Each agent's data stored in separate tables
- ✅ **CORS Enabled** — Accept requests from any origin
- ✅ **Large Payload Support** — Handle up to 50MB JSON payloads
- ✅ **Live & Deployed** — Running on Render

## Quick Start

### Check if API is running
```bash
curl https://telemetry-api-96pk.onrender.com/health
```

Response:
```json
{
  "status": "ok"
}
```

## API Endpoints

### Health Check
```http
GET https://telemetry-api-96pk.onrender.com/health
```

### Salesforce
```http
POST https://telemetry-api-96pk.onrender.com/telemetry/salesforce
GET https://telemetry-api-96pk.onrender.com/telemetry/salesforce
```

### Bhoomi
```http
POST https://telemetry-api-96pk.onrender.com/telemetry/bhoomi
GET https://telemetry-api-96pk.onrender.com/telemetry/bhoomi
```

### D365
```http
POST https://telemetry-api-96pk.onrender.com/telemetry/d365
GET https://telemetry-api-96pk.onrender.com/telemetry/d365
```

## Authentication

All telemetry endpoints require an API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

**Valid Keys:**
- **Salesforce:** `sk-salesforce-123456`
- **Bhoomi:** `sk-bhoomi-789abc`
- **D365:** `sk-d365-xyz789`

## Usage Examples

### 1. Send Telemetry Data (POST)

**Salesforce Example:**
```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry/salesforce \
  -H "Authorization: Bearer sk-salesforce-123456" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "executionId": "exec-sf-001",
    "responseTime": 250,
    "data": {
      "recordsProcessed": 1000,
      "errors": 0,
      "timestamp": "2026-05-21T10:30:45Z"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "id": 1
}
```

**Bhoomi Example:**
```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry/bhoomi \
  -H "Authorization: Bearer sk-bhoomi-789abc" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "running",
    "executionId": "exec-bhoomi-042",
    "responseTime": 180,
    "data": {
      "recordsProcessed": 5000,
      "warnings": 2
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "id": 2
}
```

**D365 Example:**
```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry/d365 \
  -H "Authorization: Bearer sk-d365-xyz789" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "failed",
    "executionId": "exec-d365-789",
    "responseTime": 5000,
    "data": {
      "error": "Connection timeout",
      "retries": 3
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "id": 3
}
```

### 2. Fetch All Telemetry (GET)

**Salesforce:**
```bash
curl -H "Authorization: Bearer sk-salesforce-123456" \
  https://telemetry-api-96pk.onrender.com/telemetry/salesforce
```

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2026-05-21 10:30:45",
    "payload": {
      "status": "success",
      "executionId": "exec-sf-001",
      "responseTime": 250,
      "data": {
        "recordsProcessed": 1000,
        "errors": 0,
        "timestamp": "2026-05-21T10:30:45Z"
      }
    }
  }
]
```

**Bhoomi:**
```bash
curl -H "Authorization: Bearer sk-bhoomi-789abc" \
  https://telemetry-api-96pk.onrender.com/telemetry/bhoomi
```

**D365:**
```bash
curl -H "Authorization: Bearer sk-d365-xyz789" \
  https://telemetry-api-96pk.onrender.com/telemetry/d365
```

## Testing in Postman

### Create a new request:

1. **Set Method:** POST
2. **Set URL:** `https://telemetry-api-96pk.onrender.com/telemetry/salesforce`
3. **Add Header:**
   - Key: `Authorization`
   - Value: `Bearer sk-salesforce-123456`
4. **Set Body (raw, JSON):**
```json
{
  "status": "success",
  "executionId": "test-123",
  "responseTime": 250,
  "data": {
    "recordsProcessed": 1000,
    "errors": 0
  }
}
```
5. **Click Send**

### Fetch Data:

1. **Set Method:** GET
2. **Set URL:** `https://telemetry-api-96pk.onrender.com/telemetry/salesforce`
3. **Add Header:**
   - Key: `Authorization`
   - Value: `Bearer sk-salesforce-123456`
4. **Click Send**

## Payload Schema

The API accepts any JSON payload. Example:

```json
{
  "status": "running|success|failed",
  "executionId": "unique-identifier",
  "responseTime": 250,
  "data": {
    "recordsProcessed": 1000,
    "errors": 0,
    "warnings": 2,
    "custom": "any data"
  }
}
```

## Agent-Specific Examples

### Salesforce Agent
Tracking Salesforce record sync operations:
```json
{
  "status": "success",
  "executionId": "sf-sync-2026-05-21-001",
  "responseTime": 1200,
  "data": {
    "recordsProcessed": 5000,
    "recordsCreated": 1200,
    "recordsUpdated": 3800,
    "errors": 0
  }
}
```

### Bhoomi Agent
Tracking property registration operations:
```json
{
  "status": "success",
  "executionId": "bhoomi-reg-2026-05-21-001",
  "responseTime": 800,
  "data": {
    "registrationsProcessed": 150,
    "registrationsApproved": 140,
    "registrationsPending": 10,
    "errors": 0
  }
}
```

### D365 Agent
Tracking CRM synchronization:
```json
{
  "status": "success",
  "executionId": "d365-sync-2026-05-21-001",
  "responseTime": 600,
  "data": {
    "recordsProcessed": 2000,
    "recordsCreated": 500,
    "recordsUpdated": 1500,
    "errors": 0,
    "warnings": 5
  }
}
```

## Database Structure

**Tables:**
- `salesforce_telemetry` — Salesforce execution data
- `bhoomi_telemetry` — Bhoomi execution data
- `d365_telemetry` — D365 execution data

**Schema:**
```sql
CREATE TABLE salesforce_telemetry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    payload TEXT
);
```

## Error Handling

### Missing API Key
```json
{
  "error": "Missing API key for salesforce. Use Authorization: Bearer YOUR_API_KEY"
}
```
Status: `401 Unauthorized`

### Invalid API Key
```json
{
  "error": "Invalid API key for salesforce"
}
```
Status: `401 Unauthorized`

### Server Error
```json
{
  "success": false,
  "error": "Error message"
}
```
Status: `500 Internal Server Error`

## JavaScript Client Example

```javascript
// Send telemetry
async function sendTelemetry(agent, data) {
  const apiKeys = {
    salesforce: 'sk-salesforce-123456',
    bhoomi: 'sk-bhoomi-789abc',
    d365: 'sk-d365-xyz789'
  };

  const response = await fetch(
    `https://telemetry-api-96pk.onrender.com/telemetry/${agent}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKeys[agent]}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }
  );

  return await response.json();
}

// Usage
sendTelemetry('salesforce', {
  status: 'success',
  executionId: 'exec-123',
  responseTime: 250,
  data: { recordsProcessed: 1000 }
});
```

## Python Client Example

```python
import requests
import json

def send_telemetry(agent, data):
    api_keys = {
        'salesforce': 'sk-salesforce-123456',
        'bhoomi': 'sk-bhoomi-789abc',
        'd365': 'sk-d365-xyz789'
    }
    
    headers = {
        'Authorization': f"Bearer {api_keys[agent]}",
        'Content-Type': 'application/json'
    }
    
    response = requests.post(
        f'https://telemetry-api-96pk.onrender.com/telemetry/{agent}',
        headers=headers,
        json=data
    )
    
    return response.json()

# Usage
result = send_telemetry('salesforce', {
    'status': 'success',
    'executionId': 'exec-123',
    'responseTime': 250,
    'data': {'recordsProcessed': 1000}
})
print(result)
```

## Local Development

### Clone from GitHub
```bash
git clone https://github.com/indiranivas/api-testing.git
cd api-testing
```

### Install & Run Locally
```bash
npm install
npm start
```

Server runs on `http://localhost:8000`

### Development Mode (auto-restart)
```bash
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | Server port |
| SALESFORCE_API_KEY | sk-salesforce-123456 | Salesforce API key |
| BHOOMI_API_KEY | sk-bhoomi-789abc | Bhoomi API key |
| D365_API_KEY | sk-d365-xyz789 | D365 API key |

## Deployment

This API is deployed on **Render** at: https://telemetry-api-96pk.onrender.com

### To Deploy Your Own:
1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set build command: `npm install`
6. Set start command: `node server.js`
7. Add environment variables
8. Deploy!

## Monitoring

Check API health:
```bash
curl https://telemetry-api-96pk.onrender.com/health
```

## Next Steps

- [ ] Build agent clients (SDKs)
- [ ] Add analytics/aggregation endpoints
- [ ] Create dashboard for data visualization
- [ ] Add data pagination and filtering
- [ ] Implement data export (CSV/JSON)
- [ ] Add advanced querying capabilities

## Support

For issues:
1. Check the error response
2. Verify API key is correct
3. Ensure Authorization header format: `Bearer YOUR_API_KEY`
4. Check GitHub repo: https://github.com/indiranivas/api-testing

## License

MIT
