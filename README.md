# MIMO Announcement Management System

A real-time announcement management platform built with React, TypeScript, Tailwind CSS, and Firebase (Authentication + Cloud Firestore). The application provides a role-based entry experience separating a focused User announcements feed from a full-featured Administrator workspace, with live synchronization so every change made by an admin appears immediately for users.

## Features

### Role Selection & Authentication
- **Portal Selection**: At startup, users choose whether to enter as a **User** or an **Admin**.
- **Log In & Sign Up**: Supports both **Email/Password** authentication (with email verification for admin privileges) and **Google Sign-In**.
- **Role Isolation**: Users signing into the User portal see only the Announcements page and sign-out controls, without any admin navigation or management UI.

### User Portal (Announcements Feed)
- **Live Real-Time Sync**: Automatically streams all `Published` announcements from Cloud Firestore using `onSnapshot`.
- **Search & Filtering**: Search announcements by title or description, filter by notice type (`All`, `General`, `Important`, `Maintenance`), and sort by newest or oldest date.
- **Full Notice Reader**: Click any notice card to open a detail modal with complete description, category, publication date, and author attribution.

### Admin Portal (Management Workspace)
- **Admin Details Panel**: Displays the authenticated administrator's name, email, verification/role status, UID, and live public sync indicator.
- **Summary Statistics**: Real-time counts for total announcements, published notices, and breakdowns by `General`, `Important`, and `Maintenance`.
- **Full Announcement CRUD**:
  1. **Create** new announcements.
  2. **Enter title and description** with character limits and live validation (`1–160` characters for title, `1–3000` characters for description).
  3. **Select announcement type** (`General`, `Important`, `Maintenance`).
  4. **Set announcement date** via date picker.
  5. **View all created announcements** (both `Published` and `Draft`) in a searchable, filterable table and detail modal.
  6. **Edit existing announcements** or quickly toggle between `Published` and `Draft` status.
  7. **Delete announcements** permanently with a confirmation dialog.
- **Instant User Visibility**: Creating, editing, publishing/unpublishing, or deleting announcements immediately updates connected User feeds in real time.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons
- **Backend / BaaS**: Firebase Authentication, Cloud Firestore (`ai-studio-remixmimoannounc-754a3938-28a6-4f46-8d83-0123a9af59d7`)
- **Security & Validation**: Firestore Security Rules (`firestore.rules`) validated with `@firebase/eslint-plugin-security-rules`, schema blueprint (`firebase-blueprint.json`), and security specification (`security_spec.md`)

## Data Model & Security

- **`/announcements/{announcementId}`**: Stores `title`, `description`, `type`, `date`, `status` (`Published` | `Draft`), `createdAt`, `updatedAt`, `authorId`, and optional `authorEmail`.
  - Users can only read (`get` / `list`) documents where `status == 'Published'`.
  - Only email-verified administrators can create, update, or delete announcements.
- **`/admins/{adminId}`**: Authorized administrator registry keyed by Firebase Auth UID, managed by bootstrapped verified administrators.

## Project Structure

```text
├── firebase-applet-config.json   # Firebase project & Firestore database configuration
├── firebase-blueprint.json       # Entity & collection schema blueprint
├── firestore.rules               # Hardened Firestore security rules
├── security_spec.md              # Security invariants & adversarial test payloads
├── eslint.config.mjs             # ESLint config with Firebase security rules plugin
├── index.html                    # Application HTML entry point
├── src/
│   ├── App.tsx                   # Root application, portal routing, and real-time listeners
│   ├── index.css                 # Global styles and animations
│   ├── main.tsx                  # React DOM mount
│   ├── components/
│   │   ├── AdminDashboardPage.tsx     # Admin details, stats, and announcement table
│   │   ├── AnnouncementEditorPage.tsx # Create & edit announcement form
│   │   ├── AvatarBadge.tsx            # Profile avatar with fallback
│   │   ├── ErrorBoundary.tsx          # Application error boundary
│   │   ├── Overlays.tsx               # Detail modal, delete dialog, and toast notifications
│   │   ├── PortalEntryPage.tsx        # User/Admin role chooser and Login/Sign Up flow
│   │   └── PublicNoticesPage.tsx      # User-facing live announcements feed
│   ├── lib/
│   │   ├── announcements.ts      # Firestore queries, CRUD mutations, and input validation
│   │   ├── auth.ts               # Firebase Auth sign-in, sign-up, verification, and admin checks
│   │   └── firebase.ts           # Firebase initialization and structured error handling
│   └── types/
│       └── announcement.ts       # Shared TypeScript interfaces and types
└── vite.config.ts                # Vite configuration
```

## Scripts

```bash
# Install dependencies
npm install

# Start development server on port 3000
npm run dev

# Build for production
npm run build

# Type-check TypeScript
npm run lint

# Lint Firestore security rules
npx eslint firestore.rules
```

## Deploying to Vercel

1. Push the repository to GitHub/GitLab/Bitbucket and import it into **Vercel** (preset: **Vite**, build command: `npm run build`, output directory: `dist`). `vercel.json` is already configured with SPA fallback rewrites and popup-safe headers.
2. **Authorize your Vercel domain in Firebase**:
   - Open [Firebase Console](https://console.firebase.google.com/) -> **Authentication** -> **Settings** -> **Authorized domains**.
   - Click **Add domain** and add your deployed Vercel domain (e.g. `your-app.vercel.app` and any custom domain) so Google Sign-In works without `auth/unauthorized-domain` errors.
   - Ensure **Email/Password** and **Google** sign-in providers are enabled under **Authentication -> Sign-in method**.

