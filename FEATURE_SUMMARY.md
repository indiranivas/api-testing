# Unified Telemetry API v2.0 - Feature Summary

## 🎯 Feature/Product Name

**Unified Telemetry API v2.0** — A centralized telemetry collection and retrieval system for tracking execution data across unlimited services.

---

## 📝 What It Does

A modern REST API that allows any service or agent to:
- **Send** execution telemetry (status, metrics, logs, custom data)
- **Store** data in PostgreSQL with JSONB flexible schema
- **Retrieve** historical data with pagination
- **Analyze** per-service statistics and metrics
- **Auto-scale** with dynamic table creation for new services

**Use Cases:**
- Track Salesforce record sync operations
- Monitor property registration workflows (Bhoomi)
- Log CRM synchronization (D365)
- Capture AI agent execution logs
- Store custom agent workflows
- Build analytics dashboards

---

## 🔌 Endpoints & Capabilities

### Core Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| **POST** | `/telemetry` | Send telemetry data | Bearer Token + X-Service |
| **GET** | `/telemetry` | Fetch telemetry (with pagination) | Bearer Token + X-Service |
| **DELETE** | `/telemetry/:id` | Delete specific record | Bearer Token + X-Service |
| **GET** | `/services` | List all services | Bearer Token |
| **GET** | `/services/:service/stats` | Get service statistics | Bearer Token |
| **GET** | `/health` | Health check | None |
| **GET** | `/` | API info | None |

### Request/Response Examples

**Send Data:**
```
POST /telemetry
Headers:
  Authorization: Bearer sk-telemetry-master-key-123
  X-Service: salesforce
  Content-Type: application/json

Body:
{
  "status": "success",
  "executionId": "sf-sync-001",
  "responseTime": 250,
  "data": { "recordsProcessed": 1000 }
}

Response (201):
{
  "success": true,
  "service": "salesforce",
  "id": 45,
  "timestamp": "2026-06-09T10:06:05.604Z",
  "message": "Data saved to salesforce service"
}
```

**Fetch Data:**
```
GET /telemetry?limit=50&offset=0
Headers:
  Authorization: Bearer sk-telemetry-master-key-123
  X-Service: salesforce

Response (200):
{
  "service": "salesforce",
  "total": 150,
  "limit": 50,
  "offset": 0,
  "count": 50,
  "data": [ ... records ... ]
}
```

**List Services:**
```
GET /services
Headers:
  Authorization: Bearer sk-telemetry-master-key-123

Response (200):
{
  "total_services": 3,
  "services": [
    {
      "name": "salesforce",
      "table": "salesforce_telemetry",
      "records": 150,
      "lastUpdate": "2026-06-09T10:06:05.604Z"
    },
    // ... more services
  ]
}
```

**Service Stats:**
```
GET /services/salesforce/stats
Headers:
  Authorization: Bearer sk-telemetry-master-key-123

Response (200):
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

## 🔄 Version History

### v2.0 (Current) ✨

**Release Date:** June 2026
**Code:** `1b38b6c`
**Commit:** `1b38b6c09756ea3c79b44c375d0f26c4c66eef56`

**What's New:**
- ✨ **Single unified endpoint** `/telemetry` (replaces 3 endpoints)
- ✨ **One bearer token** for all services (replaces 3 API keys)
- ✨ **Service type in header** `X-Service: salesforce`
- ✨ **Auto table creation** for new services (no manual setup)
- ✨ **Service discovery** endpoint (`/services`)
- ✨ **Service statistics** endpoint (`/services/:service/stats`)
- ✨ **Pagination support** with `?limit=50&offset=0`
- 🔧 Improved error handling
- 🔧 Better logging and debugging
- 📊 Automatic timestamp indexing

---

### v1.0 (Legacy) ⚠️

**Release Date:** May 2026
**Code:** `cea695a`
**Commit:** `cea695a5fc213a86fb26c64c6dee61221008670f`

**Architecture:**
- Multi-endpoint design (3 separate endpoints)
- Separate API key per service
- Fixed table structure (Salesforce, Bhoomi, D365 only)
- Manual API key rotation
- No service discovery
- No auto-scaling

**Status:** Deprecated - Migrate to v2.0

---

## 🔐 Authentication

### Bearer Token

**Single token for all services:**
```
Authorization: Bearer sk-telemetry-master-key-123
```

**Features:**
- One token per deployment
- Change in environment variable: `BEARER_TOKEN`
- Required for all endpoints except `/health` and `/`
- Format: `Bearer {token}`

### Service Header

**Required for `/telemetry` endpoints:**
```
X-Service: salesforce
X-Service: bhoomi
X-Service: d365
X-Service: custom-agent
X-Service: any-new-service
```

**Rules:**
- Alphanumeric + hyphens only
- Case-insensitive (converted to lowercase)
- Auto-creates table if service is new
- Examples: `salesforce`, `bhoomi`, `d365`, `custom-agent`, `user-logs`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | - | `postgresql://user:pass@host/db` |
| `BEARER_TOKEN` | No | `sk-telemetry-master-key-123` | `sk-prod-xyz789` |
| `PORT` | No | `8000` | `3000` |

