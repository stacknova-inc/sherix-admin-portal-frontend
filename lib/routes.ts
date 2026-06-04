import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileClock,
  Gauge,
  ListChecks,
  MessageSquareWarning,
  Settings,
  ShieldCheck,
  Star,
  Tags,
  UserCog,
  UserRoundCog,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export type NavRoute = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

export const dashboardRoutes: NavRoute[] = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Users", href: "/dashboard/users", icon: Users },
  { title: "Service Providers", href: "/dashboard/service-providers", icon: UserCog },
  { title: "Jobs / Requests", href: "/dashboard/jobs", icon: BriefcaseBusiness },
  { title: "Earnings & Payments", href: "/dashboard/earnings-payments", icon: DollarSign },
  { title: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { title: "Ratings & Reviews", href: "/dashboard/ratings-reviews", icon: Star },
  { title: "Disputes", href: "/dashboard/disputes", icon: MessageSquareWarning },
  { title: "Organization Data", href: "/dashboard/organization-data", icon: ListChecks },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Reports & Analytics", href: "/dashboard/reports-analytics", icon: BarChart3 },
  { title: "Staff Management", href: "/dashboard/staff-management", icon: UserRoundCog },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Audit Logs", href: "/dashboard/audit-logs", icon: FileClock },
];

export const logoIcon = ShieldCheck;
export const completedIcon = ClipboardCheck;
