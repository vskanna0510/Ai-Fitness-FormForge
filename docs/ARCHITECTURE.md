# FormForge Architecture (High Level)

This document summarizes the architecture implemented in the monorepo.

## Packages

- `frontend` — Next.js 14 App Router UI, pose engine, workout HUD.
- `backend` — Fastify + tRPC API, Prisma ORM, session and analytics services.
- `shared` — Shared TypeScript types and schemas for cross-package consistency.

## Backend Overview

The backend exposes a tRPC API mounted at `/trpc` with routers for:

- `user` — user identity and plan metadata.
- `workout` — workout session lifecycle and rep event ingestion.
- `program` — workout program retrieval (Claude-powered generation will be added).
- `analytics` — aggregate metrics for dashboards.

The database is PostgreSQL via Prisma, with tables for users, exercises, workout sessions, rep events, and programs. A docker-compose stack (to be added) will provide Postgres + Redis for local development.

