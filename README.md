# EstateOS

Full-Lifecycle Rental Operations & Property Management Platform.

## Architecture

Monorepo powered by `pnpm`:
- `apps/client`: React 19 + Vite + Tailwind CSS v4 + React Router v7 + TanStack Query v5
- `apps/server`: Express 5 + Node 24 + Prisma v7 + PostgreSQL
- `packages/shared`: Shared Zod schemas and inferred TypeScript types

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example apps/server/.env
# Set DATABASE_URL and generate JWT secrets
```

### 3. Generate Prisma Client & Migrate
```bash
cd apps/server
pnpm prisma:generate
pnpm prisma:migrate --name init
```


