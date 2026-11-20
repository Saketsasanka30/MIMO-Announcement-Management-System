import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import type {
  Announcement,
  AnnouncementFormInput,
  AnnouncementStatus,
  AnnouncementType,
} from '../types/announcement';
import { db, handleFirestoreError, OperationType } from './firebase';

export const ANNOUNCEMENT_TITLE_MIN = 1;
export const ANNOUNCEMENT_TITLE_MAX = 160;
export const ANNOUNCEMENT_DESCRIPTION_MIN = 1;
export const ANNOUNCEMENT_DESCRIPTION_MAX = 3000;
export const ALLOWED_TYPES: AnnouncementType[] = ['General', 'Important', 'Maintenance'];
export const ALLOWED_STATUSES: AnnouncementStatus[] = ['Published', 'Draft'];

const COLLECTION_NAME = 'announcements';

export function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function parseDateInput(dateString: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

export function validateAnnouncementInput(input: AnnouncementFormInput): {
  valid: boolean;
  errors: Partial<Record<keyof AnnouncementFormInput, string>>;
} {
  const errors: Partial<Record<keyof AnnouncementFormInput, string>> = {};
  const trimmedTitle = input.title.trim();
  const trimmedDesc = input.description.trim();

  if (trimmedTitle.length < ANNOUNCEMENT_TITLE_MIN) {
    errors.title = 'Announcement title is required.';
  } else if (trimmedTitle.length > ANNOUNCEMENT_TITLE_MAX) {
    errors.title = `Title must be ${ANNOUNCEMENT_TITLE_MAX} characters or fewer.`;
  }

  if (trimmedDesc.length < ANNOUNCEMENT_DESCRIPTION_MIN) {
    errors.description = 'Description is required.';
  } else if (trimmedDesc.length > ANNOUNCEMENT_DESCRIPTION_MAX) {
    errors.description = `Description must be ${ANNOUNCEMENT_DESCRIPTION_MAX} characters or fewer.`;
  }

  if (!ALLOWED_TYPES.includes(input.type)) {
    errors.type = 'Please select a valid announcement type.';
  }

  if (!parseDateInput(input.date)) {
    errors.date = 'Please choose a valid announcement date.';
  }

  if (!ALLOWED_STATUSES.includes(input.status)) {
    errors.status = 'Please choose Published or Draft.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function toJsDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function parseAnnouncementDoc(snapshot: QueryDocumentSnapshot): Announcement {
  const data = snapshot.data();
  const rawType = String(data.type ?? 'General');
  const rawStatus = String(data.status ?? 'Draft');

  return {
    id: snapshot.id,
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    type: ALLOWED_TYPES.includes(rawType as AnnouncementType)
      ? (rawType as AnnouncementType)
      : 'General',
    date: toJsDate(data.date),
    status: ALLOWED_STATUSES.includes(rawStatus as AnnouncementStatus)
      ? (rawStatus as AnnouncementStatus)
      : 'Draft',
    createdAt: toJsDate(data.createdAt),
    updatedAt: toJsDate(data.updatedAt),
    authorId: String(data.authorId ?? ''),
    authorEmail: typeof data.authorEmail === 'string' ? data.authorEmail : undefined,
  };
}

function sortNewestFirst(items: Announcement[]): Announcement[] {
  return [...items].sort((a, b) => {
    const dateDiff = b.date.getTime() - a.date.getTime();
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function subscribePublishedAnnouncements(
  onData: (items: Announcement[]) => void,
  onError: (err: Error) => void
): () => void {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'Published')
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const parsed = snapshot.docs.map(parseAnnouncementDoc);
      onData(sortNewestFirst(parsed));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeAllAnnouncements(
  onData: (items: Announcement[]) => void,
  onError: (err: Error) => void
): () => void {
  const colRef = collection(db, COLLECTION_NAME);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const parsed = snapshot.docs.map(parseAnnouncementDoc);
      onData(sortNewestFirst(parsed));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function createAnnouncement(
  input: AnnouncementFormInput,
  user: User
): Promise<string> {
  const validation = validateAnnouncementInput(input);
  if (!validation.valid) {
    const firstErr = Object.values(validation.errors)[0] || 'Invalid announcement data.';
    throw new Error(firstErr);
  }

  const parsedDate = parseDateInput(input.date);
  if (!parsedDate) {
    throw new Error('Please choose a valid announcement date.');
  }

  const sanitizedTitle = input.title.trim().slice(0, ANNOUNCEMENT_TITLE_MAX);
  const sanitizedDescription = input.description.trim().slice(0, ANNOUNCEMENT_DESCRIPTION_MAX);

  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title: sanitizedTitle,
      description: sanitizedDescription,
      type: input.type,
      date: Timestamp.fromDate(parsedDate),
      status: input.status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      authorId: user.uid,
      ...(user.email ? { authorEmail: user.email.slice(0, 256) } : {}),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, COLLECTION_NAME);
  }
}

export async function updateAnnouncement(
  announcementId: string,
  input: AnnouncementFormInput
): Promise<void> {
  const validation = validateAnnouncementInput(input);
  if (!validation.valid) {
    const firstErr = Object.values(validation.errors)[0] || 'Invalid announcement data.';
    throw new Error(firstErr);
  }

  const parsedDate = parseDateInput(input.date);
  if (!parsedDate) {
    throw new Error('Please choose a valid announcement date.');
  }

  const sanitizedTitle = input.title.trim().slice(0, ANNOUNCEMENT_TITLE_MAX);
  const sanitizedDescription = input.description.trim().slice(0, ANNOUNCEMENT_DESCRIPTION_MAX);
  const targetPath = `${COLLECTION_NAME}/${announcementId}`;

  try {
    await updateDoc(doc(db, COLLECTION_NAME, announcementId), {
      title: sanitizedTitle,
      description: sanitizedDescription,
      type: input.type,
      date: Timestamp.fromDate(parsedDate),
      status: input.status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, targetPath);
  }
}

export async function toggleAnnouncementStatus(
  announcementId: string,
  nextStatus: AnnouncementStatus
): Promise<void> {
  if (!ALLOWED_STATUSES.includes(nextStatus)) {
    throw new Error('Invalid publication status.');
  }
  const targetPath = `${COLLECTION_NAME}/${announcementId}`;
  try {
    await updateDoc(doc(db, COLLECTION_NAME, announcementId), {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, targetPath);
  }
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  const targetPath = `${COLLECTION_NAME}/${announcementId}`;
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, announcementId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, targetPath);
  }
}
