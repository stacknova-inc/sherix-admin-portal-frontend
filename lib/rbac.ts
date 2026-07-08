// import type { NavRoute } from "@/lib/routes";

// export enum StaffRole {
//   SUPER_ADMIN = "SUPER_ADMIN",
//   HR_ADMIN = "human_resource_admin",
//   FINANCE_ADMIN = "finance_admin",
//   SUPPORT_ADMIN = "customer_support_admin",
//   MARKETING_ADMIN = "marketing_admin",
//   OPERATIONS_ADMIN = "operations_admin",
//   COMPLIANCE_ADMIN = "compliance_admin",
//   TECHNICAL_SUPPORT_ADMIN = "technical_support_admin",
//   BUSINESS_DEVELOPMENT_ADMIN = "business_development_admin",
// }

// export enum Permission {
//   DASHBOARD = "dashboard",
//   STAFF_MANAGEMENT = "staff_management",
//   USERS = "users",
//   SERVICE_PROVIDERS = "service_providers",
//   ORGANIZATION_DATA = "organization_data",
//   JOBS = "jobs",
//   EARNINGS_PAYMENTS = "earnings_payments",
//   TRANSACTIONS = "transactions",
//   NOTIFICATIONS = "notifications",
//   DISPUTES = "disputes",
//   RATINGS_REVIEWS = "ratings_reviews",
//   SETTINGS = "settings",
//   AUDIT_LOGS = "audit_logs",
//   REPORTS_ANALYTICS = "reports_analytics",
// }

// export const SUPER_ADMIN_ALIASES = new Set([
//   "SUPER_ADMIN",
//   "super_admin",
//   "sherix_admin",
//   "admin",
//   "administrator",
// ]);

// const ROLE_ALIASES: Record<string, StaffRole> = {
//   super_admin: StaffRole.SUPER_ADMIN,
//   sherix_admin: StaffRole.SUPER_ADMIN,
//   human_resources_admin: StaffRole.HR_ADMIN,
//   finance_admin: StaffRole.FINANCE_ADMIN,
//   customer_support_admin: StaffRole.SUPPORT_ADMIN,
//   compliance_admin: StaffRole.COMPLIANCE_ADMIN,
//   operations_admin: StaffRole.OPERATIONS_ADMIN,
//   technical_support_admin: StaffRole.TECHNICAL_SUPPORT_ADMIN,
//   business_development_admin: StaffRole.BUSINESS_DEVELOPMENT_ADMIN,
// };

// export const roleLabels: Record<StaffRole, string> = {
//   [StaffRole.SUPER_ADMIN]: "Super Admin",
//   [StaffRole.HR_ADMIN]: "Human Resource Admin",
//   [StaffRole.FINANCE_ADMIN]: "Finance Admin",
//   [StaffRole.SUPPORT_ADMIN]: "Customer Support Admin",
//   [StaffRole.MARKETING_ADMIN]: "Marketing Admin",
//   [StaffRole.OPERATIONS_ADMIN]: "Operations Admin",
//   [StaffRole.COMPLIANCE_ADMIN]: "Compliance Admin",
//   [StaffRole.TECHNICAL_SUPPORT_ADMIN]: "Technical Support Admin",
//   [StaffRole.BUSINESS_DEVELOPMENT_ADMIN]: "Business Development Admin",
// };

// export const rolePermissions: Record<StaffRole, Permission[]> = {
//   [StaffRole.SUPER_ADMIN]: Object.values(Permission),

//   [StaffRole.HR_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.USERS,
//     Permission.SERVICE_PROVIDERS,
//     Permission.ORGANIZATION_DATA,
//     Permission.JOBS,
//   ],

//   [StaffRole.FINANCE_ADMIN]: [
//     Permission.EARNINGS_PAYMENTS,
//     Permission.TRANSACTIONS,
//   ],

//   [StaffRole.SUPPORT_ADMIN]: [Permission.ORGANIZATION_DATA],

//   [StaffRole.MARKETING_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.RATINGS_REVIEWS,
//     Permission.ORGANIZATION_DATA
//   ],

//   [StaffRole.OPERATIONS_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.ORGANIZATION_DATA,
//     Permission.JOBS,
//     Permission.NOTIFICATIONS,
//   ],

//   [StaffRole.COMPLIANCE_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.ORGANIZATION_DATA,
//     Permission.AUDIT_LOGS,
//     Permission.REPORTS_ANALYTICS,
//   ],

//   [StaffRole.TECHNICAL_SUPPORT_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.NOTIFICATIONS,
//     Permission.DISPUTES,
//   ],

//   [StaffRole.BUSINESS_DEVELOPMENT_ADMIN]: [
//     Permission.DASHBOARD,
//     Permission.USERS,
//     Permission.SERVICE_PROVIDERS,
//     Permission.REPORTS_ANALYTICS,
//   ],
// };

