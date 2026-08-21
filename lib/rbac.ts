
import type { NavRoute } from "@/lib/routes";


export enum StaffRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  HR_ADMIN = "human_resources_admin",
  FINANCE_ADMIN = "finance_admin",
  SUPPORT_ADMIN = "customer_support_admin",
  MARKETING_ADMIN = "marketing_admin",
  OPERATIONS_ADMIN = "operations_admin",
  COMPLIANCE_ADMIN = "compliance_admin",
  TECHNICAL_SUPPORT_ADMIN = "technical_support_admin",
  BUSINESS_DEVELOPMENT_ADMIN = "business_development_admin",
}

export enum Permission {
  DASHBOARD = "dashboard",

  AUTH = "auth",
  NOTIFICATIONS = "notifications",

  SERVICE_REQUESTS = "service_requests",
  VEHICLES = "vehicles",
  ONBOARDING = "onboarding",

  ISSUES = "issues",
  DISPUTES = "disputes",

  USERS = "users",
  STAFF_MANAGEMENT = "staff_management",

  COMPANIES = "companies",
  SERVICES = "services",

  FINANCIAL = "financial",
  EARNINGS = "earnings",
  TRANSACTIONS = "transactions",

  REVIEWS = "reviews",
  AUDIT_LOGS = "audit_logs",

  SETTINGS = "settings",

  REPORTS = "reports",
  ANALYTICS = "analytics",

  MARKETING = "marketing",
  LEGAL = "legal",
}



export const roleLabels: Record<StaffRole, string> = {
  [StaffRole.SUPER_ADMIN]: "Super Admin",
  [StaffRole.HR_ADMIN]: "Human Resource Admin",
  [StaffRole.FINANCE_ADMIN]: "Finance Admin",
  [StaffRole.SUPPORT_ADMIN]: "Customer Support Admin",
  [StaffRole.MARKETING_ADMIN]: "Marketing Admin",
  [StaffRole.OPERATIONS_ADMIN]: "Operations Admin",
  [StaffRole.COMPLIANCE_ADMIN]: "Compliance Admin",
  [StaffRole.TECHNICAL_SUPPORT_ADMIN]: "Technical Support Admin",
  [StaffRole.BUSINESS_DEVELOPMENT_ADMIN]: "Business Development Admin",
};


const ROLE_ALIASES: Record<string, StaffRole> = {
  super_admin: StaffRole.SUPER_ADMIN,
  sherix_admin: StaffRole.SUPER_ADMIN,
  admin: StaffRole.SUPER_ADMIN,
  administrator: StaffRole.SUPER_ADMIN,
  human_resources_admin: StaffRole.HR_ADMIN,
  finance_admin: StaffRole.FINANCE_ADMIN,
  customer_support_admin: StaffRole.SUPPORT_ADMIN,
  marketing_admin: StaffRole.MARKETING_ADMIN,
  operations_admin: StaffRole.OPERATIONS_ADMIN,
  compliance_admin: StaffRole.COMPLIANCE_ADMIN,
  technical_support_admin: StaffRole.TECHNICAL_SUPPORT_ADMIN,
  business_development_admin: StaffRole.BUSINESS_DEVELOPMENT_ADMIN,
};



export const rolePermissions: Record<StaffRole, Permission[]> = {
  [StaffRole.SUPER_ADMIN]: Object.values(Permission),

  [StaffRole.HR_ADMIN]: [
    Permission.DASHBOARD,
    Permission.USERS,
    Permission.STAFF_MANAGEMENT,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.FINANCE_ADMIN]: [
    Permission.DASHBOARD,
    Permission.FINANCIAL,
    Permission.EARNINGS,
    Permission.TRANSACTIONS,
  ],

  [StaffRole.SUPPORT_ADMIN]: [
    Permission.DASHBOARD,
    Permission.USERS,
    Permission.DISPUTES,
    Permission.ISSUES,
    Permission.REVIEWS,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.MARKETING_ADMIN]: [
    Permission.DASHBOARD,
    Permission.MARKETING,
    Permission.ANALYTICS,
    Permission.REPORTS,
    Permission.REVIEWS,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.OPERATIONS_ADMIN]: [
    Permission.DASHBOARD,
    Permission.SERVICE_REQUESTS,
    Permission.SERVICES,
    Permission.COMPANIES,
    Permission.NOTIFICATIONS,
    Permission.REPORTS,
  ],

  [StaffRole.COMPLIANCE_ADMIN]: [
    Permission.DASHBOARD,
    Permission.AUDIT_LOGS,
    Permission.LEGAL,
    Permission.DISPUTES,
    Permission.REPORTS,
    Permission.COMPANIES,
  ],

  [StaffRole.TECHNICAL_SUPPORT_ADMIN]: [
    Permission.DASHBOARD,
    Permission.ISSUES,
    Permission.DISPUTES,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.BUSINESS_DEVELOPMENT_ADMIN]: [
    Permission.DASHBOARD,
    Permission.COMPANIES,
    Permission.USERS,
    Permission.SERVICES,
    Permission.REPORTS,
    Permission.ANALYTICS,
  ],
};



