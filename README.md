# Society Maintenance Tracker

## Overview
Society Maintenance Tracker is a full-stack, end-to-end community management application designed to streamline the handling of maintenance requests, society notices, and email communications. It empowers residents to seamlessly report and track issues while providing administrators with a powerful dashboard to monitor analytics, manage complaints, broadcast notices, and oversee maintenance operations.

### Key Features
- **Role-Based Access Control:** Distinct experiences for `ADMIN` and `RESIDENT` users.
- **Complaint Management Lifecycle:** Track issues from submission to resolution, complete with priority levels, status updates, photo uploads, and full audit histories.
- **Automated Overdue Detection:** Configurable threshold (e.g., 7 days) to automatically flag unresolved complaints as overdue.
- **Analytics Dashboard:** Visual insights into complaint distributions, monthly trends, and SLA performance.
- **Notice Board:** Broadcast important community announcements.
- **Email Notifications:** Built-in email integration (Resend) to notify residents of status changes, with automatic retry logs.

---

## Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS v4
- **State & Data Visualization:** React Hooks, Recharts
- **Icons:** Lucide React

### Backend
- **Framework:** Node.js + Express 5 + TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma 7 (`@prisma/adapter-pg`)
- **Authentication:** JWT (JSON Web Tokens) with `bcryptjs`
- **File Uploads:** Local filesystem storage via `multer`
- **Email Delivery:** Resend API

---

## Installation

### Prerequisites
- Node.js (v20+)
- PostgreSQL running locally (Default port: 5432)

### 1. Database Setup
Create the PostgreSQL database:
```sql
CREATE DATABASE society_tracker;
```

### 2. Environment Variables
You must configure the `.env` files in both the client and server directories. See the respective `.env.example` files for reference.

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/society_tracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
RESEND_API_KEY="re_placeholder_key"
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Server Setup
```bash
cd server
npm install
npx prisma db push
npm run seed
npm run dev
```
*The backend API will run on http://localhost:5000*

### 4. Client Setup
```bash
cd client
npm install
npm run dev
```
*The frontend application will run on http://localhost:5173*

---

## Local File Uploads
The application handles image uploads (JPEG, PNG, WebP) natively via the local file system. 
When a resident attaches an image to a complaint, the backend automatically generates a `server/uploads/complaints/` directory (if it doesn't already exist). These files are served statically by Express at the `/uploads` route.
*Note: The `uploads/` directory is intentionally excluded from version control.*

---

## Database Setup & Demo Accounts
Running `npm run seed` in the `server` directory will automatically populate the database with realistic demo data, including mock complaints and notices.

**Demo Accounts:**
- **Admin User:** `admin@society.com` | Password: `password123`
- **Resident User:** `resident1@society.com` | Password: `password123`

---

## Deployment Instructions

### Frontend (e.g., Vercel, Netlify)
1. Set the build command to `npm run build` and output directory to `dist`.
2. Configure the `VITE_API_URL` environment variable to point to your live backend domain.

### Backend (e.g., Render, Railway, AWS)
1. Set the build command to `npm install && npm run build`.
2. Set the start command to `npm run start`.
3. Configure all environment variables (`DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, etc.).
4. **Persistent Storage:** Since file uploads use the local filesystem, ensure your deployment provider supports a persistent disk volume mapped to the `server/uploads` directory, or refactor the upload middleware to use an S3-compatible cloud bucket.

### Database
Deploy a managed PostgreSQL instance (e.g., Supabase, Neon, AWS RDS) and supply the connection string to the backend's `DATABASE_URL`. Run `npx prisma db push` as part of your CI/CD pipeline to keep schemas synchronized.

---

## Troubleshooting

- **CORS Errors:** Ensure your `CLIENT_URL` in `server/.env` exactly matches your frontend's running URL (e.g., `http://localhost:5173` without a trailing slash).
- **Upload Failures:** Ensure the backend process has file write permissions for the directory where it's attempting to create `server/uploads`.
- **TypeScript Module Errors:** The project utilizes `verbatimModuleSyntax`. If adding new types, always import them using `import type { ... } from '...';`.
