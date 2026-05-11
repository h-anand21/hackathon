# PollSphere Master Implementation Plan

This document maps out the entire 9-phase build process, specifically targeting the exact file structure created for the PollSphere monorepo.

---

## Phase 1: Project Setup (✅ COMPLETED)
**Goal:** Establish the root architecture.
* Created the `PollSphere` root directory.
* Set up the exact nested structure for both `backend/` and `frontend/`.
* Placed configuration files (`package.json`, `docker-compose.yml`, `.env`) in their appropriate locations.

---

## Phase 2: Authentication
**Goal:** Secure the application and sync user data via Clerk JWTs.
* **Backend:**
  * `models/user.model.ts`: Define the Mongoose schema for syncing Clerk users (clerkId, email).
  * `middlewares/auth.middleware.ts`: Implement Clerk JWT verification.
  * `services/auth.service.ts` & `controllers/auth.controller.ts`: Logic to fetch and sync the user profile.
  * `routes/auth.routes.ts`: Expose `GET /api/auth/me`.
* **Frontend:**
  * `main.tsx`: Wrap the application in `<ClerkProvider>`.
  * `api/auth.api.ts`: API functions to call the backend `/me` route.
  * `hooks/useAuth.ts`: Custom hook exposing the synced user state.

---

## Phase 3: Poll CRUD + Schema
**Goal:** Build the core data models and REST endpoints for Polls and Questions.
* **Backend:**
  * `models/poll.model.ts`, `question.model.ts`, `option.model.ts`: Create strict schemas enforcing expiry limits, response modes (anonymous/authenticated), and ownership.
  * `validators/poll.validator.ts`: Zod schemas to ensure type-safe request bodies.
  * `services/poll.service.ts` & `question.service.ts`: Database manipulation logic.
  * `controllers/poll.controller.ts` & `question.controller.ts`: API request handlers.
  * `routes/poll.routes.ts` & `question.routes.ts`: Map the endpoints (`POST /api/polls`, `GET /api/polls/:id`, etc.).

---

## Phase 4: Poll Builder (Frontend)
**Goal:** Create the creator-facing React UI for poll creation.
* **Frontend:**
  * `forms/CreatePollForm.tsx` & `QuestionForm.tsx`: Build dynamic forms using React Hook Form and zodResolver.
  * `pages/CreatePollPage.tsx`: Assemble the main poll builder UI, including expiry pickers and mandatory/optional question toggles.
  * `api/poll.api.ts`: Client functions to hit the Phase 3 backend endpoints via Axios.

---

## Phase 5: Public Response Flow
**Goal:** Allow users to vote securely, strictly enforcing poll expiry and duplication rules.
* **Backend:**
  * `models/response.model.ts` & `answer.model.ts`: Store individual user votes.
  * `validators/response.validator.ts`: Validate that mandatory questions are answered.
  * `services/response.service.ts`: Check poll expiry dates, handle anonymous vs. authenticated limits (1 response per user per poll).
  * `controllers/response.controller.ts` & `routes/public.routes.ts`: Expose `POST /api/public/poll/:shareId/submit`.
* **Frontend:**
  * `pages/PollPage.tsx` & `ExpiredPage.tsx`: UI for voters to fill out the poll, or a fallback if the poll has expired.
  * `forms/ResponseForm.tsx`: The actual vote submission form.
  * `api/response.api.ts`: Client wrappers for submitting votes.

---

## Phase 6: Analytics & Publish
**Goal:** Aggregate response data and allow creators to publish public results.
* **Backend:**
  * `services/analytics.service.ts`: Build highly efficient MongoDB aggregation pipelines to calculate participation rates and option counts.
  * `controllers/analytics.controller.ts` & `publish.controller.ts`: Endpoints to fetch data and toggle the `published` flag on a poll.
  * `routes/analytics.routes.ts`.
* **Frontend:**
  * `pages/AnalyticsPage.tsx`: Creator dashboard to view statistics.
  * `components/analytics/AnalyticsChart.tsx` & `ParticipationStats.tsx`: Visual components for data display.
  * `pages/PublishedResultPage.tsx`: Public view for anyone with the URL to see results (if published).

---

## Phase 7: Real-time (Socket.IO)
**Goal:** Power live response counts and analytics updates using WebSockets.
* **Backend:**
  * `config/socket.ts`: Initialize the Socket.IO server with a Redis adapter for scaling.
  * `sockets/poll.socket.ts` & `analytics.socket.ts`: Event listeners (`poll:joined`) and emitters (`response:submitted`, `analytics:update`).
* **Frontend:**
  * `socket/socket.ts`: Setup the `socket.io-client` connection.
  * `hooks/useSocket.ts`: React hook to bind components to real-time events seamlessly.

---

## Phase 8: Docker & Environment
**Goal:** Containerize the application for consistent environments.
* **Backend:** `Dockerfile` setup for the Node/Express environment.
* **Frontend:** `Dockerfile` setup for the Vite environment.
* **Root:** Finalize `docker-compose.yml` to orchestrate Backend, Frontend, and local Redis.
* Finalize `.env.example` configurations.

---

## Phase 9: Deployment & Documentation
**Goal:** Prepare PollSphere for the hackathon submission.
* **Documentation:** Write a comprehensive `README.md` outlining the architecture, tech stack, and run instructions.
* **Deployment Setup (Optional depending on hackathon rules):** Vercel for Frontend, Render/Railway for Backend, Upstash for Cloud Redis.
