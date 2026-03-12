# FormForge Backend

Fastify + tRPC + Prisma service that powers FormForge.

## Running locally

1. Start infrastructure (Postgres + Redis):

```bash
cd ../../docker
docker compose -f docker-compose.dev.yml up -d
```

2. Configure database URL in `backend/.env`:

```bash
DATABASE_URL="postgresql://formforge:formforge@localhost:5432/formforge?schema=public"
```

3. Install dependencies and run Prisma migrations:

```bash
cd ../backend
pnpm install
pnpm prisma migrate dev --name init
```

4. Run the dev server:

```bash
pnpm dev
```

The API will be available at `http://localhost:4000/trpc` with a health check on `http://localhost:4000/health`.