### .env Template

```bash
# Server Port
PORT=8000

# PostgreSQL Connection
DATABASE_URL=postgresql://username:password@host/database

# Authentication
BEARER_TOKEN=sk-telemetry-master-key-123
```

### Local Setup

```bash
# Clone
git clone https://github.com/indiranivas/api-testing.git
cd api-testing

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your values

# Run
npm start
```

---

## 🚀 Deployment

### Render.com (Recommended)

1. Connect GitHub repository to Render
2. Select `api-testing` repository
3. Configure:
   - Name: `telemetry-api`
   - Runtime: `Node`
   - Build: `npm install`
   - Start: `node server.js`
4. Add environment variables:
   - `DATABASE_URL`
   - `BEARER_TOKEN`
   - `PORT` (optional)
5. Deploy - auto-updates on git push

**Live URL:** https://telemetry-api-96pk.onrender.com

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["node", "server.js"]
```

```bash
docker build -t telemetry-api .
docker run -e DATABASE_URL="..." \
           -e BEARER_TOKEN="..." \
           -p 8000:8000 \
           telemetry-api
```

---

## 📊 Database Schema

### Auto-Generated Tables

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

### Flexible Payload (JSONB)

Store any JSON structure:
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

---

## 🎯 Key Features Comparison

| Feature | v1.0 | v2.0 |
|---------|------|------|
| Telemetry Collection | ✅ | ✅ |
| PostgreSQL Backend | ✅ | ✅ |
| JSONB Flexible Schema | ✅ | ✅ |
| **Pagination** | ❌ | ✅ |
| **Multi-service (unlimited)** | ❌ (3 only) | ✅ |
| **Dynamic Tables** | ❌ | ✅ |
| **Service Discovery** | ❌ | ✅ |
| **Service Statistics** | ❌ | ✅ |
| **Single API Key** | ❌ (3 keys) | ✅ |
| CORS Enabled | ✅ | ✅ |
| Large Payloads (50MB) | ✅ | ✅ |
| Automatic Indexing | ✅ | ✅ |

---

## 💡 Use Cases

### Salesforce Integration
```json
{
  "status": "success",
  "executionId": "sf-sync-20260609-001",
  "responseTime": 1200,
  "data": {
    "recordsProcessed": 5000,
    "recordsCreated": 1200,
    "recordsUpdated": 3800,
    "errors": 0
  }
}
```

### Property Registration (Bhoomi)
```json
{
  "status": "success",
  "executionId": "bhoomi-batch-daily-001",
  "responseTime": 3600,
  "data": {
    "registrationsProcessed": 250,
    "registrationsApproved": 240,
    "registrationsPending": 10
  }
}
```

### AI Agent Execution
```json
{
  "status": "success",
  "executionId": "agent-claude-task-001",
  "responseTime": 5000,
  "data": {
    "agentId": "agent-123",
    "taskCompleted": true,
    "outputTokens": 1250,
    "inputTokens": 850
  }
}
```

---

## 📚 Documentation

- **Full README:** https://github.com/indiranivas/api-testing/blob/main/README.md
- **GitHub Repository:** https://github.com/indiranivas/api-testing
- **Live API:** https://telemetry-api-96pk.onrender.com

---

## ✨ Summary

**Unified Telemetry API v2.0** is a production-ready, scalable telemetry collection system that simplifies multi-service integration with:
- One endpoint instead of many
- One API key instead of many
- Auto-scaling for unlimited services
- Complete service discovery and analytics
- Enterprise-grade security and performance

**Ready to Use:** https://telemetry-api-96pk.onrender.com

**Last Updated:** June 2026
**Status:** ✅ Production Ready
