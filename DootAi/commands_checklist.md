# DootAI Command Checklist

This file contains the commands you will need to run in your local PowerShell terminal at each phase of development. Cross them off as we go!

---

## Phase 2: Database Setup & Prisma Schema
Run these commands after I have written the `prisma/schema.prisma` and `docker-compose.yml` files.

- [ ] **Start local PostgreSQL (with pgvector)**
  ```powershell
  docker compose up -d
  ```
- [ ] **Run Prisma Database Migrations**
  This creates the tables in your database and generates the Prisma Client.
  ```powershell
  npx prisma migrate dev --name init
  ```

---

## Phase 3: Start the Development Server
Run this command to check if the application compiles and runs.

- [ ] **Start Dev Server**
  ```powershell
  npm run dev
  ```
  The app will be live at `http://localhost:3000`.

---

## Phase 4: Corsair Sync & Auth Setup
Run these commands if we need to set up any environment settings or OAuth credentials during testing.

- [ ] **Install Corsair CLI locally**
  ```powershell
  npm install -g @corsair-dev/cli
  ```