// const routePermissions: Array<{
//   path: string;
//   permission: Permission;
//   exact?: boolean;
// }> = [
//   { path: "/dashboard", permission: Permission.DASHBOARD, exact: true },
//   { path: "/dashboard/users", permission: Permission.USERS },
//   {
//     path: "/dashboard/service-providers",
//     permission: Permission.SERVICE_PROVIDERS,
//   },
//   {
//     path: "/dashboard/organization-data",
//     permission: Permission.ORGANIZATION_DATA,
//   },
//   {
//     path: "/dashboard/service-categories",
//     permission: Permission.ORGANIZATION_DATA,
//   },
//   {
//     path: "/dashboard/pricing-services",
//     permission: Permission.ORGANIZATION_DATA,
//   },
//   { path: "/dashboard/jobs", permission: Permission.JOBS },
//   {
//     path: "/dashboard/earnings-payments",
//     permission: Permission.EARNINGS_PAYMENTS,
//   },
//   { path: "/dashboard/transactions", permission: Permission.TRANSACTIONS },
//   { path: "/dashboard/notifications", permission: Permission.NOTIFICATIONS },
//   { path: "/dashboard/disputes", permission: Permission.DISPUTES },
//   {
//     path: "/dashboard/ratings-reviews",
//     permission: Permission.RATINGS_REVIEWS,
//   },
//   {
//     path: "/dashboard/staff-management",
//     permission: Permission.STAFF_MANAGEMENT,
//   },
//   { path: "/dashboard/settings", permission: Permission.SETTINGS },
//   { path: "/dashboard/audit-logs", permission: Permission.AUDIT_LOGS },
//   {
//     path: "/dashboard/reports-analytics",
//     permission: Permission.REPORTS_ANALYTICS,
//   },
// ];

// const apiPermissions: Array<{ path: string; permission: Permission }> = [
//   { path: "/dashboard", permission: Permission.DASHBOARD },
//   {
//     path: "/users/service-providers",
//     permission: Permission.SERVICE_PROVIDERS,
//   },
//   { path: "/users", permission: Permission.USERS },
//   { path: "/services", permission: Permission.ORGANIZATION_DATA },
//   { path: "/issues", permission: Permission.ORGANIZATION_DATA },
//   { path: "/bookings/admin/bookings", permission: Permission.JOBS },
//   { path: "/financial/earnings", permission: Permission.EARNINGS_PAYMENTS },
//   { path: "/financial/transactions", permission: Permission.TRANSACTIONS },
//   { path: "/admin/notifications", permission: Permission.NOTIFICATIONS },
//   { path: "/disputes", permission: Permission.DISPUTES },
//   { path: "/reviews", permission: Permission.RATINGS_REVIEWS },
//   { path: "/settings", permission: Permission.SETTINGS },
//   { path: "/staff", permission: Permission.STAFF_MANAGEMENT },
//   { path: "/audit", permission: Permission.AUDIT_LOGS },
// ];

// export function normalizeRole(role?: string | null): StaffRole | null {
//   if (!role) return null;
//   const trimmed = role.trim();
//   return ROLE_ALIASES[trimmed] ?? ROLE_ALIASES[trimmed.toLowerCase()] ?? null;
// }

// export function isAuthorizedPortalRole(role?: string | null) {
//   return normalizeRole(role) !== null;
// }

// export function hasPermission(
//   role: string | null | undefined,
//   permission: Permission,
// ) {
//   const normalized = normalizeRole(role);
//   if (!normalized) return false;
//   return rolePermissions[normalized].includes(permission);
// }

// function matchesPath(pathname: string, configPath: string, exact = false) {
//   if (exact) return pathname === configPath;
//   return pathname === configPath || pathname.startsWith(`${configPath}/`);
// }

// export function permissionForPath(pathname: string) {
//   return routePermissions
//     .filter((entry) => matchesPath(pathname, entry.path, entry.exact))
//     .sort((a, b) => b.path.length - a.path.length)[0]?.permission;
// }

// export function canAccessPath(
//   role: string | null | undefined,
//   pathname: string,
// ) {
//   if (pathname === "/dashboard/unauthorized") return true;
//   const permission = permissionForPath(pathname);
//   return permission
//     ? hasPermission(role, permission)
//     : hasPermission(role, Permission.DASHBOARD);
// }

// export function permissionForApiPath(pathname: string) {
//   return apiPermissions
//     .filter((entry) => matchesPath(pathname, entry.path))
//     .sort((a, b) => b.path.length - a.path.length)[0]?.permission;
// }

// export function canAccessApiPath(
//   role: string | null | undefined,
//   pathname: string,
// ) {
//   const permission = permissionForApiPath(pathname);
//   return permission
//     ? hasPermission(role, permission)
//     : hasPermission(role, Permission.DASHBOARD);
// }

