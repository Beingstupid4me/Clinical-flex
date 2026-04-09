# Clinical Flex

Clinical Flex is a full-stack pharmacy operations platform for customer ordering, doctor prescriptions, supplier inventory management, and admin oversight.

## Core Capabilities

- Role-based portals: Customer, Doctor, Supplier, Admin
- Live MySQL-backed data via Prisma
- End-to-end purchasing and inventory workflows
- Prescription lifecycle management
- Operational dashboards and audit visibility

## Tech Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- MySQL
- Tailwind CSS

## Local Setup

1. Install dependencies

```bash
npm install
```

2. Ensure your MySQL database exists and update `DATABASE_URL` in `.env`

3. Initialize schema/data

```bash
mysql -u root dbms_deadline < db_setup.sql
```

4. Generate Prisma client and sync

```bash
npm run prisma:generate
npm run prisma:push
```

5. Start app

```bash
npm run dev
```

## Access

- Login page: `/login`
- Admin dashboard: `/dashboard/admin`

Quick access account (for local development):

- `admin@local.test` / `admin123`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run prisma:generate
npm run prisma:push
npm run prisma:studio
```

## Documentation

- `KNOWLEDGE_TRANSFER.md` - Current implementation status and handoff notes
