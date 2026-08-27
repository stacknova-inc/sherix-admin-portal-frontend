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

export interface Commission extends ApiTimestamped {
  serviceId?: string;
  serviceName?: string;
  serviceSlug?: string;
  commissionPercent?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  effectivePercent?: number;
  source?: string;
  isActive?: boolean;
  version?: number;
  createdBy?: string;
}

export interface CommissionInput {
  serviceId: string;
  commissionPercent: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  expectedVersion?: number;
  reason?: string;
}

export interface BulkCommissionEntry {
  serviceId: string;
  commissionPercent: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  expectedVersion?: number;
  reason?: string;
}

export interface BulkCommissionInput {
  reason: string;
  commissions: BulkCommissionEntry[];
}

export interface CallOutPolicy {
  expiryMinutes?: number;
  searchRadiusKm?: number;
  escalationRadiusKm?: number;
  escalationEnabled?: boolean;
  arrivalRadiusMeters?: number;
  etaSpeedKmh?: number;
  maxConcurrentOffers?: number;
  rebroadcastEnabled?: boolean;
  smsEnabled?: boolean;
}

export interface CustomerFeesPolicy {
  enabled?: boolean;
  bookingFeeAmount?: number;
  serviceFeePercent?: number;
  minFee?: number;
  maxFee?: number;
}

export interface GlobalCommissionPolicy {
  mechanicServicePercent?: number;
  storeSalePercent?: number;
}

export interface PayoutSplit {
  label?: string;
  entity?: "mechanic" | "platform" | string;
  percent?: number;
}

export interface PayoutPolicy {
  settlementEnabled?: boolean;
  settlementPeriodDays?: number;
  minPayoutAmount?: number;
  splits?: PayoutSplit[];
}

export interface PaymentPolicy {
  cashEnabled?: boolean;
  enabledMethods?: string[];
}

export interface InvitationPolicy {
  companyInvitationExpiryHours?: number;
  mechanicInvitationExpiryHours?: number;
}

export interface AvailabilityPolicy {
  enabled?: boolean;
  open24Hours?: boolean;
  defaultOpen?: string;
  defaultClose?: string;
  allowWeekends?: boolean;
}

export interface CoveragePolicy {
  enabled?: boolean;
  defaultRadiusKm?: number;
  maxRadiusKm?: number;
}

export interface MatchingPolicy {
  matchByService?: boolean;
  requireOnline?: boolean;
  requireAvailable?: boolean;
  requireZeroBalanceDue?: boolean;
  maxBroadcastMechanics?: number;
  sortBy?: string;
}

export interface PolicyConfig {
  callOut?: CallOutPolicy;
  customerFees?: CustomerFeesPolicy;
  commissions?: GlobalCommissionPolicy;
  payout?: PayoutPolicy;
  payment?: PaymentPolicy;
  invitation?: InvitationPolicy;
  availability?: AvailabilityPolicy;
  coverage?: CoveragePolicy;
  matching?: MatchingPolicy;
  version?: number;
  updatedAt?: string;
  updatedBy?: string;
  [key: string]: unknown;
}

export type PolicyConfigUpdateInput = Partial<Omit<PolicyConfig, "version" | "updatedAt" | "updatedBy">> & {
  expectedVersion: number;
  reason?: string;
};

export interface PolicyConfigHistoryEntry extends ApiTimestamped {
  version?: number;
  reason?: string;
  changedBy?: string;
  changes?: Record<string, unknown>;
  [key: string]: unknown;
}

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

export interface CompanyEvidence {
  url?: string;
  label?: string;
  type?: string;
}

export interface CompanyMembership {
  plan?: string;
  status?: string;
  joinedAt?: string;
  expiresAt?: string;
}


export interface ProviderKyc {
  status?: "pending" | "approved" | "rejected" | string;
  submittedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  documents?: unknown[];
}

export interface Company extends ApiTimestamped {
  /** The ID required by the company verification/account endpoints. */
  companyId?: ApiId;
  name?: string;
  companyName?: string;
  businessName?: string;
  email?: string;
  phone?: string;
  services?: Array<string | Service>;
  location?: string;
  coverageArea?: string;
  address?: string;
  rating?: number;
  reviews?: number;
  /** Account lifecycle status ("Pending" | "Active" | "Suspended"). Never derive this from `kyc.status`. */
  status?: "Pending" | "Active" | "Suspended" | string;
  kyc?: ProviderKyc;
  isEmployee?: boolean;
  /** Not yet returned by the backend; the details modal reads these defensively. */
  businessRegistrationNumber?: string;
  brn?: string;
  responsibleContact?: string | { name?: string; phone?: string; email?: string };
  personnelCount?: number | string;
  staffCount?: number | string;
  identityEvidence?: CompanyEvidence[];
  businessEvidence?: CompanyEvidence[];
  membership?: CompanyMembership;
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
  serviceRequest?: unknown;
  /** @deprecated Kept for backends still nesting the linked record under `booking`. */
  booking?: unknown;
  raisedBy?: unknown;
  against?: unknown;
  reason?: string;
  status?: string;
  amount?: number;
}

export interface ServiceRequest extends ApiTimestamped {
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

export interface ReviewStats {
  averageRating?: number;
  totalReviews?: number;
  reviewsThisWeek?: number;
  positiveReviews?: number;
  negativeReviews?: number;
  pendingReviews?: number;
}

export interface Review extends ApiTimestamped {
  customerId?: string;
  reviewerName?: string;
  mechanicId?: string;
  providerName?: string;
  referenceId?: string;
  referenceType?: string;
  relatedToId?: string;
  relatedToType?: string;
  rating?: number;
  comment?: string;
  images?: string[];
  status?: string;
  isVerified?: boolean;
}

export interface GeneralSettings {
  platformName?: string;
  platformDomain?: string;
  supportEmail?: string;
  supportPhone?: string;
  currency?: string;
  currencyPosition?: string;
  timezone?: string;
  dateFormat?: string;
  timeFormat?: string;
  maintenanceMode?: boolean;
  sessionTimeout?: string;
  [key: string]: unknown;
}

export interface Settings {
  general?: GeneralSettings;
  [key: string]: unknown;
}

export interface Mechanic extends ApiTimestamped {
  /** The user ID required by the mechanic verification/account endpoints. */
  userId?: ApiId;
  name?: string;
  role?: string;
  email?: string;
  phoneNumber?: string;
  company?: string;
  businessName?: string;
  services?: string | Array<string | Service>;
  location?: string;
  profilePhoto?: { url?: string; publicId?: string };
  /** Account lifecycle status ("Pending" | "Active" | "Suspended"). Never derive this from `kyc.status`. */
  status?: "Pending" | "Active" | "Suspended" | string;
  kyc?: ProviderKyc;
  completedJobs?: number;
  completedJobsCount?: number;
}
