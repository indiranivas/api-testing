# Azure Deployment Guide - Windows Host

Deploy the Unified Telemetry API v2.0 to your Azure Windows host with Node 24.

---

## 🎯 Overview

**Target Environment:**
- Host: Azure Virtual Machine (Windows)
- OS: Windows Server 2022 / Windows 11 Pro
- Runtime: Node.js 24
- Database: PostgreSQL (Render or Azure Database)
- Port: 8000

---

## 📋 Prerequisites

✅ Azure VM created with Windows
✅ Node.js 24 installed
✅ npm installed
✅ PostgreSQL connection string
✅ Bearer token configured
✅ GitHub Secrets set up

---

## 🚀 Deployment Steps

### Step 1: Prepare Azure Host

**On your Azure Windows machine:**

```powershell
# Verify Node.js 24
node --version
npm --version

# Create project directory
New-Item -ItemType Directory -Path "C:\Projects\telemetry-api" -Force
cd C:\Projects\telemetry-api

# Clone repository
git clone https://github.com/indiranivas/api-testing.git .
```

### Step 2: Install Dependencies

```powershell
# Install npm packages
npm install

# Verify installation
npm list
```

### Step 3: Configure Environment

```powershell
# Create .env file (local only, not in git)
$envContent = @"
PORT=8000
DATABASE_URL=postgresql://your-user:your-password@your-host/your-db
BEARER_TOKEN=sk-your-secure-token-here
NODE_ENV=production
"@

$envContent | Out-File -FilePath .env -Encoding UTF8
```

### Step 4: Test Locally

```powershell
# Start server
npm start

# In another PowerShell window, test health check
Invoke-WebRequest -Uri http://localhost:8000/health -Headers @{"Authorization"="Bearer sk-your-secure-token-here"}
```

### Step 5: Setup as Windows Service (Persistent)

**Option A: Using NSSM (Node Service Simple Manager)**

```powershell
# Download and install NSSM
# From: https://nssm.cc/download

# Extract NSSM
cd "C:\nssm-2.24-101-g897c7f7\win64"

# Install service
.\nssm.exe install TelemetryAPI "C:\Program Files\nodejs\node.exe" "C:\Projects\telemetry-api\server.js"

# Set environment variables
.\nssm.exe set TelemetryAPI AppEnvironmentExtra PORT=8000
.\nssm.exe set TelemetryAPI AppEnvironmentExtra DATABASE_URL=postgresql://...
.\nssm.exe set TelemetryAPI AppEnvironmentExtra BEARER_TOKEN=sk-...

# Start service
.\nssm.exe start TelemetryAPI

# Verify service is running
Get-Service TelemetryAPI
```

**Option B: Using Task Scheduler**

1. Open **Task Scheduler**
2. Create Basic Task → "TelemetryAPI"
3. Trigger: At startup
4. Action: Start a program
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `C:\Projects\telemetry-api\server.js`
5. Set Run with highest privileges

### Step 6: Configure Firewall

```powershell
# Allow port 8000 through Windows Firewall
New-NetFirewallRule -DisplayName "Telemetry API" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8000

# Verify rule
Get-NetFirewallRule -DisplayName "Telemetry API"
```

### Step 7: Setup IIS Reverse Proxy (Optional)

**If you want to run on port 80/443:**

```powershell
# Install IIS (if not already installed)
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer

# Install URL Rewrite Module
# Download from: https://www.iis.net/downloads/microsoft/url-rewrite

# Create web.config for reverse proxy
$webConfig = @"
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="ReverseProxy" stopProcessing="true">
          <match url="(.*)" />
          <action type="Rewrite" url="http://localhost:8000/{R:1}" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
"@

$webConfig | Out-File -FilePath "C:\inetpub\wwwroot\web.config" -Encoding UTF8
```

---

## 🔄 GitHub Actions Auto-Deployment

### What Happens:

1. You push to GitHub
2. GitHub Actions workflow triggers
3. Builds on Windows runner with Node 24
4. Runs tests
5. Creates deployment package
6. Notifies Azure host to pull and restart

### CI/CD Workflow Files:

- `.github/workflows/deploy.yml` — Render deployment
- `.github/workflows/azure-deploy.yml` — Azure deployment (Windows)

### Trigger Deployment:

```bash
git push -u origin main
```

Monitor progress at: **https://github.com/indiranivas/api-testing/actions**

---

## 📊 Monitoring & Maintenance

### Check Service Status

```powershell
# Using NSSM
C:\nssm-2.24-101-g897c7f7\win64\nssm.exe query TelemetryAPI

# Using Task Scheduler
Get-ScheduledTask -TaskName "TelemetryAPI"

# Using Services
Get-Service TelemetryAPI
```

### View Logs

```powershell
# Application logs
Get-EventLog -LogName Application | Where-Object {$_.Source -like "*node*"} | Select-Object -Last 10

# IIS logs (if using reverse proxy)
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\u_ex*.log" | Select-Object -Last 50
```

### Restart Service

```powershell
# Restart service
Restart-Service -Name TelemetryAPI

# Or using NSSM
C:\nssm-2.24-101-g897c7f7\win64\nssm.exe restart TelemetryAPI
```

