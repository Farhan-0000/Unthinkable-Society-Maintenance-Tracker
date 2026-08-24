# System Design & Architecture

## Architecture Overview
The **Society Maintenance Tracker** follows a classic client-server architecture.
- **Frontend (Client):** A React-based Single Page Application (SPA) powered by Vite. It uses client-side routing (`react-router-dom`), context-based state management, and Axios for API communication. Styling is completely driven by Tailwind CSS v4.
- **Backend (Server):** A Node.js/Express API that acts as the source of truth. It handles authentication, validates requests, processes business logic, and interacts with the database.
- **Database:** A PostgreSQL relational database managed by Prisma ORM.

---

## Database Schema
The database is structured around four primary entities:

1. **User**
   - Represents both Admins and Residents.
   - Fields: `id`, `name`, `email`, `passwordHash`, `role` (ADMIN | RESIDENT).
2. **Complaint**
   - The core entity representing a maintenance request.
   - Relates to the `User` who created it (`residentId`).
   - Fields: `category`, `description`, `photoUrl`, `status` (OPEN, IN_PROGRESS, RESOLVED), `priority` (LOW, MEDIUM, HIGH).
3. **ComplaintHistory**
   - An append-only audit log for complaints.
   - Tracks every status change, who made the change (`actorId`), and optional notes.
4. **Notice**
   - Announcements created by admins.
   - Fields: `title`, `content`, `isImportant`, `createdById`.
5. **Setting**
   - Key-value store for global configuration (e.g., `OVERDUE_THRESHOLD`).
6. **EmailLog**
   - Tracks outgoing notification emails (status, retry counts, errors).

---

## Complaint Lifecycle
1. **Creation:** A resident submits a complaint via the frontend form, optionally attaching a photo. The status is initialized to `OPEN`.
2. **Review:** An admin views the complaint on their dashboard. They can update the status to `IN_PROGRESS` and add a note (e.g., "Maintenance staff dispatched").
3. **Resolution:** Once the issue is fixed, the admin marks it as `RESOLVED`.
4. **Audit Trail:** Every status transition automatically generates a `ComplaintHistory` record, ensuring complete transparency for the resident.

---

## Overdue Detection
Overdue detection is computed dynamically rather than stored statically in the database:
1. The global `OVERDUE_THRESHOLD` (e.g., 7 days) is fetched from the `Setting` table.
2. When querying complaints, any complaint that is **not** `RESOLVED` and was created before the threshold date (`Date.now() - 7 days`) is flagged as overdue.
3. Overdue metrics are highlighted on the Admin Dashboard for urgent attention.

---

## Local File Upload Flow
1. **Client:** The user selects an image (JPEG, PNG, WebP) up to 5MB and submits the form as `multipart/form-data`.
2. **Middleware:** The backend `uploadMiddleware` (powered by Multer) intercepts the request.
3. **Storage:** It generates a unique filename (timestamp + random string) and saves it to `server/uploads/complaints/`. If the directory doesn't exist, it creates it automatically.
4. **Database:** The relative URL (`/uploads/complaints/filename.ext`) is saved in the `photoUrl` field of the Complaint record.
5. **Serving:** Express statically serves the `uploads` directory, allowing the frontend to render the image directly.

---

## Email Notification Flow
1. **Trigger:** When an admin changes the status of a complaint, the backend controller invokes the `emailService`.
2. **Dispatch:** The service uses the Resend API to dispatch an HTML-formatted email to the resident.
3. **Logging:** The attempt is logged in the `EmailLog` table.
4. **Failure Handling:** If the email fails, the status is marked as `FAILED` and the error is recorded. Admins can view these logs in the Email Logs dashboard and manually trigger retries via a dedicated API endpoint.
