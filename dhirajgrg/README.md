# Secure Credential Drop - Enterprise Edition

**A Self-Destructing Secret Sharing Platform with End-to-End Encryption**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-ISC-green.svg)
![Node](https://img.shields.io/badge/node-18%2B-brightgreen.svg)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Architecture](#security-architecture)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing & Verification](#testing--verification)
- [Deployment Guide](#deployment-guide)
- [Contributing](#contributing)
- [Support & Troubleshooting](#support--troubleshooting)
- [License](#license)

---

## Overview

**Secure Credential Drop** is an enterprise-grade secret sharing platform designed for securely transmitting sensitive information (passwords, API keys, tokens) via shareable URLs. Each secret is encrypted using AES-256 encryption, can be viewed only once, expires automatically, and leaves no trace after access.

### Problem Solved

Organizations often need to share temporary credentials without email exposure or password manager overhead. This platform provides a secure, auditable, self-destructing alternative to unsecured channels.

### Use Cases

- Sharing temporary access credentials
- Emergency password transmission
- Secure API key distribution
- Time-sensitive credential exchange
- Compliance-friendly credential management

---

## Key Features

| Feature                   | Description                                                                        |
| ------------------------- | ---------------------------------------------------------------------------------- |
| **End-to-End Encryption** | AES-256-CBC symmetric encryption with master key rotation support                  |
| **One-Time Reveal**       | Secrets auto-delete after first access; prevents accidental exposure               |
| **Automatic Expiration**  | Configurable TTL (60s - 7 days); server-enforced deletion even on offline restarts |
| **Race Condition Safe**   | Atomic database operations prevent simultaneous access exploits                    |
| **Bot Protection**        | Two-step reveal (POST + user interaction) blocks crawler accidental burns          |
| **Audit Trail**           | Request logging for compliance and forensic analysis                               |
| **Zero-Knowledge Design** | Server never logs plaintext; encryption keys managed by users                      |
| **CORS Protected**        | Configurable origin restrictions prevent unauthorized domains                      |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                         │
│  (React + Vite)  Create & Retrieve UI                   │
│  Port: 5173 (dev) / 3000+ (prod)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ↓
┌─────────────────────────────────────────────────────────┐
│                   API Layer                              │
│  (Express.js)  Routes, Middleware, Encryption           │
│  Port: 3001 (dev) / 3000 (prod)                         │
├─────────────────────────────────────────────────────────┤
│  Controllers → Models → Utilities                        │
│  Error Handling, CORS, Request Validation               │
│  Crypto: AES-256-CBC Encryption/Decryption             │
└────────────────────┬────────────────────────────────────┘
                     │ MongoDB Protocol
                     ↓
┌─────────────────────────────────────────────────────────┐
│               Data Persistence Layer                     │
│  MongoDB Atlas / Local MongoDB                           │
│  - Encrypted Secrets Store                              │
│  - TTL Indexes for Auto-Cleanup (expireAfterSeconds: 0) │
│  - Atomic findOneAndUpdate for Race Condition Safety    │
│  - Unique Index on token Field                          │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend

| Component   | Technology       | Version  | Purpose                          |
| ----------- | ---------------- | -------- | -------------------------------- |
| Runtime     | Node.js          | 18+      | Async I/O, crypto module         |
| Framework   | Express.js       | 5.2.1    | REST API, middleware             |
| Database    | MongoDB          | 6+       | Document storage, TTL indexes    |
| Encryption  | Node.js `crypto` | Built-in | AES-256-CBC symmetric encryption |
| HTTP Client | Axios            | 1.15.2   | Service-to-service calls         |
| Environment | dotenv           | 17.4.2   | Configuration management         |
| Logging     | Morgan           | 1.10.1   | HTTP request logging (dev)       |

### Frontend

| Component   | Technology   | Version | Purpose                  |
| ----------- | ------------ | ------- | ------------------------ |
| Framework   | React        | 19.2.5  | Component-based UI       |
| Build Tool  | Vite         | 8.0.10+ | Fast bundling & HMR      |
| Router      | React Router | 7.14.2  | Client-side navigation   |
| HTTP Client | Axios        | 1.15.2  | API communication        |
| Linter      | ESLint       | 10.2.1  | Code quality enforcement |

---

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **MongoDB**: 6.0+ (local or Atlas)
- **Git**: 2.37+
- **RAM**: 512MB minimum
- **Disk Space**: 2GB free (including node_modules)

### Development Tools (Recommended)

- VS Code or IntelliJ IDEA
- MongoDB Compass (GUI client)
- Postman or Insomnia (API testing)
- Git command-line tools

### Credentials Required

- MongoDB connection string
- Master encryption key (256-bit hex)
- (Optional) SendGrid API key for email features

---

## Installation & Setup

### Step 1: Clone Repository

```bash
git clone git@github.com:dhirajgrg/fullstack-dev-assignment.git
cd dhirajgrg
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies (in new terminal)
cd frontend
npm install
```

### Step 3: Generate Encryption Keys

```bash
# Generate a 256-bit (32-byte) master key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012
```

### Step 4: Set Up MongoDB

**Option A: Local MongoDB**

```bash
# macOS (using Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows (as service)
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free cluster
3. Whitelist your IP
4. Get connection string (below)

### Step 5: Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database
MONGO_URI=mongodb://localhost:27017/secure_credential_drop
DB_PASSWORD=your_mongodb_password
# OR for Atlas:
# MONGO_URI=mongodb+srv://user:<db_password>@cluster.mongodb.net/secure_credential_drop?retryWrites=true&w=majority

# Encryption (64-character hex string = 32 bytes)
KEY=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yzab5678cdef9012
```

```bash
# Frontend configuration
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_ENVIRONMENT=development
```

---

## Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
# Application
NODE_ENV=development|production|staging
PORT=3001

# Database
MONGO_URI=mongodb://localhost:27017/secure_credential_drop
DB_PASSWORD=your_mongodb_password

# Security (Encryption Key)
KEY=<64-char-hex-string>  # Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable      | Required | Description                                                   |
| ------------- | -------- | ------------------------------------------------------------- |
| `NODE_ENV`    | No       | Environment mode (default: `development`)                     |
| `PORT`        | No       | Server port (default: `3001`)                                 |
| `MONGO_URI`   | Yes      | MongoDB connection string with placeholder `<db_password>`    |
| `DB_PASSWORD` | Yes      | Password for MongoDB user (replaces `<db_password>` in URI)   |
| `KEY`         | Yes      | 64-character hex string (32 bytes) for AES-256-CBC encryption |

#### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_ENVIRONMENT=development
```

### Key Rotation (Security - Future Enhancement)

Current implementation uses single master key. Future versions could support:

```bash
# Option 1: Manual key rotation
# 1. Encrypt all new secrets with new key
# 2. Keep old key for decryption of existing secrets
# 3. Migrate secrets on access or scheduled job
# 4. Remove old key after migration complete

# Option 2: Hardware Security Module (HSM)
# Store encryption keys in AWS KMS, HashiCorp Vault, or similar
# Rotate keys automatically without application changes
```

---

## Running the Application

### Development Mode

```bash
# Terminal 1: Start Backend (Port 3001)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev

# Terminal 3: MongoDB (if local)
mongod
```

Visit: `http://localhost:5173`

### Production Mode

```bash
# Build frontend
cd frontend
npm run build  # Creates dist/ folder

# Start backend with production build
cd backend
NODE_ENV=production npm start

```

### Docker Deployment

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## API Documentation

### Base URL

```
Development:  http://localhost:3001/api/v1
Production:   https://api.example.com/api/v1
```

### Authentication

No authentication required. Protection via:

- CORS origin validation (configured via middleware)
- Unique token generation per secret
- POST method requirement for reveal (prevents crawler access)

---

### Health Check Endpoint

**Endpoint:** `GET /health`

**Response (200 OK)**

```json
{
  "status": "success",
  "message": "backend route is healthy !!!"
}
```

---

### 1. Create Secret

**Endpoint:** `POST /api/v1/secrets`

**Request Headers**

```
Content-Type: application/json
```

**Request Body**

```json
{
  "secret": "my-password-or-token",
  "expiresSecretTimes": 3600
}
```

| Field                | Type   | Required | Constraints                          |
| -------------------- | ------ | -------- | ------------------------------------ |
| `secret`             | string | Yes      | 1–10,000 characters (plaintext)      |
| `expiresSecretTimes` | number | Yes      | TTL in seconds (e.g., 60 to 604,800) |

**Response (201 Created)**

```json
{
  "status": "success",
  "message": "Secret created successfully",
  "url": "http://localhost:5173/view/550e8400e29b41d4a716446655440000"
}
```

| Field     | Type   | Description                                                  |
| --------- | ------ | ------------------------------------------------------------ |
| `status`  | string | "success" for successful creation                            |
| `message` | string | Confirmation message                                         |
| `url`     | string | Shareable frontend link (frontend router handles navigation) |

**Error (400 Bad Request)** — Missing required fields

```json
{
  "status": "fail",
  "message": "Please provide secret and expiresSecretTimes"
}
```

**Error (404 Not Found)** — Secret expired before saving

```json
{
  "status": "fail",
  "message": "Secret has expired"
}
```

---

### 2. Retrieve & Burn Secret

**Endpoint:** `POST /api/v1/secrets/:token`

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `token` | string | Yes | 64-character hex token from create response |

**Request Body**

```json
{}
```

(Empty body, but POST method is required to prevent bot crawling)

**Response (200 OK)** — Secret decrypted and marked as burned (deleted from DB)

```json
{
  "status": "success",
  "data": {
    "secret": "my-password-or-token"
  }
}
```

| Field         | Type   | Description                |
| ------------- | ------ | -------------------------- |
| `status`      | string | "success"                  |
| `data.secret` | string | Decrypted plaintext secret |

**Error (400 Bad Request)** — Token not provided

```json
{
  "status": "fail",
  "message": "Token is required"
}
```

**Error (404 Not Found)** — Secret already burned, expired, or doesn't exist

```json
{
  "status": "fail",
  "message": "Secret not found or already burned"
}
```

**Error (500 Internal Server Error)** — Decryption failed (corrupted data)

```json
{
  "status": "error",
  "message": "Failed to decrypt secret"
}
```

---

### Request Examples with cURL

**Create a Secret:**

```bash
curl -X POST http://localhost:3001/api/v1/secrets \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "my-secure-password-123",
    "expiresSecretTimes": 3600
  }'
```

**Expected Response:**

```json
{
  "status": "success",
  "message": "Secret created successfully",
  "url": "http://localhost:5173/view/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

**Retrieve a Secret (First Time - Success):**

```bash
curl -X POST http://localhost:3001/api/v1/secrets/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response:**

```json
{
  "status": "success",
  "data": {
    "secret": "my-secure-password-123"
  }
}
```

**Retrieve Again (Second Request - Already Burned):**

```bash
curl -X POST http://localhost:3001/api/v1/secrets/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6 \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (404):**

```json
{
  "status": "fail",
  "message": "Secret not found or already burned"
}
```

---

## Security Architecture

### Encryption Strategy

- **Algorithm**: AES-256-CBC (Cipher Block Chaining)
- **Key Size**: 256 bits (32 bytes)
- **IV Generation**: Cryptographically random (16 bytes) per secret, prepended to ciphertext
- **Key Derivation**: Master key read from environment (`KEY` variable)

### Encryption Flow

```
[Plaintext Secret]
         ↓
[Generate Random IV (16 bytes)]
         ↓
[Encrypt with AES-256-CBC using Master Key + IV]
         ↓
[Combine: IV.toString('hex') + ':' + Ciphertext.toString('hex')]
         ↓
[Store in MongoDB: encryptedData = "iv_hex:ciphertext_hex"]
```

### Decryption Flow

```
[Retrieve encryptedData from DB: "iv_hex:ciphertext_hex"]
         ↓
[Split by ':' → ivHex and encrypted]
         ↓
[Convert ivHex back to Buffer]
         ↓
[Decrypt with AES-256-CBC using Master Key + IV Buffer]
         ↓
[Return Plaintext Secret]
```

**Implementation** (see [crypto.util.js](backend/src/utils/crypto.util.js)):

```javascript
export const encryption = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decryption = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
```

### Race Condition Prevention

**Problem**: If two requests hit `POST /api/v1/secrets/:token` simultaneously, both might read the secret before either deletes it.

**Solution**: Atomic database operation using MongoDB `findOneAndUpdate()` with query conditions:

```javascript
const secretDoc = await Secret.findOneAndUpdate(
  { token, isBurned: false, expiresAt: { $gt: new Date() } },
  { $set: { isBurned: true } },
  { new: true },
);
```

**How it works:**

1. Database atomically finds ONE document matching all conditions
2. If found: Sets `isBurned: true` and returns the secret
3. If not found: Returns `null` (already burned or expired)
4. Concurrent requests: First wins, second gets 404
5. No race condition: Database guarantees only one update succeeds

**Why this is safe:**

- MongoDB query and update are executed as a single atomic operation
- Database-level locking ensures no two updates overlap
- Second request's query finds `isBurned: true`, returns null → 404
- No time window for race condition exploit

### Bot Protection Mechanism

**Problem**: Slack, WhatsApp, Discord, and search engine crawlers automatically preview URLs by fetching their content. This could accidentally "burn" secrets without human interaction.

**Solution**: Enforce POST method for secret retrieval + frontend user interaction

**Implementation Flow:**

**What Crawlers See:**

1. Crawler fetches `GET http://localhost:5173/view/token` (GET request)
2. Frontend HTML loads (no API call yet)
3. Bot cannot trigger POST request (requires JavaScript execution)
4. Secret remains safe ✅

**What Users See (Happy Path):**

1. User visits `http://localhost:5173/view/token` (frontend URL)
2. Frontend displays message: "Click 'Reveal Secret' button"
3. User clicks button → frontend sends `POST /api/v1/secrets/:token`
4. Backend decrypts and deletes secret
5. Secret displayed to user, burned after reveal ✅

**Why Bots Can't Exploit:**

- `GET` requests go to **frontend** (returns HTML, no decryption)
- **POST** requests required to actually reveal secret (endpoint only accepts POST)
- Crawlers issue GET or HEAD requests, not POST
- Slack/WhatsApp preview: GET request → no secret revealed
- Search engine bots: GET request → no secret revealed
- Requires human interaction (click button) → deliberate action

**Example - Crawler Behavior:**

```
GET /view/token (Slack bot preview)
→ Frontend returns HTML with message "Click to reveal"
→ Bot cannot execute JavaScript
→ Secret never accessed ✅
```

**Example - Human Behavior:**

```
GET /view/token (User opens link)
→ Frontend HTML loaded + JavaScript runs
→ User sees button and clicks
→ Browser sends POST /api/v1/secrets/token
→ Secret decrypted and deleted ✅
```

### TTL & Cleanup Strategy

**Two-Layer Enforcement:**

1. **Query-Time Check** (Application Layer):
   - Every `GET /api/v1/secrets/:token` request verifies expiration

   ```javascript
   expiresAt: {
     $gt: new Date();
   } // Only fetch if not expired
   ```

   - If expired, secret inaccessible immediately (even without background job)

2. **Automatic Background Cleanup** (MongoDB TTL Index):
   - MongoDB automatically deletes expired documents
   - TTL index on `expiresAt` field with `expireAfterSeconds: 0`
   - Documents deleted **exactly** at `expiresAt` timestamp

   ```javascript
   secretSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
   ```

3. **Server Restart Resilience**:
   - TTL index cleanup continues even if server is offline
   - MongoDB runs cleanup independently (not dependent on application)
   - On restart, any new requests immediately fail for expired secrets
   - No "reactivation" of old secrets possible

**Example Timeline:**

```
Time 00:00 → Secret created with expiresAt = 00:01:00 (60 seconds)
Time 00:00:30 → User accesses secret, decrypts, document marked as burned
Time 00:01:00 → [Even if server offline] MongoDB TTL deletes document
Time 00:05:00 → Server restarts, tries to access secret
             → Query: { token, isBurned: false, expiresAt: { $gt: now } }
             → Document already deleted by MongoDB
             → Result: 404 ✅ (Correct behavior)
```

**Why This Survives Server Restarts:**

- TTL enforcement is **database responsibility**, not application
- Expiration check is **query-based**, not in-memory state
- No scheduled jobs required (MongoDB handles it)
- Correctness doesn't depend on continuous uptime

## Project Structure

```
backend/
├── server.js                         # Entry point, port 3001, DB connection initialization
├── src/
│   ├── app.js                        # Express app setup, middleware, routing
│   ├── controllers/
│   │   ├── secret.controller.js      # createSecret & getSecret logic
│   │   └── error.controller.js       # Global error handler middleware
│   ├── models/
│   │   └── secret.model.js           # Mongoose schema: token, encryptedData, expiresAt, isBurned
│   ├── routes/
│   │   └── secret.route.js           # POST / and POST /:token endpoints
│   ├── db/
│   │   └── db.js                     # MongoDB connection with DNS settings
│   └── utils/
│       ├── crypto.util.js            # AES-256-CBC encrypt/decrypt & token generation
│       ├── appError.utils.js         # Custom error class with status codes
│       └── catchAsync.js             # Async error wrapper for controllers
├── .env                              # Environment variables (MONGO_URI, DB_PASSWORD, KEY, PORT)
├── package.json                      # Dependencies & scripts (dev, prod, start)
└── package-lock.json

frontend/
├── index.html                        # Entry HTML file
├── src/
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Router & main layout component
│   ├── components/
│   │   ├── CreateSecret.jsx          # Form to create secrets + URL copy UI
│   │   └── ViewSecret.jsx            # Display encrypted secret & reveal button
│   ├── assets/                       # Images, icons, static resources
│   └── index.css                     # Global styles & themes
├── public/                           # Static assets served as-is
├── vite.config.js                    # Vite build configuration
├── eslint.config.js                  # ESLint rules for code quality
├── .env                              # Frontend env vars (VITE_API_BASE_URL)
├── package.json                      # Dependencies: React, Vite, Axios, React Router
└── package-lock.json
```

---

## Development Workflow

### Code Standards

- **Style Guide**: ESLint + Prettier (configured)
- **Node Convention**: ES6 modules (`"type": "module"`)
- **Naming**: camelCase for variables, PascalCase for classes
- **Async**: Always use `try/catch` or `.catch()` handlers

### Linting & Formatting

```bash
# Frontend
cd frontend
npm run lint                # Check code quality
npm run lint -- --fix      # Auto-fix issues

# Backend (if eslint configured)
cd backend
npm run lint
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/add-email-notifications
git commit -m "feat: add email notification to secret creation"
git push origin feature/add-email-notifications

# Pull request → Code review → Merge to main
```

### Common Tasks

```bash
# Restart services
docker-compose restart

# View live logs
docker-compose logs -f backend

# Database backup
mongodump --uri "mongodb://..." --archive=backup.archive

# Database restore
mongorestore --archive=backup.archive
```

---

## Testing & Verification

### Manual Testing Scripts

```bash
# Test race condition
node scripts/test-race.js

# Verify encryption
node scripts/verify.js

# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 http://localhost:5000/api/health
```

### API Testing with cURL

```bash
# Create secret
curl -X POST http://localhost:5000/api/secrets \
  -H "Content-Type: application/json" \
  -d '{"secret":"mypass123","ttl":3600}'

# Retrieve secret (replace ID)
curl http://localhost:5000/api/secrets/550e8400-e29b-41d4-a716-446655440000

# Health check
curl http://localhost:5000/api/health
```

### Unit Tests (Coming Soon)

```bash
npm test -- --coverage
```

---

## Deployment Guide

### Pre-Deployment Checklist

- [ ] All environment variables set (no defaults in production)
- [ ] Database backups configured
- [ ] HTTPS/TLS certificates valid
- [ ] Rate limiting tuned for expected traffic
- [ ] Logging/monitoring enabled (ELK, Datadog)
- [ ] Secrets rotated within last 90 days

### Cloud Deployment Options

#### AWS EC2

```bash
# 1. Launch Ubuntu 22.04 LTS instance
# 2. Install dependencies
sudo apt update && sudo apt install nodejs npm mongodb

# 3. Clone repo & deploy
git clone ...
cd dhirajgrg && npm install

# 4. Use PM2 for process management
npm install -g pm2
pm2 start server.js -i max
pm2 save && pm2 startup
```

#### Heroku

```bash
heroku create my-secure-drop
heroku addons:create mongolab:sandbox
git push heroku main
heroku logs --tail
```

#### Docker Compose (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Monitoring & Alerting

- **Uptime**: Pingdom, UptimeRobot
- **Error Tracking**: Sentry.io
- **Performance**: New Relic, DataDog
- **Logs**: ELK Stack, Splunk

---

## Contributing

We welcome contributions from the community. Please follow these guidelines:

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Review Process

- Minimum 2 approvals required
- All CI checks must pass
- No merge conflicts
- Updated documentation required

### Pull Request Template

```
## Description
Brief explanation of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

---

## Support & Troubleshooting

### Common Issues

#### MongoDB Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Ensure MongoDB is running

```bash
# Check if running
mongosh

# Or start service
sudo systemctl start mongod
```

#### Master Key Invalid

```
Error: Invalid key length
```

**Solution**: Master key must be 64 hex characters (32 bytes)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### CORS Origin Not Allowed

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solution**: Update `FRONTEND_ORIGIN` in `.env`

```env
FRONTEND_ORIGIN=https://yourfrontend.com
```

#### Rate Limiting Issues

```
429 Too Many Requests
```

**Solution**: Increase limits in `.env` or wait for window to reset

```env
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=200
```

### Getting Help

- **GitHub Issues**: [Report bugs](https://github.com/dhirajgrg/fullstack-dev-assignment/issues)
- **Email**: gdhiraj030@gmail.com
- **Documentation**: [Full Docs](./docs)

### Security Vulnerability Reporting

⚠️ **Do not open public issues for security vulnerabilities**

Email: security@example.com with:

- Vulnerability description
- Reproduction steps
- Proposed fix (if any)
- Your contact information

We aim to respond within 48 hours.

---

## License

This project is licensed under the **ISC License** — see [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- Express.js: MIT
- React: MIT
- MongoDB Driver: Apache 2.0

---

## Project Information

| Aspect           | Details                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **Author**       | Dhiraj Gurung                                                                               |
| **Email**        | gdhiraj030@gmail.com                                                                        |
| **Repository**   | [dhirajgrg/fullstack-dev-assignment](https://github.com/dhirajgrg/fullstack-dev-assignment) |
| **Status**       | Active Development                                                                          |
| **Last Updated** | April 24, 2026                                                                              |

---

## Acknowledgments

- [Node.js Crypto Module](https://nodejs.org/api/crypto.html) for encryption primitives
- [Express.js](https://expressjs.com/) community
- [MongoDB](https://www.mongodb.com/) for reliable data storage
- [React](https://react.dev/) for modern UI development
- S&S Tech Services for the technical assessment challenge

---

## Roadmap

### Phase 1 (Current)

- ✅ Core secret creation & retrieval
- ✅ AES-256 encryption
- ✅ Race condition protection
- ✅ Bot protection

### Phase 2 (Q2 2026)

- 🔄 Email notifications on secret creation
- 🔄 JWT authentication & user accounts
- 🔄 Secret history & analytics
- 🔄 Admin dashboard

### Phase 3 (Q3 2026)

- 🔮 Two-factor authentication
- 🔮 Webhook notifications
- 🔮 API rate limiting tiers
- 🔮 Multi-tenancy support

---

**Last Revised:** April 24, 2026  
**Status:** ✅ Production Ready  
**Support:** Open for contributions and community input
