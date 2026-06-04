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

export type StaffStatus = "Active" | "Suspended" | "Inactive" | "Pending Invitation";

export interface StaffRoleDefinition {
  department: string;
  role: string;
  label: string;
}

export interface StaffMember extends ApiTimestamped {
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  status: StaffStatus;
  lastLogin?: string;
  lastActivityAt?: string;
  deletedAt?: string;
}

export interface CreateStaffInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateStaffInput {
  fullName: string;
  phoneNumber: string;
  department: string;
  role: string;
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