// export function filterRoutesForRole(
//   routes: NavRoute[],
//   role: string | null | undefined,
// ): NavRoute[] {
//   return routes.reduce<NavRoute[]>((allowedRoutes, route) => {
//     const children = route.children
//       ? filterRoutesForRole(route.children, role)
//       : undefined;
//     const routeAllowed = canAccessPath(role, route.href);
//     if (!routeAllowed && !children?.length) return allowedRoutes;

//     allowedRoutes.push(children ? { ...route, children } : { ...route });
//     return allowedRoutes;
//   }, []);
// }

// export function displayRole(role?: string | null) {
//   const normalized = normalizeRole(role);
//   if (normalized) return roleLabels[normalized];
//   return role
//     ? role
//         .replace(/[_-]+/g, " ")
//         .replace(/\b\w/g, (letter) => letter.toUpperCase())
//     : "Administrator";
// }
import type { NavRoute } from "@/lib/routes";

/* =========================
   ROLES
========================= */

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

/* =========================
   PERMISSIONS (API-ALIGNED)
========================= */

export enum Permission {
  DASHBOARD = "dashboard",

  AUTH = "auth",
  NOTIFICATIONS = "notifications",

  BOOKINGS = "bookings",
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

/* =========================
   ROLE LABELS
========================= */

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

/* =========================
   ROLE ALIASES (FIXED)
========================= */

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

/* =========================
   ROLE PERMISSIONS (FIXED + ALIGNED TO API)
========================= */

export const rolePermissions: Record<StaffRole, Permission[]> = {
  [StaffRole.SUPER_ADMIN]: Object.values(Permission),

  [StaffRole.HR_ADMIN]: [
    Permission.USERS,
    Permission.STAFF_MANAGEMENT,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.FINANCE_ADMIN]: [
    Permission.FINANCIAL,
    Permission.EARNINGS,
    Permission.TRANSACTIONS,
  ],

  [StaffRole.SUPPORT_ADMIN]: [
    Permission.USERS,
    Permission.DISPUTES,
    Permission.ISSUES,
    Permission.REVIEWS,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.MARKETING_ADMIN]: [

    Permission.MARKETING,
    Permission.ANALYTICS,
    Permission.REPORTS,
    Permission.REVIEWS,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.OPERATIONS_ADMIN]: [

    Permission.BOOKINGS,
    Permission.SERVICES,
    Permission.COMPANIES,
    Permission.NOTIFICATIONS,
    Permission.REPORTS,
  ],

  [StaffRole.COMPLIANCE_ADMIN]: [

    Permission.AUDIT_LOGS,
    Permission.LEGAL,
    Permission.DISPUTES,
    Permission.REPORTS,
    Permission.COMPANIES,
  ],

  [StaffRole.TECHNICAL_SUPPORT_ADMIN]: [

    Permission.ISSUES,
    Permission.DISPUTES,
    Permission.NOTIFICATIONS,
  ],

  [StaffRole.BUSINESS_DEVELOPMENT_ADMIN]: [

    Permission.COMPANIES,
    Permission.USERS,
    Permission.SERVICES,
    Permission.REPORTS,
    Permission.ANALYTICS,
  ],
};

/* =========================
   ROUTE PERMISSIONS (UI)
========================= */

const routePermissions: Array<{
  path: string;
  permission: Permission;
  exact?: boolean;
}> = [
  { path: "/dashboard", permission: Permission.DASHBOARD, exact: true },

  { path: "/dashboard/users", permission: Permission.USERS },
  { path: "/dashboard/service-providers", permission: Permission.SERVICES },

  { path: "/dashboard/organization-data", permission: Permission.SERVICES },
  { path: "/dashboard/service-categories", permission: Permission.SERVICES },
  { path: "/dashboard/pricing-services", permission: Permission.SERVICES },

  { path: "/dashboard/jobs", permission: Permission.BOOKINGS },

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

/* =========================
   API PERMISSIONS (BACKEND MATCHED)
========================= */

const apiPermissions: Array<{ path: string; permission: Permission }> = [
  { path: "/auth", permission: Permission.AUTH },

  { path: "/notifications", permission: Permission.NOTIFICATIONS },

  { path: "/bookings", permission: Permission.BOOKINGS },
  { path: "/vehicles", permission: Permission.VEHICLES },
  { path: "/customer-onboarding", permission: Permission.ONBOARDING },
  { path: "/mechanic-onboarding", permission: Permission.ONBOARDING },

  { path: "/issues", permission: Permission.ISSUES },
  { path: "/disputes", permission: Permission.DISPUTES },

  { path: "/users", permission: Permission.USERS },
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

/* =========================
   HELPERS
========================= */

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
    "/dashboard/users",
    "/dashboard/staff-management",
    "/dashboard/service-providers",
    "/dashboard/jobs",
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