### Update Application

```powershell
# Stop service
Stop-Service -Name TelemetryAPI

# Pull latest code
cd C:\Projects\telemetry-api
git pull origin main

# Install dependencies
npm install

# Start service
Start-Service -Name TelemetryAPI
```

---

## 🔒 Security Configuration

### Enable HTTPS (Recommended)

```powershell
# Install certificate (self-signed for testing)
$cert = New-SelfSignedCertificate `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -DnsName "localhost" `
  -FriendlyName "TelemetryAPI"

# Use in Node.js app or IIS
```

### Network Security

```powershell
# Allow only specific IPs
New-NetFirewallRule -DisplayName "Telemetry API - Restricted" `
  -Direction Inbound `
  -Action Allow `
  -Protocol TCP `
  -LocalPort 8000 `
  -RemoteAddress "192.168.1.0/24"
```

### Environment Variables

Store in Windows Environment Variables (not in .env):

```powershell
# As Administrator
[Environment]::SetEnvironmentVariable("DATABASE_URL", "postgresql://...", "Machine")
[Environment]::SetEnvironmentVariable("BEARER_TOKEN", "sk-...", "Machine")

# Verify
Get-ChildItem -Path "Env:DATABASE_URL"
```

---

## 📈 Performance Tuning

### Node.js Configuration

```powershell
# Increase max file descriptors (Windows equivalent)
# Run as Administrator
Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\TelemetryAPI" -Name "Environment" -Value @("NODE_OPTIONS=--max-old-space-size=4096")
```

### Database Connection Pooling

Your `.env`:
```
DATABASE_URL=postgresql://user:pass@host/db?max=20&min=5
```

### Load Balancing (Multiple Instances)

```powershell
# Create multiple services
# TelemetryAPI-1 on port 8001
# TelemetryAPI-2 on port 8002
# TelemetryAPI-3 on port 8003

# Use IIS/Azure Load Balancer to distribute traffic
```

---

## 🧪 Testing

### Health Check

```powershell
# Test API health
Invoke-WebRequest -Uri http://localhost:8000/health `
  -Headers @{"Authorization"="Bearer sk-your-token"}
```

### Send Telemetry

```powershell
# Test data insertion
$body = @{
    "status" = "success"
    "executionId" = "test-001"
    "responseTime" = 250
    "data" = @{
        "recordsProcessed" = 100
    }
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:8000/telemetry `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer sk-your-token"
    "X-Service" = "salesforce"
    "Content-Type" = "application/json"
  } `
  -Body $body
```

### List Services

```powershell
$response = Invoke-WebRequest -Uri http://localhost:8000/services `
  -Headers @{"Authorization"="Bearer sk-your-token"}

$response.Content | ConvertFrom-Json | Format-Table -AutoSize
```

---

## 🆘 Troubleshooting

### Service Won't Start

```powershell
# Check logs
Get-EventLog -LogName Application | Where-Object {$_.Source -like "*TelemetryAPI*"}

# Check Node.js
node --version
npm --version

# Test server directly
cd C:\Projects\telemetry-api
npm start
```

### Database Connection Failed

```powershell
# Verify connection string
$env:DATABASE_URL

# Test connection
psql -c "SELECT 1" $env:DATABASE_URL
```

### Port Already in Use

```powershell
# Find process on port 8000
netstat -ano | findstr :8000

# Kill process (if needed)
taskkill /PID {PID} /F

# Or use different port in .env
# PORT=8001
```

### High Memory Usage

```powershell
# Check memory
Get-Process -Name node | Select-Object Name, WorkingSet

# Restart service
Restart-Service -Name TelemetryAPI

# Consider adding swap/pagefile
```

---

## 📋 Azure VM Specification Checklist

- [ ] Windows Server 2022 / Windows 11
- [ ] Node.js 24 installed
- [ ] npm installed and updated
- [ ] PostgreSQL connection available
- [ ] GitHub Secrets configured
- [ ] `.env` file created (local only)
- [ ] Firewall rule for port 8000
- [ ] Service configured (NSSM or Task Scheduler)
- [ ] Reverse proxy configured (IIS - optional)
- [ ] Health check working
- [ ] Telemetry API responding

---

## 🚀 Quick Start Commands

```powershell
# Full setup from scratch
cd C:\Projects\telemetry-api
git clone https://github.com/indiranivas/api-testing.git .
npm install

# Create .env (customize values)
@"
PORT=8000
DATABASE_URL=postgresql://user:password@host/database
BEARER_TOKEN=sk-your-token-here
NODE_ENV=production
"@ | Out-File .env

# Test locally
npm start

# In another terminal
Invoke-WebRequest http://localhost:8000/health -Headers @{"Authorization"="Bearer sk-your-token"}
```

---

## 📞 Support

- **GitHub Issues:** https://github.com/indiranivas/api-testing/issues
- **Documentation:** See README.md and FEATURE_SUMMARY.md
- **Status:** https://telemetry-api-96pk.onrender.com/health

---

**Deployment Status:** ✅ Ready for Azure Windows Host with Node 24

