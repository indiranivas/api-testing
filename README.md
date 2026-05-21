# Telemetry API

A lightweight, multi-agent telemetry collection system with SQLite backend. Store and track execution data from multiple services (Salesforce, Bhoomi, D365) with separate API keys and isolated data storage.

## Features

- ✅ **Multi-Agent Support** — Separate endpoints for Salesforce, Bhoomi, and D365
- ✅ **API Key Authentication** — Unique API key per service for security
- ✅ **SQLite Backend** — Lightweight, no external dependencies
- ✅ **Isolated Data** — Each agent's data stored in separate tables
- ✅ **CORS Enabled** — Accept requests from any origin
- ✅ **Large Payload Support** — Handle up to 50MB JSON payloads

## Installation

### Prerequisites
- Node.js 14+ 
- npm

### Setup

1. **Clone/Download the project**
```bash
cd telemetry_sdk_v2
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure API keys** (optional)
Edit `.env` to change API keys:
```
PORT=8000
SALESFORCE_API_KEY=sk-salesforce-123456
BHOOMI_API_KEY=sk-bhoomi-789abc
D365_API_KEY=sk-d365-xyz789
```

4. **Start the server**
```bash
npm start
```

Server will run on `http://localhost:8000`

## API Endpoints

### Health Check
```http
GET http://localhost:8000/health
```

### Salesforce
```http
POST http://localhost:8000/telemetry/salesforce
GET http://localhost:8000/telemetry/salesforce
```

### Bhoomi
```http
POST http://localhost:8000/telemetry/bhoomi
GET http://localhost:8000/telemetry/bhoomi
```

### D365
```http
POST http://localhost:8000/telemetry/d365
GET http://localhost:8000/telemetry/d365
```

## Authentication

All telemetry endpoints require an API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

**Valid Keys:**
- Salesforce: `sk-salesforce-123456`
- Bhoomi: `sk-bhoomi-789abc`
- D365: `sk-d365-xyz789`

## Usage Examples

### Send Telemetry (POST)

**Request:**
```bash
curl -X POST http://localhost:8000/telemetry/salesforce \
  -H "Authorization: Bearer sk-salesforce-123456" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "running",
    "executionId": "exec-123",
    "responseTime": 250,
    "data": {
      "recordsProcessed": 1000,
      "errors": 0
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

### Fetch Telemetry (GET)

**Request:**
```bash
curl -H "Authorization: Bearer sk-salesforce-123456" \
  http://localhost:8000/telemetry/salesforce
```

**Response:**
```json
[
  {
    "id": 1,
    "timestamp": "2026-05-21 10:30:45",
    "payload": {
      "status": "running",
      "executionId": "exec-123",
      "responseTime": 250,
      "data": {
        "recordsProcessed": 1000,
        "errors": 0
      }
    }
  }
]
```

## Payload Schema

The API accepts any JSON payload. Example structure:

```json
{
  "status": "running|success|failed",
  "executionId": "unique-id",
  "responseTime": 250,
  "data": {
    "custom": "anything",
    "recordsProcessed": 1000,
    "errors": 0
  }
}
```

## Database

SQLite database file: `telemetry.db`

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

## Testing in Postman

1. **Import Collection** (create new requests manually for now)
2. **Set up requests for each service:**

   **POST Request:**
   - Method: POST
   - URL: `http://localhost:8000/telemetry/salesforce`
   - Headers: `Authorization: Bearer sk-salesforce-123456`
   - Body (raw JSON): Your payload

   **GET Request:**
   - Method: GET
   - URL: `http://localhost:8000/telemetry/salesforce`
   - Headers: `Authorization: Bearer sk-salesforce-123456`

3. **Click Send** to test

## Development

### Running in Development Mode
```bash
npm run dev
```
This uses nodemon to auto-restart on file changes.

### Project Structure
```
telemetry_sdk_v2/
├── server.js          # Main API server
├── package.json       # Dependencies
├── .env              # Configuration (API keys, port)
├── .gitignore        # Git ignore rules
├── telemetry.db      # SQLite database (created on first run)
└── README.md         # This file
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 8000 | Server port |
| SALESFORCE_API_KEY | sk-salesforce-123456 | Salesforce API key |
| BHOOMI_API_KEY | sk-bhoomi-789abc | Bhoomi API key |
| D365_API_KEY | sk-d365-xyz789 | D365 API key |

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

## Troubleshooting

**Server won't start:**
- Check if port 8000 is in use: `lsof -i :8000` (Mac/Linux) or `netstat -ano | findstr :8000` (Windows)
- Change PORT in `.env` to a different port

**Database locked error:**
- Close other connections to `telemetry.db`
- Delete `telemetry.db` to reset (data will be lost)

**401 Unauthorized errors:**
- Verify API key in Authorization header
- Check `.env` file for correct keys
- Restart server after changing `.env`

**CORS errors:**
- CORS is enabled for all origins by default
- Requests from any domain should work

## Next Steps

- [ ] Deploy to production (Railway, Render, Heroku)
- [ ] Add analytics endpoints (stats, aggregations)
- [ ] Create dashboard UI
- [ ] Build client SDK for agents
- [ ] Add data pagination
- [ ] Implement data export (CSV/JSON)

## License

MIT

## Support

For issues or questions, check the troubleshooting section or review the API endpoint examples.
