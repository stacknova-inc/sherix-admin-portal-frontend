export type ApiId = string;

export interface ApiTimestamped {
  _id?: ApiId;
  id?: ApiId;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service extends ApiTimestamped {
  name?: string;
  title?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  status?: string;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  icon: string;
}

export type UpdateServiceInput = Partial<CreateServiceInput> & {
  isActive?: boolean;
};

export interface Issue extends ApiTimestamped {
  service?: string | Service;
  issueTitle?: string;
  title?: string;
  issueDescription?: string;
  description?: string;
  issueMinPrice?: number;
  issueMaxPrice?: number;
  isActive?: boolean;
  status?: string;
}

export interface CreateIssueInput {
  service: string;
  issueTitle: string;
  issueDescription: string;
  issueMinPrice: number;
  issueMaxPrice: number;
}

export type UpdateIssueInput = Partial<CreateIssueInput> & {
  isActive?: boolean;
};

export interface AdCampaign extends ApiTimestamped {
  title?: string;
  image?: string;
  imageUrl?: string;
  imageURL?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  isActive?: boolean;
}

export interface CreateAdCampaignInput {
  image: File;
  title: string;
  startDate: string;
  endDate: string;
}

export type UpdateAdCampaignInput = Partial<Omit<CreateAdCampaignInput, "image">> & {
  image?: File;
};

export interface LegalDocument extends ApiTimestamped {
  name?: string;
  documentName?: string;
  title?: string;
  fileName?: string;
  fileType?: string;
  mimeType?: string;
  type?: string;
  document?: unknown;
  file?: unknown;
  pdf?: unknown;
  url?: string;
  fileUrl?: string;
  documentUrl?: string;
  pdfUrl?: string;
  path?: string;
  location?: string;
  uploadedBy?: unknown;
  uploadedAt?: string;
}

export interface Company extends ApiTimestamped {
  name?: string;
  companyName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  services?: Array<string | Service>;
  location?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  status?: string;
  verificationStatus?: string;
  isActive?: boolean;
  isEmployee?: boolean;
}

export interface ServiceProvider extends Company {
  user?: unknown;
  provider?: unknown;
  serviceProvider?: unknown;
  company?: unknown;
  business?: unknown;
  owner?: unknown;
  admin?: unknown;
  userId?: string;
  providerId?: string;
  serviceProviderId?: string;
  companyId?: string;
  mechanicId?: string;
}

export interface User extends ApiTimestamped {
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  type?: string;
  userType?: string;
  status?: string;
  isActive?: boolean;
}

export interface AdminNotification extends ApiTimestamped {
  title?: string;
  message?: string;
  description?: string;
  type?: string;
  channel?: string;
  channels?: string[];
  audience?: string;
  recipient?: unknown;
  recipients?: unknown[];
  sentTo?: string | number;
  status?: string;
  createdAt?: string;
  sentAt?: string;
  updatedAt?: string;
}

export type NotificationRoleValue =
  | "customer"
  | "mechanic"
  | "company_admin"
  | "sherix_admin"
  | "finance_admin"
  | "human_resources_admin"
  | "customer_support_admin"
  | "operations_admin"
  | "marketing_admin"
  | "compliance_admin"
  | "technical_support_admin"
  | "business_development_admin";

export type NotificationChannelValue = "push" | "sms" | "email";

export type NotificationCategoryValue =
  | "job_update"
  | "announcement"
  | "reminder"
  | "alert"
  | "security"
  | "promotion"
  | "system";

export interface BroadcastNotificationInput {
  title: string;
  description: string;
  roles: NotificationRoleValue[];
  channel: NotificationChannelValue;
  category: NotificationCategoryValue;
}

export interface BroadcastNotificationResult {
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

export interface DashboardSummary {
  [key: string]: unknown;
}

export interface DashboardAnalytics {
  [key: string]: unknown;
}

export interface Dispute extends ApiTimestamped {
  jobId?: string;
  booking?: unknown;
  raisedBy?: unknown;
  against?: unknown;
  reason?: string;
  status?: string;
  amount?: number;
}

export interface Booking extends ApiTimestamped {
  requestId?: string;
  service?: unknown;
  customer?: unknown;
  provider?: unknown;
  location?: string;
  amount?: number;
  status?: string;
  priority?: string;
  paymentStatus?: string;
}

export interface FinancialEarnings {
  [key: string]: unknown;
}

export interface Transaction extends ApiTimestamped {
  type?: string;
  relatedTo?: string;
  from?: unknown;
  to?: unknown;
  method?: string;
  amount?: number;
  status?: string;
}

export type StaffStatus = "Active" | "Suspended" | "Inactive";

export interface StaffRoleDefinition {
  department: string;
  role: string;
  label: string;
}

export interface StaffMember extends ApiTimestamped {
  fullName: string;
  name?: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  status: StaffStatus;
  isActive?: boolean;
  lastLogin?: string;
  lastActivityAt?: string;
  deletedAt?: string;
}

export interface CreateStaffInput {
  fullName?: string;
  name?: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateStaffInput {
  fullName?: string;
  name?: string;
  email?: string;
  phoneNumber: string;
  department: string;
  role: string;
  isActive?: boolean;
}

export type StaffAuditAction =
  | "Staff creation"
  | "Staff updates"
  | "Role changes"
  | "Status changes"
  | "Password resets"
  | "Deletions";

export interface StaffAuditLog {
  id: string;
  staffId: string;
  actionType: StaffAuditAction;
  performedBy: string;
  timestamp: string;
  note: string;
}

export interface StaffNotification {
  id: string;
  staffId: string;
  type: "Account created" | "Password reset" | "Role changed" | "Account suspended" | "Account activated";
  sentTo: string;
  timestamp: string;
  message: string;
}
