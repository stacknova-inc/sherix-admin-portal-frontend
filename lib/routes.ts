import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  FileClock,
  Gauge,
  Image,
  LifeBuoy,
  ListChecks,
  Megaphone,
  MessageSquareWarning,
  Scale,
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
  children?: NavRoute[];
};

export const dashboardRoutes: NavRoute[] = [
  { title: "Dashboard", href: "/dashboard", icon: Gauge },
  { title: "Customers", href: "/dashboard/customers", icon: Users },
  {
    title: "Service Providers",
    href: "/dashboard/service-providers",
    icon: UserCog,
    children: [
      { title: "Individual Providers", href: "/dashboard/service-providers/individual", icon: UserCog },
      { title: "Company Providers", href: "/dashboard/service-providers/company", icon: Tags },
    ],
  },
  { title: "Jobs / Requests", href: "/dashboard/jobs", icon: BriefcaseBusiness },
  { title: "Earnings & Payments", href: "/dashboard/earnings-payments", icon: DollarSign },
  { title: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Disputes", href: "/dashboard/disputes", icon: MessageSquareWarning },
  { title: "Ratings & Reviews", href: "/dashboard/ratings-reviews", icon: Star },
  { title: "Organization Data", href: "/dashboard/organization-data", icon: ListChecks },
  { title: "Reports & Analytics", href: "/dashboard/reports-analytics", icon: BarChart3 },
  { title: "Staff Management", href: "/dashboard/staff-management", icon: UserRoundCog },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Audit Logs", href: "/dashboard/audit-logs", icon: FileClock },
];

export const logoIcon = ShieldCheck;
export const completedIcon = ClipboardCheck;
