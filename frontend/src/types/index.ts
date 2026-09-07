export type Role =
  | 'PUBLIC'
  | 'CITIZEN'
  | 'OPERATOR'
  | 'SECRETARY'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export type RequestStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO';

export type AdPlacement =
  | 'FEED'
  | 'SIDEBAR'
  | 'HOME_HERO'
  | 'MAP_BANNER'
  | 'DASHBOARD';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  bio?: string;
  tenantId?: string;
  tenant?: Tenant;
  departmentId?: string;
  isEmailVerified?: boolean;
}

export interface Tenant {
  _id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: {
    primaryColor?: string;
    accentColor?: string;
    autoAssignOperator?: boolean;
    allowPublicComments?: boolean;
    requireEvidenceOnResolution?: boolean;
  };
}

export interface Department {
  _id: string;
  tenantId: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  contactEmail?: string;
  secretaryUserId?: string | User;
  active: boolean;
}

export interface Subcategory {
  name: string;
  slug: string;
  active: boolean;
}

export interface RequestCategory {
  _id: string;
  tenantId: string;
  departmentId: string | Department;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  color: string;
  defaultPriority: RequestPriority;
  slaHours: number;
  subcategories: Subcategory[];
  active: boolean;
}

export interface MediaItem {
  url: string;
  type: MediaType;
  filename?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface RequestAddress {
  formattedAddress: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode?: string;
  reference?: string;
}

export interface RequestItem {
  _id: string;
  protocol: string;
  tenantId: string | Tenant;
  departmentId: string | Department;
  categoryId: string | RequestCategory;
  subcategoryId?: string;
  authorId: string | User;
  assignedToUserId?: string | User;
  title: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: RequestAddress;
  media: MediaItem[];
  supportsCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  resolvedAt?: string;
  resolutionMedia?: MediaItem[];
  resolutionNotes?: string;
  statusHistory?: RequestStatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestStatusHistoryItem {
  _id: string;
  requestId: string;
  status: RequestStatus;
  changedById: User;
  comment?: string;
  evidenceMedia?: MediaItem[];
  createdAt: string;
}

export interface RequestCommentItem {
  _id: string;
  requestId: string;
  authorId: User;
  content: string;
  media?: MediaItem[];
  isInternal?: boolean;
  createdAt: string;
}

export interface AdvertisementItem {
  _id: string;
  advertiserName: string;
  title: string;
  description: string;
  mediaUrl: string;
  targetUrl: string;
  placement: AdPlacement;
  targetCity?: string;
  status: string;
  clicksCount: number;
  impressionsCount: number;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PlanItem {
  _id: string;
  name: string;
  slug: string;
  tier: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    maxRequestsPerMonth: number;
    maxStorageMb: number;
    customDomain: boolean;
    removeAds: boolean;
    advancedAnalytics: boolean;
    operatorsLimit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