const routePermissions: Array<{
  path: string;
  permission: Permission;
  exact?: boolean;
}> = [
  { path: "/dashboard", permission: Permission.DASHBOARD, exact: true },

  { path: "/dashboard/customers", permission: Permission.USERS },
  { path: "/dashboard/service-providers", permission: Permission.SERVICES },

  { path: "/dashboard/organization-data", permission: Permission.SERVICES },
  { path: "/dashboard/service-categories", permission: Permission.SERVICES },
  { path: "/dashboard/pricing-services", permission: Permission.SERVICES },

  { path: "/dashboard/requests", permission: Permission.SERVICE_REQUESTS },

  { path: "/dashboard/earnings-payments", permission: Permission.EARNINGS },
  { path: "/dashboard/transactions", permission: Permission.TRANSACTIONS },

  { path: "/dashboard/notifications", permission: Permission.NOTIFICATIONS },

  { path: "/dashboard/disputes", permission: Permission.DISPUTES },

  { path: "/dashboard/ratings-reviews", permission: Permission.REVIEWS },

  {
    path: "/dashboard/staff-management",
    permission: Permission.STAFF_MANAGEMENT,
  },

  { path: "/dashboard/settings", permission: Permission.SETTINGS },

  { path: "/dashboard/audit-logs", permission: Permission.AUDIT_LOGS },

  { path: "/dashboard/reports-analytics", permission: Permission.REPORTS },
];



const apiPermissions: Array<{ path: string; permission: Permission }> = [
  { path: "/auth", permission: Permission.AUTH },

  { path: "/notifications", permission: Permission.NOTIFICATIONS },

  { path: "/service-requests", permission: Permission.SERVICE_REQUESTS },
  { path: "/vehicles", permission: Permission.VEHICLES },
  { path: "/customer-onboarding", permission: Permission.ONBOARDING },
  { path: "/mechanic-onboarding", permission: Permission.ONBOARDING },

  { path: "/issues", permission: Permission.ISSUES },
  { path: "/disputes", permission: Permission.DISPUTES },

  { path: "/customers", permission: Permission.USERS },
  { path: "/staff", permission: Permission.STAFF_MANAGEMENT },

  { path: "/companies", permission: Permission.COMPANIES },
  { path: "/services", permission: Permission.SERVICES },

  { path: "/financial", permission: Permission.FINANCIAL },

  { path: "/reviews", permission: Permission.REVIEWS },

  { path: "/audit", permission: Permission.AUDIT_LOGS },

  { path: "/settings", permission: Permission.SETTINGS },

  { path: "/admin/ad-campaigns", permission: Permission.MARKETING },

  { path: "/admin/legal", permission: Permission.LEGAL },

  { path: "/dashboard", permission: Permission.DASHBOARD },
];



export function normalizeRole(role?: string | null): StaffRole | null {
  if (!role) return null;

  const trimmed = role.trim();
  return ROLE_ALIASES[trimmed] ?? ROLE_ALIASES[trimmed.toLowerCase()] ?? null;
}

export function isAuthorizedPortalRole(role?: string | null) {
  return normalizeRole(role) !== null;
}

export function hasPermission(
  role: string | null | undefined,
  permission: Permission,
) {
  const normalized = normalizeRole(role);
  if (!normalized) return false;
  return rolePermissions[normalized].includes(permission);
}

function matchesPath(pathname: string, configPath: string, exact = false) {
  if (exact) return pathname === configPath;
  return pathname === configPath || pathname.startsWith(`${configPath}/`);
}

export function permissionForPath(pathname: string) {
  return routePermissions
    .filter((entry) => matchesPath(pathname, entry.path, entry.exact))
    .sort((a, b) => b.path.length - a.path.length)[0]?.permission;
}

export function canAccessPath(
  role: string | null | undefined,
  pathname: string,
) {
  if (pathname === "/dashboard/unauthorized") return true;

  const permission = permissionForPath(pathname);

  return permission
    ? hasPermission(role, permission)
    : hasPermission(role, Permission.DASHBOARD);
}

export function permissionForApiPath(pathname: string) {
  return apiPermissions
    .filter((entry) => matchesPath(pathname, entry.path))
    .sort((a, b) => b.path.length - a.path.length)[0]?.permission;
}

export function canAccessApiPath(
  role: string | null | undefined,
  pathname: string,
) {
  const permission = permissionForApiPath(pathname);

  return permission
    ? hasPermission(role, permission)
    : hasPermission(role, Permission.DASHBOARD);
}

export function filterRoutesForRole(
  routes: NavRoute[],
  role: string | null | undefined,
): NavRoute[] {
  return routes.reduce<NavRoute[]>((acc, route) => {
    const children = route.children
      ? filterRoutesForRole(route.children, role)
      : undefined;

    const allowed = canAccessPath(role, route.href);

    if (!allowed && !children?.length) return acc;

    acc.push(children ? { ...route, children } : { ...route });
    return acc;
  }, []);
}

export function displayRole(role?: string | null) {
  const normalized = normalizeRole(role);

  if (normalized) return roleLabels[normalized];

  return role
    ? role.replace(/[_-]+/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    : "Administrator";
}
export function getDefaultRoute(role: string | null | undefined) {
  const routes = [
    "/dashboard",
    "/dashboard/customers",
    "/dashboard/staff-management",
    "/dashboard/service-providers",
    "/dashboard/requests",
    "/dashboard/earnings-payments",
    "/dashboard/transactions",
    "/dashboard/disputes",
    "/dashboard/ratings-reviews",
    "/dashboard/notifications",
    "/dashboard/audit-logs",
    "/dashboard/reports-analytics",
    "/dashboard/settings",
  ];

  return (
    routes.find((route) => canAccessPath(role, route)) ??
    "/dashboard/unauthorized"
  );
}