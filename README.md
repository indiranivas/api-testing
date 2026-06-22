# Unified Telemetry API

A modern, scalable telemetry collection system for tracking execution data across multiple services. Built with Node.js, Express, and PostgreSQL.

**Live API:** https://telemetry-api-96pk.onrender.com

**GitHub Repository:** https://github.com/indiranivas/api-testing

---

## 📋 Table of Contents

- [Overview](#overview)
- [Version History](#version-history)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Migration Guide (v1 to v2)](#migration-guide-v1-to-v2)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

---

## Overview

The Unified Telemetry API provides a centralized system for collecting, storing, and retrieving execution telemetry from any service or agent. Whether you're tracking Salesforce syncs, property registrations, CRM updates, or custom agent workflows, this API handles it all with a single, unified interface.

**Key Capabilities:**
- Send telemetry from unlimited services
- Store execution logs, metrics, and custom data
- Query historical data with pagination
- Get real-time service statistics
- Automatic table provisioning for new services
- RESTful API with standard HTTP methods

---

## Version History

### v2.0 (Current) - Unified Architecture ✨

**Release:** June 2026

**Major Changes:**
- Single unified `/telemetry` endpoint (instead of 3 separate endpoints)
- One bearer token for all services (instead of 3 API keys)
- Service type specified in `X-Service` header
- Automatic table creation for new services
- Service discovery and statistics endpoints
- Improved pagination and filtering
- Better logging and error handling

**Endpoints:**
```
POST   /telemetry                    — Send data
GET    /telemetry                    — Fetch data
DELETE /telemetry/:id               — Delete record
GET    /services                     — List all services
GET    /services/:service/stats      — Service statistics
GET    /health                       — Health check
```

**Authentication:**
```
Authorization: Bearer sk-telemetry-master-key-123
X-Service: salesforce (or any service name)
```

**Why v2.0?**
- Simpler integration (one endpoint, one token)
- Scales with unlimited services
- No API key rotation needed per service
- Centralized service management

---

### v1.0 (Legacy) - Multi-Endpoint Architecture

**Release:** May 2026

**Architecture:**
- 3 separate endpoints (one per service)
- 3 separate API keys
- Fixed table structure for Salesforce, Bhoomi, D365
- Manual API key management

**Endpoints:**
```
POST   /telemetry/salesforce         — Send Salesforce data
GET    /telemetry/salesforce         — Get Salesforce data
DELETE /telemetry/salesforce/:id     — Delete Salesforce record
(+ same for bhoomi and d365)
```

**Authentication:**
```
Authorization: Bearer sk-salesforce-123456
Authorization: Bearer sk-bhoomi-789abc
Authorization: Bearer sk-d365-xyz789
```

**Status:** ⚠️ Deprecated - Use v2.0 for new projects

**Upgrade to v2.0:** See [Migration Guide](#migration-guide-v1-to-v2)

---

## Features

### ✅ Core Features

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Telemetry Collection | ✅ | ✅ |
| PostgreSQL Backend | ✅ | ✅ |
| JSONB Payloads | ✅ | ✅ |
| Pagination | ❌ | ✅ |
| Multi-service Support | Limited (3) | Unlimited |
| Dynamic Tables | ❌ | ✅ |
| Service Discovery | ❌ | ✅ |
| Service Statistics | ❌ | ✅ |
| Single API Key | ❌ | ✅ |
| CORS Enabled | ✅ | ✅ |
| Large Payloads (50MB) | ✅ | ✅ |
| Automatic Indexing | ✅ | ✅ |

### 🚀 What's New in v2.0

**Simplified Integration**
- One endpoint, one token, unlimited services
- Specify service via header, not URL path

**Auto-Scaling**
- New services auto-create tables
- No manual database setup

**Better Analytics**
- Discover all services
- Get per-service statistics
- Track 24h and 7d record counts

**Improved Querying**
- Pagination with limit/offset
- Timestamp-based sorting
- Faster queries with automatic indexing

---

## Quick Start

### 1. Health Check

```bash
curl https://telemetry-api-96pk.onrender.com/health
```

### 2. Send Data

```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  -d '{
    "status": "success",
    "executionId": "sf-001",
    "responseTime": 250,
    "data": { "recordsProcessed": 100 }
  }'
```

**Response:**
```json
{
  "success": true,
  "service": "salesforce",
  "id": 45,
  "timestamp": "2026-06-09T10:06:05.604Z",
  "message": "Data saved to salesforce service"
}
```

### 3. Get Data

```bash
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  "https://telemetry-api-96pk.onrender.com/telemetry?limit=50&offset=0"
```

### 4. List Services

```bash
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services
```

---

## Installation

### Prerequisites
- Node.js 14+
- PostgreSQL 12+
- npm or yarn

### Local Setup

```bash
# Clone repository
git clone https://github.com/indiranivas/api-testing.git
cd api-testing

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL URL and bearer token

# Start server
npm start
```

Server runs on `http://localhost:8000`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

---

## API Reference

### Authentication

All endpoints (except `/health` and `/`) require:

**Header:**
```
Authorization: Bearer YOUR_BEARER_TOKEN
```

**Response if missing/invalid:**
```json
{
  "error": "Missing authorization header. Use: Authorization: Bearer YOUR_TOKEN"
}
```

### Send Telemetry

**POST /telemetry**

Send execution data to any service. Automatically creates table if service is new.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer sk-telemetry-master-key-123
X-Service: salesforce (or any service name)
```

**Request Body:**
```json
{
  "status": "success|failed|running",
  "executionId": "unique-execution-id",
  "responseTime": 250,
  "data": {
    "custom": "fields",
    "nested": {
      "objects": "supported"
    }
  }
}
```

**Success Response (201):**
```json
{
  "success": true,
  "service": "salesforce",
  "id": 45,
  "timestamp": "2026-06-09T10:06:05.604Z",
  "message": "Data saved to salesforce service"
}
```

**Error Responses:**

- 400 - Empty payload
  ```json
  { "success": false, "error": "Payload cannot be empty..." }
  ```

- 401 - Invalid token
  ```json
  { "error": "Invalid bearer token" }
  ```

- 500 - Database error
  ```json
  { "success": false, "error": "Database error details..." }
  ```

---

### Fetch Telemetry

**GET /telemetry**

Retrieve telemetry data for a service with pagination.

**Headers:**
```
Authorization: Bearer sk-telemetry-master-key-123
X-Service: salesforce
```

**Query Parameters:**
```
?limit=50      — Records per page (default: 50, max: 1000)
&offset=0      — Pagination offset (default: 0)
```

**Success Response (200):**
```json
{
  "service": "salesforce",
  "total": 150,
  "limit": 50,
  "offset": 0,
  "count": 50,
  "data": [
    {
      "id": 45,
      "timestamp": "2026-06-09T10:06:05.604Z",
      "payload": {
        "status": "success",
        "executionId": "sf-001",
        "responseTime": 250,
        "data": { "recordsProcessed": 100 }
      }
    }
    // ... more records
  ]
}
```

---

### Delete Record

**DELETE /telemetry/:id**

Delete a specific telemetry record.

**Headers:**
```
Authorization: Bearer sk-telemetry-master-key-123
X-Service: salesforce
```

**Success Response (200):**
```json
{
  "success": true,
  "service": "salesforce",
  "deletedId": 45,
  "message": "Record deleted from salesforce"
}
```

**Error Responses:**

- 400 - Invalid ID
  ```json
  { "success": false, "error": "Invalid id. Use a positive integer" }
  ```

- 404 - Record not found
  ```json
  { "success": false, "error": "Record 45 not found in salesforce" }
  ```

---

### List Services

**GET /services**

List all services and their metadata.

**Headers:**
```
Authorization: Bearer sk-telemetry-master-key-123
```

**Success Response (200):**
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
      "name": "custom-agent",
      "table": "custom_agent_telemetry",
      "records": 8,
      "lastUpdate": "2026-06-08T15:45:12.000Z"
    }
  ]
}
```

---

### Service Statistics

**GET /services/:service/stats**

Get statistics for a specific service.

**Headers:**
```
Authorization: Bearer sk-telemetry-master-key-123
```

**Success Response (200):**
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

---

### Health Check

**GET /health**

Check API and database connectivity.

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-09T10:06:05.604Z",
  "database": "connected"
}
```

**Error Response (500):**
```json
{
  "status": "error",
  "message": "Database connection failed"
}
```

---

### API Info

**GET /**

Get API documentation and endpoints.

**Response:**
```json
{
  "name": "Unified Telemetry API",
  "version": "2.0.0",
  "endpoints": { ... },
  "headers": { ... }
}
```

---

## Usage Examples

### JavaScript/Node.js

```javascript
const API_URL = "https://telemetry-api-96pk.onrender.com";
const BEARER_TOKEN = "sk-telemetry-master-key-123";

// Send telemetry
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
  return response.json();
}

// Fetch telemetry
async function fetchTelemetry(service, limit = 50) {
  const response = await fetch(
    `${API_URL}/telemetry?limit=${limit}`,
    {
      headers: {
        "Authorization": `Bearer ${BEARER_TOKEN}`,
        "X-Service": service
      }
    }
  );
  return response.json();
}

// List services
async function listServices() {
  const response = await fetch(`${API_URL}/services`, {
    headers: { "Authorization": `Bearer ${BEARER_TOKEN}` }
  });
  return response.json();
}

// Usage
await sendTelemetry("salesforce", {
  status: "success",
  executionId: "sf-sync-001",
  responseTime: 250,
  data: { recordsProcessed: 1000 }
});
```

### Python

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

def fetch_telemetry(service, limit=50):
    headers = {
        "Authorization": f"Bearer {BEARER_TOKEN}",
        "X-Service": service
    }
    response = requests.get(
        f"{API_URL}/telemetry?limit={limit}",
        headers=headers
    )
    return response.json()

# Usage
send_telemetry("salesforce", {
    "status": "success",
    "executionId": "sf-001",
    "responseTime": 250,
    "data": {"recordsProcessed": 100}
})
```

### cURL

```bash
# Send data
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  -d '{
    "status": "success",
    "executionId": "sf-001",
    "responseTime": 250,
    "data": {"recordsProcessed": 100}
  }'

# Fetch data
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  "https://telemetry-api-96pk.onrender.com/telemetry?limit=50"

# List services
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services

# Get stats
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services/salesforce/stats

# Delete record
curl -X DELETE \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  https://telemetry-api-96pk.onrender.com/telemetry/45
```

### Postman

**Import Collection:**
1. Open Postman
2. Create new requests for each endpoint
3. Set variables:
   ```
   @base_url = https://telemetry-api-96pk.onrender.com
   @token = sk-telemetry-master-key-123
   @service = salesforce
   ```
4. Use headers in all requests:
   - `Authorization: Bearer {{token}}`
   - `X-Service: {{service}}`

---

### Real-World Examples

**Salesforce Record Sync**
```json
{
  "status": "success",
  "executionId": "sf-sync-20260609-001",
  "responseTime": 1200,
  "data": {
    "recordsProcessed": 5000,
    "recordsCreated": 1200,
    "recordsUpdated": 3800,
    "errors": 0,
    "duration_seconds": 120
  }
}
```

**Property Registration (Bhoomi)**
```json
{
  "status": "success",
  "executionId": "bhoomi-batch-20260609-daily",
  "responseTime": 3600,
  "data": {
    "registrationsProcessed": 250,
    "registrationsApproved": 240,
    "registrationsPending": 10,
    "errors": 0,
    "batch_id": "batch-daily-001"
  }
}
```

**Agent Execution Logs**
```json
{
  "status": "success",
  "executionId": "agent-claude-01KTNXAJKFAMH6BV91DQVEN5GB",
  "responseTime": 5000,
  "data": {
    "agentId": "ddfed67c-f7ec-4330-ab7b-c85e8d70f6d7",
    "userId": "user@company.com",
    "taskCompleted": true,
    "outputTokens": 1250,
    "inputTokens": 850
  }
}
```

---

## Migration Guide (v1 to v2)

### What Changed

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Endpoint | `/telemetry/salesforce` | `/telemetry` |
| Service Key | In URL path | In `X-Service` header |
| API Key | Separate per service | One for all |
| New Service | Not supported | Auto-create table |
| Service Discovery | No | Yes (`/services`) |

### Migration Steps

#### Step 1: Update Bearer Token

**v1.0 - Multiple keys:**
```
Authorization: Bearer sk-salesforce-123456
Authorization: Bearer sk-bhoomi-789abc
Authorization: Bearer sk-d365-xyz789
```

**v2.0 - Single key:**
```
Authorization: Bearer sk-telemetry-master-key-123
```

#### Step 2: Update Endpoint

**v1.0:**
```
POST /telemetry/salesforce
POST /telemetry/bhoomi
POST /telemetry/d365
```

**v2.0:**
```
POST /telemetry
POST /telemetry
POST /telemetry
```

#### Step 3: Add X-Service Header

**v1.0 - No header needed:**
```bash
curl -X POST https://api.example.com/telemetry/salesforce \
  -H "Authorization: Bearer sk-salesforce-123456"
```

**v2.0 - Add X-Service header:**
```bash
curl -X POST https://api.example.com/telemetry \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce"
```

#### Step 4: Update GET/DELETE

**v1.0:**
```
GET  /telemetry/salesforce
GET  /telemetry/salesforce?limit=50&offset=0
DELETE /telemetry/salesforce/:id
```

**v2.0:**
```
GET  /telemetry
GET  /telemetry?limit=50&offset=0
DELETE /telemetry/:id
```

Always include `X-Service` header in v2.0.

#### Step 5: Test Migration

```bash
# Test v2.0 endpoint
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-telemetry-master-key-123" \
  -H "X-Service: salesforce" \
  -d '{"status":"success","executionId":"test-01"}'
```

#### JavaScript Migration Example

**v1.0:**
```javascript
async function sendToSalesforce(data) {
  return fetch('https://api.example.com/telemetry/salesforce', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-salesforce-123456',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

async function sendToBhoomi(data) {
  return fetch('https://api.example.com/telemetry/bhoomi', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk-bhoomi-789abc',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}
```

**v2.0 (Simplified):**
```javascript
const TOKEN = 'sk-telemetry-master-key-123';

async function sendTelemetry(service, data) {
  return fetch('https://api.example.com/telemetry', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'X-Service': service,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

// Usage for all services
sendTelemetry('salesforce', data);
sendTelemetry('bhoomi', data);
sendTelemetry('custom-agent', data); // Auto-creates table!
```

---

## Database Schema

### Table Structure

Each service gets its own table: `{service_name}_telemetry`

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

### Payload JSONB Format

Flexible schema - store any JSON structure:

```json
{
  "status": "success|failed|running",
  "executionId": "unique-id",
  "responseTime": 250,
  "data": {
    "custom": "fields",
    "nested": {
      "objects": "any structure"
    }
  }
}
```

### Example Tables

- `salesforce_telemetry` — Salesforce sync data
- `bhoomi_telemetry` — Property registration data
- `d365_telemetry` — CRM sync data
- `custom_agent_telemetry` — Custom agent logs
- `any_new_service_telemetry` — Any new service (auto-created)

---

## Authentication

### Bearer Token

Single token for all services:

```
Authorization: Bearer sk-telemetry-master-key-123
```

**Token Requirements:**
- Required for all endpoints (except `/health`, `/`)
- Must be in `Authorization` header
- Format: `Bearer {token}`

**Token Management:**
- Change `BEARER_TOKEN` environment variable
- Restart API
- All clients use same token

### Service Header

Specify which service is sending data:

```
X-Service: salesforce
X-Service: bhoomi
X-Service: d365
X-Service: custom-agent
X-Service: any-new-service
```

**Service Name Rules:**
- Alphanumeric and hyphens only
- Case-insensitive (converted to lowercase)
- Auto-creates table if new
- Max length: reasonable (no validation limit)

---

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Missing X-Service header | Add `X-Service: service-name` header |
| 400 | Invalid service name | Use alphanumeric + hyphens only |
| 400 | Empty payload | Send valid JSON in request body |
| 401 | Missing authorization | Add `Authorization: Bearer TOKEN` header |
| 401 | Invalid bearer token | Check token value |
| 404 | Record not found | Verify ID exists |
| 500 | Database error | Check database connection |

### Error Response Format

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

Or:

```json
{
  "error": "Error description"
}
```

### Debug Steps

1. Verify bearer token: `echo $BEARER_TOKEN`
2. Check X-Service header is present
3. Validate JSON payload: Use JSONLint.com
4. Test health endpoint: `GET /health`
5. Check server logs: `npm start`

---

## Deployment

### Render.com (Recommended)

1. **Connect GitHub repository**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Select `api-testing` repository

2. **Configure service**
   - Name: `telemetry-api`
   - Runtime: `Node`
   - Build command: `npm install`
   - Start command: `node server.js`

3. **Add environment variables**
   - `DATABASE_URL` = Your PostgreSQL URL
   - `BEARER_TOKEN` = Your secure token
   - `PORT` = 8000

4. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys on git push

5. **Get live URL**
   - API available at: `https://telemetry-api-xxxxxx.onrender.com`

### Docker Deployment

```bash
# Build image
docker build -t telemetry-api .

# Run container
docker run -e DATABASE_URL="..." \
           -e BEARER_TOKEN="..." \
           -p 8000:8000 \
           telemetry-api
```

### Environment Variables

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | - | `postgresql://user:pass@host/db` |
| `BEARER_TOKEN` | No | `sk-telemetry-master-key-123` | `sk-prod-xyz789` |
| `PORT` | No | `8000` | `3000` |

---

## Configuration

### .env File

**Template:**
```bash
# Server configuration
PORT=8000

# PostgreSQL connection
DATABASE_URL=postgresql://user:password@host/database

# Authentication
BEARER_TOKEN=sk-telemetry-master-key-123
```

**Render PostgreSQL Example:**
```
DATABASE_URL=postgresql://username:password@dpg-xxxxx-a.region-postgres.render.com/database_name
```

### Local Development

```bash
# Copy template
cp .env.example .env

# Edit with your values
nano .env

# Start server
npm start
```

### Environment-Specific Config

**Development:**
```
PORT=8000
BEARER_TOKEN=sk-dev-local-123
DATABASE_URL=postgresql://dev:password@localhost/telemetry_dev
```

**Production:**
```
PORT=8000
BEARER_TOKEN=sk-prod-xxxxx-secure-token
DATABASE_URL=postgresql://prod:password@dpg-xxxxx-render.com/telemetry_prod
```

---

## Troubleshooting

### Issue: Database Connection Failed

**Symptoms:** `Error: Database connection failed`

**Solutions:**
1. Verify `DATABASE_URL` environment variable
2. Check PostgreSQL is running
3. Verify credentials are correct
4. Test connection: `psql postgresql://...`
5. Check network firewall rules

### Issue: Empty Payload Saved

**Symptoms:** Data saved but fields are empty `{}`

**Solutions:**
1. Verify `Content-Type: application/json` header
2. Ensure JSON is valid (use JSONLint.com)
3. Check request body is not empty
4. View server logs: `npm start`

### Issue: 401 Unauthorized

**Symptoms:** `Invalid bearer token`

**Solutions:**
1. Verify bearer token value matches
2. Check header format: `Authorization: Bearer TOKEN`
3. Confirm token set in environment variables
4. Restart server after token change

### Issue: X-Service Header Not Recognized

**Symptoms:** `Missing X-Service header`

**Solutions:**
1. Add header: `X-Service: service-name`
2. Use lowercase service names
3. Use alphanumeric + hyphens only
4. Check header capitalization

### Issue: Slow Queries

**Symptoms:** Fetch telemetry takes long time

**Solutions:**
1. Use pagination: `?limit=50&offset=0`
2. Check database indices exist
3. Monitor database performance
4. Consider data archiving for old records

### Debug Mode

**Enable detailed logging:**
```bash
NODE_DEBUG=* npm start
```

**Check recent requests:**
```bash
curl -H "Authorization: Bearer sk-telemetry-master-key-123" \
  https://telemetry-api-96pk.onrender.com/services
```

**Query database directly:**
```bash
node query-db.js
```

---

## Support

### Getting Help

1. **Check Documentation** — Review this README first
2. **View Logs** — Run `npm start` and monitor output
3. **Test Endpoints** — Use cURL or Postman to verify
4. **Check GitHub Issues** — See https://github.com/indiranivas/api-testing/issues

### Reporting Issues

Include:
- Error message/response
- Request headers and body
- Service name
- Environment (local/production)
- Steps to reproduce

### Contributing

Contributions welcome! Please:
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

## Changelog

### v2.0 (June 2026)
- ✨ Unified single endpoint architecture
- ✨ One bearer token for all services
- ✨ Service type in X-Service header
- ✨ Auto-create tables for new services
- ✨ Service discovery (`/services`)
- ✨ Service statistics (`/services/:service/stats`)
- ✨ Pagination support
- 🔧 Improved error handling
- 🔧 Better logging and debugging
- 📊 Automatic timestamp indexing

### v1.0 (May 2026)
- ✅ Multi-endpoint API (3 endpoints)
- ✅ PostgreSQL backend
- ✅ JSONB flexible schema
- ✅ Record deletion
- ✅ CORS support

---

## License

MIT License — See LICENSE file for details

---

## Quick Links

- **API Documentation:** See [API Reference](#api-reference)
- **Usage Examples:** See [Usage Examples](#usage-examples)
- **Migration Guide:** See [Migration Guide](#migration-guide-v1-to-v2)
- **GitHub Repository:** https://github.com/indiranivas/api-testing
- **Live API:** https://telemetry-api-96pk.onrender.com

---

**Last Updated:** June 2026  
**API Version:** 2.0.0  
**Status:** Production Ready ✅
