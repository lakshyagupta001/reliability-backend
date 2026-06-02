# Reliability Dashboard Backend

TypeScript + Express backend for the Reliability Project Management System.

## Current Scope

Implemented so far:

- Express server setup
- Health check endpoint
- JWT login authentication
- Authenticated current-user endpoint
- Stateless logout endpoint
- ADMIN / EMPLOYEE RBAC model
- Permission-based authorization middleware
- Prisma ORM database architecture
- PostgreSQL-ready schema aligned with `documents/database_schema.md`
- Seed script for initial ADMIN and EMPLOYEE users

## Architecture

The backend follows this modular structure:

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.types.ts
│   │   │
│   │   ├── projects/
│   │   │   ├── project.controller.ts
│   │   │   ├── project.service.ts
│   │   │   ├── project.routes.ts
│   │   │   └── project.types.ts
│   │   │
│   │   ├── reliability-requirements/
│   │   │   ├── rr.controller.ts
│   │   │   ├── rr.service.ts
│   │   │   ├── rr.routes.ts
│   │   │   ├── rr.validation.ts
│   │   │   └── rr.types.ts
│   │   │
│   │   └── reports/
│   │       ├── report.controller.ts
│   │       ├── report.service.ts
│   │       ├── report.routes.ts
│   │       └── report.types.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validate.middleware.ts
│   │
│   ├── prisma/
│   │   └── prisma.client.ts
│   │
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── async-handler.ts
│   │   └── errors/
│   │
│   ├── config/
│   ├── types/
│   ├── app.ts
│   └── server.ts
```

Only authentication and authorization are implemented right now. Other module files are placeholders for the next development phases.

## Database

The backend uses PostgreSQL through Prisma ORM.

The current Aiven database already contains tables in the `public` schema, so this backend uses a dedicated PostgreSQL schema named `reliability_dashboard` to avoid touching existing data.

For Aiven/cloud PostgreSQL, configure `DATABASE_URL` in `.env` using SSL:

```env
DATABASE_URL="postgresql://avnadmin:<password>@<host>:<port>/<database>?sslmode=require&schema=reliability_dashboard"
```

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run dev
```

If you do not want to create a migration file locally and only want to sync the schema to a development database, use:

```bash
npm run db:push
npm run db:seed
```

## Seeded Users

Both users are seeded with password:

```text
Pass@123
```

ADMIN:

```text
email: ameysamant@bluestarindia.com
password: Pass@123
```

EMPLOYEE:

```text
email: lakshyagupta@bluestarindia.com
password: Pass@123
```

## Endpoints

Base URL: `http://localhost:4000/api/v1`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check, no auth required |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `POST` | `/api/v1/auth/logout` | Stateless logout, JWT required |
| `GET` | `/api/v1/auth/me` | Current authenticated user, JWT required |

## Authorization Usage

For future modules, protect routes with role authorization:

```ts
router.put('/projects/:id', authenticate, authorizeRoles('ADMIN'), updateProject);
```

Or permission authorization:

```ts
router.get('/dashboard/stats', authenticate, authorizePermissions('dashboard:view'), getStats);
```
