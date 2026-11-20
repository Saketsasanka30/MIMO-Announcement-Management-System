# MIMO Announcement Management System — Security Specification

## 1. Data Invariants

1. **Public Visibility Isolation**: Unauthenticated and non-admin users can ONLY `get` or `list` documents in `/announcements/{announcementId}` where `resource.data.status == 'Published'`. Any attempt to read or query `Draft` announcements without verified admin privileges is denied.
2. **Admin-Only Mutations**: Only authenticated, email-verified administrators (either a bootstrapped admin email `saketsasanka05@gmail.com` / `chippesaket@gmail.com` or a UID present in `/admins/{uid}`) may `create`, `update`, or `delete` documents in `/announcements/{announcementId}`.
3. **Strict Schema & Boundary Enforcement**: Every write to `/announcements/{announcementId}` must satisfy `isValidAnnouncement(incoming())` (`hasAll` + `hasOnly`, string `.size()` limits `title <= 160`, `description <= 3000`, enum checks for `type` and `status`, `date is timestamp`, and `isValidId(announcementId)`).
4. **Immutable Ownership & Temporal Integrity**: `authorId` must equal `request.auth.uid` on creation and remain immutable on updates. `createdAt` must equal `request.time` on creation and remain immutable on updates. `updatedAt` must equal `request.time` on both creation and updates.
5. **Privilege Escalation Prevention**: Users cannot self-register in `/admins/{adminId}`. Only the bootstrapped verified admin can create, update, or delete `/admins/{adminId}` records.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Unauthenticated Create**: Anonymous request creating an announcement -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: Signed-in user with `email == 'saketsasanka05@gmail.com'` and `email_verified == false` -> `PERMISSION_DENIED`.
3. **Public Draft List**: Unauthenticated `list` query on `/announcements` without `where('status', '==', 'Published')` -> `PERMISSION_DENIED`.
4. **Public Draft Get**: Unauthenticated `get` on a `Draft` announcement document -> `PERMISSION_DENIED`.
5. **Shadow Field Injection**: Admin create/update payload containing extra key `isFeatured: true` -> `PERMISSION_DENIED` (`hasOnly` rejection).
6. **Oversized Title / Denial of Wallet**: Title string of 500 chars (`> 160`) -> `PERMISSION_DENIED`.
7. **Oversized Description**: Description string of 5,000 chars (`> 3000`) -> `PERMISSION_DENIED`.
8. **Invalid Enum Type**: `type: 'Urgent'` (outside `['General', 'Important', 'Maintenance']`) -> `PERMISSION_DENIED`.
9. **Author Spoofing**: Admin create with `authorId: 'someone-else'` != `request.auth.uid` -> `PERMISSION_DENIED`.
10. **Immutable Field Tampering**: Update attempting to change `createdAt` or `authorId` -> `PERMISSION_DENIED`.
11. **Backdated Timestamp Injection**: Create/update passing client timestamp instead of `request.time` for `updatedAt` -> `PERMISSION_DENIED`.
12. **Self-Assigned Admin**: Non-admin user attempting `setDoc` on `/admins/{uid}` -> `PERMISSION_DENIED`.
