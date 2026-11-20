export type AnnouncementType = 'General' | 'Important' | 'Maintenance';

export type AnnouncementStatus = 'Published' | 'Draft';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  type: AnnouncementType;
  date: Date;
  status: AnnouncementStatus;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorEmail?: string;
}

export interface AnnouncementFormInput {
  title: string;
  description: string;
  type: AnnouncementType;
  date: string;
  status: AnnouncementStatus;
}

export interface DashboardStats {
  total: number;
  published: number;
  general: number;
  important: number;
  maintenance: number;
}

export interface ToastNotification {
  id: string;
  variant: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
