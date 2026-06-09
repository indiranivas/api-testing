# Bhoomi Integration Guide

## Problem: Empty Payload Issue

When sending data to the Bhoomi telemetry endpoint, the response shows `success: true` but the data is saved as an empty payload `{}`.

## Root Causes

1. **Missing Content-Type Header** — Request doesn't specify `Content-Type: application/json`
2. **Body is not JSON** — Sending data as form-data, URL-encoded, or raw text
3. **Empty Body** — Not including any data in the request body
4. **Incorrect Headers** — Missing or incorrect `Authorization` header

## Solution Checklist

### ✅ Step 1: Verify Request Headers

**Required Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_BHOOMI_API_KEY
```

**Example with curl:**
```bash
curl -X POST https://telemetry-api-96pk.onrender.com/telemetry/bhoomi \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_BHOOMI_API_KEY" \
  -d '{
    "status": "success",
    "executionId": "test-001",
    "responseTime": 250,
    "data": {
      "registrationsProcessed": 100
    }
  }'
```

### ✅ Step 2: Verify Request Body

**Body MUST be valid JSON:**
```json
{
  "status": "success",
  "executionId": "bhoomi-sync-2026-06-09-001",
  "responseTime": 450,
  "data": {
    "registrationsProcessed": 250,
    "registrationsApproved": 240,
    "registrationsPending": 10,
    "errors": 0
  }
}
```

**Common Mistakes:**
- ❌ Sending empty `{}` or `null`
- ❌ Sending form-data instead of JSON
- ❌ Forgetting to stringify objects in code

### ✅ Step 3: Correct Implementation Examples

**JavaScript/Node.js:**
```javascript
const payload = {
  status: "success",
  executionId: "bhoomi-123",
  responseTime: 250,
  data: {
    registrationsProcessed: 100
  }
};

const response = await fetch(
  'https://telemetry-api-96pk.onrender.com/telemetry/bhoomi',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_BHOOMI_API_KEY'
    },
    body: JSON.stringify(payload)  // ✅ MUST stringify
  }
);

const result = await response.json();
console.log(result);
```

**Python:**
```python
import requests
import json

payload = {
    "status": "success",
    "executionId": "bhoomi-123",
    "responseTime": 250,
    "data": {
        "registrationsProcessed": 100
    }
}

headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_BHOOMI_API_KEY"
}

response = requests.post(
    'https://telemetry-api-96pk.onrender.com/telemetry/bhoomi',
    json=payload,  # ✅ requests handles JSON encoding
    headers=headers
)

print(response.json())
```

**Java:**
```java
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;

String payload = """
{
  "status": "success",
  "executionId": "bhoomi-123",
  "responseTime": 250,
  "data": {
    "registrationsProcessed": 100
  }
}
""";

HttpPost post = new HttpPost("https://telemetry-api-96pk.onrender.com/telemetry/bhoomi");
post.setHeader("Content-Type", "application/json");
post.setHeader("Authorization", "Bearer YOUR_BHOOMI_API_KEY");
post.setEntity(new StringEntity(payload));

// Execute request
```

**C#:**
```csharp
using System.Net.Http;
using System.Net.Http.Json;

var payload = new
{
    status = "success",
    executionId = "bhoomi-123",
    responseTime = 250,
    data = new
    {
        registrationsProcessed = 100
    }
};

using (var client = new HttpClient())
{
    client.DefaultRequestHeaders.Add("Authorization", "Bearer YOUR_BHOOMI_API_KEY");
    
    var response = await client.PostAsJsonAsync(
        "https://telemetry-api-96pk.onrender.com/telemetry/bhoomi",
        payload
    );
    
    var result = await response.Content.ReadAsAsync<dynamic>();
}
```

### ✅ Step 4: Postman Configuration

1. **Method:** POST
2. **URL:** `https://telemetry-api-96pk.onrender.com/telemetry/bhoomi`
3. **Headers Tab:**
   - Key: `Content-Type` | Value: `application/json`
   - Key: `Authorization` | Value: `Bearer YOUR_BHOOMI_API_KEY`
4. **Body Tab:**
   - Select: **raw**
   - Select: **JSON** (dropdown)
   - Paste payload:
     ```json
     {
       "status": "success",
       "executionId": "test-001",
       "responseTime": 250,
       "data": {
         "registrationsProcessed": 100
       }
     }
     ```
5. **Click Send**

## Verification

### Option 1: Check Server Logs

When API is running locally (`npm start`), you'll see:
```
[2026-06-09T...] POST /telemetry/bhoomi
Headers: {
  'content-type': 'application/json',
  'authorization': '***'
}
Body: {
  status: 'success',
  executionId: 'test-001',
  ...
}
Saving telemetry to bhoomi_telemetry: {...}
```

### Option 2: Fetch Latest Data

```bash
curl -H "Authorization: Bearer YOUR_BHOOMI_API_KEY" \
  https://telemetry-api-96pk.onrender.com/telemetry/bhoomi
```

## Bhoomi Integration Example

**Standard Bhoomi Sync Payload:**
```json
{
  "status": "success|failed|running",
  "executionId": "bhoomi-sync-2026-06-09-001",
  "responseTime": 450,
  "data": {
    "registrationsProcessed": 1250,
    "registrationsApproved": 1200,
    "registrationsPending": 50,
    "registrationsFailed": 0,
    "errors": 0,
    "warnings": 2,
    "duration_seconds": 45,
    "batch_id": "batch-123",
    "timestamp": "2026-06-09T09:30:00Z"
  }
}
```

**Large Batch Example:**
```json
{
  "status": "success",
  "executionId": "bhoomi-batch-2026-06-09-daily",
  "responseTime": 3600,
  "data": {
    "registrationsProcessed": 50000,
    "registrationsApproved": 48500,
    "registrationsPending": 1500,
    "registrationsFailed": 0,
    "errors": 0,
    "warnings": 45,
    "duration_seconds": 3600,
    "batch_id": "batch-daily-001",
    "district": "all",
    "sync_type": "full"
  }
}
```

## Troubleshooting

### Issue: Empty payload in database
**Solution:** Verify Content-Type and body in request

### Issue: 401 Unauthorized
**Solution:** Check API key - should be `YOUR_BHOOMI_API_KEY`

### Issue: Bad request error
**Solution:** Ensure JSON is valid (use JSONLint.com to validate)

### Issue: Connection timeout
**Solution:** Render might be sleeping - wait 30 seconds and retry

## Quick Test

Run the test script:
```bash
node test-bhoomi.js
```

This will:
1. Send sample data to Bhoomi endpoint
2. Fetch and display latest records
3. Verify data is being saved correctly

## Next Steps

1. ✅ Verify all headers are correct
2. ✅ Ensure JSON payload is valid
3. ✅ Test with `test-bhoomi.js`
4. ✅ Check database with `node query-db.js`
5. ✅ Monitor server logs for errors

## Support

For persistent issues:
- Check server logs: `npm start` (local)
- Query database: `node query-db.js`
- Verify API key matches your request
- Ensure network connectivity to Render
