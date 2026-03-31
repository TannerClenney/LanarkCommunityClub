# Lanark Community Club Website

The official website for the Lanark Community Club (LCC) – a community organization in Lanark, Illinois.

Built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, **Prisma**, and **NextAuth**.

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# 4. Seed the database with sample data
npx prisma db seed

# 5. Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the site.

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | NextAuth secret (run `npx auth secret`) | ✅ |
| `AUTH_URL` | Site URL (e.g., `http://localhost:3000`) | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key for donations | Optional |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Optional |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Optional |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | Optional |

---

## Sample Accounts (after seeding)

| Email | Password | Role |
|---|---|---|
| `admin@lanarkcommunityclub.com` | `admin123!` | ADMIN |
| `officer@lanarkcommunityclub.com` | `officer123!` | OFFICER |
| `member@lanarkcommunityclub.com` | `member123!` | MEMBER |

> **Important:** Change all passwords before deploying to production!

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login / Register pages
│   ├── (members)/           # Protected member area
│   │   ├── dashboard/       # Member dashboard
│   │   ├── calendar/        # Member-only calendar
│   │   ├── announcements/   # Announcements board
│   │   ├── forum/           # Discussion threads
│   │   └── profile/         # Account settings
│   ├── admin/               # Protected admin area
│   │   ├── events/          # Manage events
│   │   ├── projects/        # Manage projects
│   │   ├── scholarships/    # Manage scholarships
│   │   ├── gallery/         # Manage photos
│   │   ├── highlights/      # Manage homepage highlights
│   │   ├── announcements/   # Manage announcements
│   │   ├── members/         # Approve/manage members
│   │   └── contact/         # Contact inbox
│   ├── about/               # About page
│   ├── events/              # Public events
│   ├── projects/            # Community projects
│   ├── scholarships/        # Scholarship history
│   ├── gallery/             # Photo gallery
│   ├── donate/              # Donation page
│   ├── contact/             # Contact form
│   ├── actions/             # Server actions
│   └── api/                 # API routes
├── components/
│   ├── forms/               # Form components
│   ├── layout/              # Navbar, Footer, Providers
│   └── ui/                  # Shared UI components
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   ├── db.ts                # Prisma client
│   └── utils.ts             # Shared utilities
└── generated/
    └── prisma/              # Generated Prisma client
```

---

## User Roles

| Role | Description |
|---|---|
| `PENDING` | New account awaiting officer approval |
| `MEMBER` | Approved member – full member area access |
| `OFFICER` | Can manage all content via admin panel |
| `ADMIN` | Full access including officer-level controls |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth v5 (Credentials)
- **Payments:** Stripe (optional, for donations)
- **Deployment:** Vercel-ready

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy – Vercel handles the build automatically

For the database, use [Neon](https://neon.tech), [Supabase](https://supabase.com), or any PostgreSQL provider.

---

## Security Notes

- Passwords are hashed with bcrypt (12 rounds)
- All admin/member routes protected by server-side auth checks
- Server Actions validate input with Zod schemas
- Environment variables kept out of version control
- Member data never exposed to public routes
