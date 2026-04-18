# Anon E-Commerce Monorepo

This repository contains four apps:

- `web` - customer storefront (Next.js)
- `admin` - admin panel (Next.js)
- `mobile` - mobile app (Expo + React Native)
- `backend` - API server (NestJS + Prisma)

## Quick Start

<details open>
<summary><strong>1) Install dependencies</strong></summary>

```bash
cd web && npm install
cd ../admin && npm install
cd ../mobile && npm install
cd ../backend && npm install
```

</details>

<details>
<summary><strong>2) Run each app</strong></summary>

```bash
# Storefront
cd web && npm run dev

# Admin panel
cd admin && npm run dev

# Mobile
cd mobile && npm start

# Backend API
cd backend && npm run start:dev
```

</details>

<details>
<summary><strong>3) Build for production</strong></summary>

```bash
cd web && npm run build
cd ../admin && npm run build
cd ../backend && npm run build
```

</details>

## Interactive Docs

Use these expandable sections as a quick in-repo handbook.

<details>
<summary><strong>App ports and defaults</strong></summary>

- `web`: default Next.js port `3000`
- `admin`: configured for port `3001`
- `backend`: NestJS default port `3000` unless changed in env/config
- `mobile`: Expo starts with dev server URL shown in terminal

</details>

<details>
<summary><strong>Common backend commands</strong></summary>

```bash
cd backend
npm run start:dev
npm run test
npm run test:e2e
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

</details>

<details>
<summary><strong>Project structure</strong></summary>

```text
.
|- web/       # customer site
|- admin/     # admin dashboard
|- mobile/    # expo app
|- backend/   # nestjs api
|- assets/    # local design/media assets (git ignored)
|- website-demo-image/ # demo images (git ignored)
`- index.html # local demo entry file (git ignored)
```

</details>

<details>
<summary><strong>Troubleshooting checklist</strong></summary>

- If installs fail, delete `node_modules` in the specific app and reinstall.
- Confirm each app has its own `.env` file when required.
- Make sure backend is running before testing web/admin API flows.
- Use `npm run lint` inside each app to catch quick issues.

</details>
