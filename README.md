# Secure Credential Drop

**Self-Destructing Password Sharer — S&S Tech Services Technical Assessment**

> **Instructions for the candidate**
> This README is your submission report. Fill in every section marked `_Write here_` before submitting.
> Do not remove or reorder sections — the reviewer reads this top to bottom.

---

## Table of Contents

1. [Candidate Info](#1-candidate-info)
2. [Project Overview](#2-project-overview)
3. [Tech Stack & Decisions](#3-tech-stack--decisions)
4. [Project Structure](#4-project-structure)
5. [Setup & Run](#5-setup--run)
6. [Environment Variables](#6-environment-variables)
7. [API Reference](#7-api-reference)
8. [Challenge 1 — Race Condition Prevention](#8-challenge-1--race-condition-prevention)
9. [Challenge 2 — Crawler / Bot Protection](#9-challenge-2--crawler--bot-protection)
10. [Challenge 3 — Resilient Cleanup](#10-challenge-3--resilient-cleanup)
11. [Trade-offs & What I'd Do Differently](#11-trade-offs--what-id-do-differently)

---

## 1. Candidate Info

|                     |                      |
| ------------------- | -------------------- |
| **Name**            | Dhiraj Gurung        |
| **Email**           | gdhiraj030@gmail.com |
| **Submission date** | April 24, 2026       |
| **Time taken**      | 2 days               |

---

## 2. Project Overview

> Describe what the service does and the end-to-end user flow in 3–5 sentences.

The service takes text and encrypt it by aes-256-cbc encryption algorithm and generates url with randomness unique token every generation and that can be sharebale .so,who ever receive that url and directed view secret page but secrets are reveal only when user clicks reveal button then the encrypted text decrypt back with same key used in ecncryption and it it only one time reveal if user tries to reload or reveal again that it throw message it already used,viewed or burnded

---

## 3. Tech Stack & Decisions

| Layer      | Technology       | Why chosen                                                                                               |
| ---------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| Runtime    | Node.js          | Non-blocking I/O runtime; built-in crypto module for encryption                                          |
| Framework  | Express.js       | Fast, lightweight REST API framework with clean architecture                                             |
| Database   | MongoDB          | Document-based storage with TTL indexes for automatic cleanup; better than SQL for this use case         |
| Encryption | Node.js `crypto` | AES-256-CBC symmetric encryption; built-in module, uses single master key for both encryption/decryption |
| Frontend   | React + Vite     | Modern, reactive UI with fast hot module replacement (HMR)                                               |
| Validation | Mongoose         | Schema validation and data integrity at database layer                                                   |

---

## 4. Project Structure

```
dhirajgrg/
├── backend/
│   ├── server.js                         Entry point, port 3001, DB connection
│   ├── src/
│   │   ├── app.js                        Express app, middleware, routing
│   │   ├── controllers/
│   │   │   ├── secret.controller.js      Create & retrieve secret logic
│   │   │   └── error.controller.js       Global error handler
│   │   ├── models/
│   │   │   └── secret.model.js           Mongoose schema: token, encryptedData, expiresAt, isBurned
│   │   ├── routes/
│   │   │   └── secret.route.js           POST / (Create) & POST /:token (Retrieve/Burn)
│   │   ├── db/
│   │   │   └── db.js                     MongoDB connection setup
│   │   └── utils/
│   │       ├── crypto.util.js            AES-256-CBC encrypt/decrypt
│   │       ├── appError.utils.js         Custom error class
│   │       └── catchAsync.js             Async error wrapper
│   └── package.json
├── frontend/
│   ├── index.html                        Entry point
│   ├── src/
│   │   ├── main.jsx                      React root
│   │   ├── App.jsx                       Router & main layout
│   │   ├── components/
│   │   │   ├── CreateSecret.jsx          Form to create & copy link
│   │   │   └── ViewSecret.jsx            Reveal button & decrypt UI
│   │   └── index.css                     Global styles
│   └── package.json
└── README.md
```

---

## 5. Setup & Run

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL and MASTER_KEY — see Section 6

# 3. Initialise the database
npm run db:init

# 4. Start the server
npm run dev       # development (nodemon)
npm start         # production
```

Open `web/index.html` in a browser (e.g. VS Code Live Server on port 5500).

**Local PostgreSQL via Docker:**

```bash
docker-compose up -d
```

---

## 6. Environment Variables

| Variable          | Required | Description                                                                                                                         |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`    | Yes      | PostgreSQL connection string — `postgresql://user:pass@localhost:5432/secret_drop`                                                  |
| `MASTER_KEY`      | Yes      | 64-char hex string (32 bytes) for AES-256-GCM. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `PORT`            | No       | Server port (default: `3000`)                                                                                                       |
| `FRONTEND_ORIGIN` | No       | Allowed CORS origin (default: `http://localhost:5500`)                                                                              |

---

## 7. API Reference

### `POST /api/secrets` — Create a secret

**Request body**

```json
{ "secret": "my-password", "ttl": 3600 }
```

| Field    | Type   | Description                                     |
| -------- | ------ | ----------------------------------------------- |
| `secret` | string | Plaintext to store                              |
| `ttl`    | number | Expiry in seconds from now (min 60, max 604800) |

**Response `201 Created`**

```json
{
  "id": "<uuid>",
  "link": "http://…/web/index.html?id=<uuid>",
  "expiresAt": "…"
}
```

---

### `GET /api/secrets/:id` — Retrieve and burn

**Response `200 OK`** — secret returned, permanently deleted from the database

```json
{ "secret": "my-password" }
```

**Response `404 Not Found`** — does not exist, already viewed, or expired

> **Note for candidate:** If your bot-protection strategy changes the method or path of this endpoint, update this section to reflect your actual implementation.

---

## 8. Challenge 1 — Race Condition Prevention

> **Requirement:** If two requests hit the same link at the exact same millisecond, only one must receive the secret. The other must get a 404.

### Strategy

_Write here — name the approach (e.g. atomic SQL UPDATE, pessimistic locking, Redis SETNX, etc.)_

### Implementation

_Write here — describe which file and function handles this, and why the chosen database operation is atomic._

```sql
-- Paste the key query here
```

### Why this works under concurrency

_Write here — explain the guarantee. What happens to the losing request?_

---

## 9. Challenge 2 — Crawler / Bot Protection

> **Requirement:** Automated crawlers (Slack previews, WhatsApp link cards, search bots) must not accidentally burn the secret by fetching the share URL.

### Strategy

_Write here — name the approach (e.g. POST-only burn endpoint, X-Requested-With header, two-step reveal, CAPTCHA, etc.)_

### Implementation

_Write here — describe the full request flow a human takes vs what a crawler sees. Reference the relevant files._

### Why bots cannot trigger the burn

_Write here — explain specifically what stops a bot, and whether your approach can be spoofed._

---

## 10. Challenge 3 — Resilient Cleanup

> **Requirement:** A secret must be inaccessible after `expires_at` even if the server was offline when it expired. Storage should eventually be reclaimed.

### Strategy

_Write here — describe the two layers: (a) how inaccessibility is enforced and (b) how physical deletion happens._

### Implementation

_Write here — where is `expires_at` checked on each request? Where does the cleanup job live? What happens on server restart?_

```sql
-- Paste the cleanup query here
```

### Why this survives server restarts

_Write here — explain why correctness does not depend on the server being continuously running._

---

## 11. Trade-offs & What I'd Do Differently

> Honest reflection. What shortcuts did you take? What would you improve with more time?

for AES algorith,generate readme2.md and test/verify cases i use ai .
I will improve sending url through email and implement auth system with jwt if i have even more time.
