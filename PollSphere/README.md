# 📊 PollSphere

A production-ready, full-stack polling and feedback platform built for speed, security, and real-time engagement. 

PollSphere allows creators to build dynamic polls with strict expiration dates, mandate responses, and visualize voting results in real-time using WebSockets.

---

## 🚀 Features

* **Real-time Analytics:** Watch the voting progress bars grow live on your screen via `Socket.IO` without ever refreshing the page.
* **Strict Expiry Enforcement:** Polls are locked exactly at the microsecond they expire.
* **Smart Authentication:** Built with `Clerk`. Choose between anonymous voting (IP tracking) or authenticated voting (strictly 1 vote per registered user).
* **Robust Validation:** All API routes are protected by `Zod`, ensuring bad data never touches the database.
* **Modern UI:** Built with `React`, `TailwindCSS`, and `TanStack Router` for lightning-fast navigation.

---

## 🛠️ Tech Stack

**Backend:**
* Node.js & Express
* TypeScript
* MongoDB (Mongoose) + Aggregation Pipelines
* Socket.IO (Real-time events)
* Zod (Data Validation)

**Frontend:**
* React (Vite)
* Tailwind CSS
* TanStack Router (Routing)
* React Hook Form (Form management)
* Socket.IO Client

**DevOps:**
* Docker & Docker Compose
* Redis (Configured for caching/rate-limiting expansion)

---

## 🚦 Getting Started (Local Development)

### 1. Prerequisites
Ensure you have Node.js (v20+) and Docker installed.

### 2. Environment Variables
Create a `.env` file in the root `backend` and `frontend` folders using the provided `.env.example`:

**Backend (`backend/.env`):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pollsphere
CLERK_SECRET_KEY=sk_test_...
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Installation
Since the frontend and backend are decoupled, install dependencies separately:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Running the App
Start the backend:
```bash
cd backend
npm run build
npm start
```

Start the frontend:
```bash
cd frontend
npm run dev
```

---

## 🐳 Running with Docker (Production Ready)

To spin up the entire application (Backend, Frontend, and Redis) in isolated containers:

```bash
docker-compose up --build
```
* Frontend will be accessible at `http://localhost:5173`
* Backend will be accessible at `http://localhost:5000`

---

## 🧠 Database Schema Design

* **User:** Synced with Clerk authentication.
* **Poll:** Tracks `expiresAt` and `responseMode` (anonymous vs authenticated).
* **Question / Option:** One-to-Many relationships for dynamic multiple-choice builds.
* **Response:** Uses MongoDB compound indexes to mathematically guarantee a single user can only vote once per poll.

---

Built with ❤️ for the Hackathon.
