import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Banknote,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  Eye,
  FileClock,
  FileText,
  Filter,
  Gauge,
  Mail,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Star,
  UserCheck,
  UserCog,
  UserX,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn } from "@/lib/utils";

type PageKey =
  | "users"
  | "serviceProviders"
  | "jobs"
  | "earningsPayments"
  | "transactions"
  | "ratingsReviews"
  | "disputes"
  | "notifications"
  | "report"
  | "settings"
  | "organizationData"
  | "auditLogs";

type Stat = {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: "red" | "blue" | "amber" | "green" | "purple" | "teal";
  down?: boolean;
};

type PageConfig = {
  title: string;
  subtitle: string;
  action?: string;
  stats: Stat[];
  tabs?: string[];
  search: string;
  filters: string[];
  columns: string[];
  rows: string[][];
  sideTitle?: string;
  sideItems?: { label: string; value: string; tone?: string }[];
};

const toneClasses: Record<Stat["tone"], string> = {
  red: "bg-red-50 text-red-600 dark:bg-red-500/15",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/15",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/15",
  green: "bg-green-50 text-green-600 dark:bg-green-500/15",
  purple: "bg-violet-50 text-violet-600 dark:bg-violet-500/15",
  teal: "bg-teal-50 text-teal-600 dark:bg-teal-500/15",
};

const statusClasses: Record<string, string> = {
  Active: "bg-green-50 text-green-700",
  Verified: "bg-green-50 text-green-700",
  Completed: "bg-green-50 text-green-700",
  Published: "bg-green-50 text-green-700",
  Success: "bg-green-50 text-green-700",
  Sent: "bg-green-50 text-green-700",
  Paid: "bg-green-50 text-green-700",
  Open: "bg-amber-50 text-amber-700",
  Pending: "bg-amber-50 text-amber-700",
  Draft: "bg-slate-100 text-slate-700",
  "Under Review": "bg-blue-50 text-blue-700",
  Scheduled: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
  Failed: "bg-red-50 text-red-700",
  Flagged: "bg-red-50 text-red-700",
  Inactive: "bg-orange-50 text-orange-700",

};

const people = [
  ["USR-12086", "Kofi Mensah", "kofi@gmail.com", "050 123 4567", "Customer", "May 18, 2025", "Active"],
  ["USR-12087", "Ama Serwaa", "ama@gmail.com", "050 987 6543", "Customer", "May 18, 2025", "Active"],
  ["USR-12088", "Kwame Asante", "kwame@gmail.com", "050 456 7890", "Customer", "May 17, 2025", "Active"],
  ["USR-12089", "Abena Osei", "abena@gmail.com", "050 321 0987", "Customer", "May 17, 2025", "Inactive"],
  ["USR-12090", "Yaw Boadu", "yaw@gmail.com", "050 644 3210", "Customer", "May 16, 2025", "Active"],
  ["USR-12091", "Nana Addo", "nana@gmail.com", "050 111 2222", "Customer", "May 16, 2025", "Active"],
  ["USR-12092", "Kojo Darko", "kojo@gmail.com", "020 333 4444", "Service Provider", "May 15, 2025", "Active"],
  ["USR-12093", "Efua Anokye", "efua@gmail.com", "050 777 8888", "Service Provider", "May 15, 2025", "Active"],
];

const providers = [
  ["SP-2548", "Bright Auto Care", "Battery, Diagnostics", "050 123 4567", "Accra, Airport", "4.8 (126)", "Verified", "May 18, 2025"],
  ["SP-2547", "QuickFix Services", "Tire Change, Battery", "050 987 6543", "Madina, Accra", "4.6 (98)", "Verified", "May 18, 2025"],
  ["SP-2546", "Speedy Mechanics", "Diagnostics, Engine", "050 456 7890", "Tema, Community 25", "4.7 (156)", "Pending", "May 17, 2025"],
  ["SP-2545", "Auto Rescue GH", "Towing, Battery", "050 321 0087", "Spintex, Accra", "4.5 (87)", "Verified", "May 17, 2025"],
  ["SP-2544", "Wheels & More", "Tires, Alignment", "050 644 3210", "Lapaz, Accra", "4.3 (64)", "Rejected", "May 16, 2025"],
  ["SP-2543", "DriveCare", "Diagnostics, AC Repair", "050 111 2222", "Dzorwulu, Accra", "4.6 (74)", "Verified", "May 16, 2025"],
];

const jobs = [
  ["JOB-12458", "Battery Jump Start", "Kofi Mensah", "Bright Auto Care", "High", "Paid", "Completed", "GHS 120"],
  ["JOB-12457", "Tire Change", "Ama Serwaa", "QuickFix Services", "Medium", "Paid", "Completed", "GHS 100"],
  ["JOB-12456", "Car Diagnostics", "Kwame Asante", "Speedy Mechanics", "Low", "Pending", "Under Review", "GHS 150"],
  ["JOB-12455", "Oil Change", "Efua Anokye", "Reliable Pros", "Medium", "Paid", "Completed", "GHS 80"],
  ["JOB-12454", "Towing Service", "Ofori Kwadwo", "CoolPro Auto", "High", "Paid", "Open", "GHS 200"],
  ["JOB-12453", "AC Repair", "Nana Addo", "Auto Rescue GH", "High", "Pending", "Open", "GHS 250"],
];

const configs: Record<PageKey, PageConfig> = {
  users: {
    title: "Users Management",
    subtitle: "Manage and monitor all platform users.",
    action: "Add New User",
    stats: [
      { label: "Total Users", value: "12,458", change: "8.5% vs last week", icon: Users, tone: "red" },
      { label: "Active Users", value: "9,784", change: "7.3% vs last week", icon: UserCheck, tone: "green" },
      { label: "New Users", value: "256", change: "12.8% vs last week", icon: Users, tone: "blue" },
      { label: "Inactive Users", value: "2,674", change: "4.1% vs last week", icon: UserX, tone: "amber", down: true },
    ],
    search: "Search users by name, email or phone...",
    filters: ["All Status", "All User Types", "Joined Date"],
    columns: ["User ID", "User", "Email", "Phone", "User Type", "Joined Date", "Status"],
    rows: people,
    sideTitle: "User Overview",
    sideItems: [
      { label: "Customers", value: "10,214", tone: "bg-blue-500" },
      { label: "Service providers", value: "1,245", tone: "bg-green-500" },
      { label: "Admins", value: "42", tone: "bg-red-500" },
    ],
  },
  serviceProviders: {
    title: "Service Providers",
    subtitle: "Manage and verify all service providers.",
    action: "Add New Provider",
    stats: [
      { label: "Total Providers", value: "1,245", change: "10.3% vs last week", icon: Users, tone: "red" },
      { label: "Verified Providers", value: "978", change: "8.6% vs last week", icon: ShieldCheck, tone: "green" },
      { label: "Pending Verification", value: "147", change: "2.1% vs last week", icon: Clock3, tone: "amber" },
      { label: "Rejected Providers", value: "78", change: "5.4% vs last week", icon: UserX, tone: "red", down: true },
    ],
    search: "Search providers by name, email, phone or service...",
    filters: ["All Status", "All Services", "Location"],
    columns: ["Provider ID", "Provider", "Service(s)", "Phone", "Location", "Rating", "Status", "Joined Date"],
    rows: providers,
    sideTitle: "Top Rated Providers",
    sideItems: [
      { label: "Bright Auto Care", value: "4.8", tone: "bg-amber-400" },
      { label: "Reliable Pros", value: "4.7", tone: "bg-amber-400" },
      { label: "QuickFix Services", value: "4.6", tone: "bg-amber-400" },
    ],
  },
  jobs: {
    title: "Jobs / Requests",
    subtitle: "View, assign and manage customer service requests.",
    action: "Create Job",
    stats: [
      { label: "Total Jobs", value: "1,248", change: "8.3% vs last week", icon: BriefcaseBusiness, tone: "blue" },
      { label: "Completed", value: "642", change: "12.1% vs last week", icon: CheckCircle2, tone: "green" },
      { label: "In Progress", value: "287", change: "4.9% vs last week", icon: Gauge, tone: "purple" },
      { label: "Pending", value: "187", change: "3.2% vs last week", icon: Clock3, tone: "amber" },
    ],
    tabs: ["All Jobs", "Pending", "Assigned", "In Progress", "Completed"],
    search: "Search by job ID, customer, provider or service...",
    filters: ["All Statuses", "All Services", "Priority"],
    columns: ["Job ID", "Service", "Customer", "Provider", "Priority", "Payment", "Status", "Amount"],
    rows: jobs,
    sideTitle: "Job Status",
    sideItems: [
      { label: "Completed", value: "642 (51.4%)", tone: "bg-green-500" },
      { label: "In Progress", value: "287 (23.0%)", tone: "bg-blue-500" },
      { label: "Pending", value: "187 (15.0%)", tone: "bg-amber-500" },
    ],
  },
  earningsPayments: {
    title: "Earnings & Payments",
    subtitle: "Track earnings, commissions and manage payouts.",
    stats: [
      { label: "Total Earnings", value: "GHS 128,540", change: "16.4% vs last week", icon: Banknote, tone: "green" },
      { label: "Platform Commission", value: "GHS 10,215", change: "10.1% vs last week", icon: CircleDollarSign, tone: "purple" },
      { label: "Provider Earnings", value: "GHS 118,325", change: "14.2% vs last week", icon: BriefcaseBusiness, tone: "blue" },
      { label: "Pending Payouts", value: "GHS 8,230", change: "5.3% vs last week", icon: Clock3, tone: "amber", down: true },
    ],
    tabs: ["Overview", "Payouts", "Commissions", "Provider Earnings"],
    search: "Search payout ID, provider or amount...",
    filters: ["All Methods", "All Statuses", "This Month"],
    columns: ["Payout ID", "Provider", "Amount", "Method", "Date", "Status"],
    rows: [
      ["PAYOUT-1248", "Bright Auto Care", "GHS 1,320", "Mobile Money", "May 18, 2025", "Completed"],
      ["PAYOUT-1247", "QuickFix Services", "GHS 960", "Bank Transfer", "May 18, 2025", "Completed"],
      ["PAYOUT-1246", "Speedy Mechanics", "GHS 1,400", "Mobile Money", "May 17, 2025", "Completed"],
      ["PAYOUT-1245", "Wheels & More", "GHS 780", "Bank Transfer", "May 17, 2025", "Pending"],
    ],
    sideTitle: "Earnings Distribution",
    sideItems: [
      { label: "Provider payouts", value: "92.1%", tone: "bg-green-500" },
      { label: "Platform commission", value: "8.0%", tone: "bg-blue-500" },
      { label: "Other deductions", value: "-0.1%", tone: "bg-amber-500" },
    ],
  },
  transactions: {
    title: "Transactions",
    subtitle: "View and manage all platform transactions.",
    stats: [
      { label: "Total Transactions", value: "GHS 256,780", change: "12.6% vs last week", icon: CircleDollarSign, tone: "purple" },
      { label: "Total Amount In", value: "GHS 187,540", change: "14.8% vs last week", icon: Banknote, tone: "green" },
      { label: "Total Amount Out", value: "GHS 151,320", change: "5.2% vs last week", icon: Download, tone: "amber", down: true },
      { label: "Refunds Issued", value: "GHS 8,450", change: "8.7% vs last week", icon: BriefcaseBusiness, tone: "blue", down: true },
    ],
    search: "Search by transaction ID, user, provider or job ID...",
    filters: ["All Types", "All Statuses", "All Payment Methods"],
    columns: ["Transaction ID", "Type", "Related To", "From / To", "Payment Method", "Amount", "Status", "Date & Time"],
    rows: [
      ["TRX-12548", "Payment", "JOB-12458", "Kofi Mensah -> Bright Auto Care", "Mobile Money", "GHS 120.00", "Completed", "May 18, 2025 10:30 AM"],
      ["TRX-12547", "Payout", "Provider Payout", "Sherix Platform -> QuickFix Services", "Bank Transfer", "GHS 100.00", "Completed", "May 18, 2025 09:15 AM"],
      ["TRX-12546", "Refund", "JOB-12453", "Sherix Platform -> Nana Addo", "Mobile Money", "GHS 80.00", "Pending", "May 17, 2025 04:45 PM"],
      ["TRX-12545", "Commission", "JOB-12454", "QuickFix Services -> Sherix Platform", "Wallet Balance", "GHS 16.00", "Completed", "May 17, 2025 03:20 PM"],
    ],
    sideTitle: "Payment Methods",
    sideItems: [
      { label: "Mobile Money", value: "54%", tone: "bg-green-500" },
      { label: "Bank Transfer", value: "31%", tone: "bg-blue-500" },
      { label: "Wallet Balance", value: "15%", tone: "bg-violet-500" },
    ],
  },
  ratingsReviews: {
    title: "Ratings & Reviews",
    subtitle: "Monitor and manage ratings and reviews across the platform.",
    stats: [
      { label: "Average Rating", value: "4.6 / 5", change: "0.2 vs last week", icon: Star, tone: "amber" },
      { label: "Total Reviews", value: "2,845", change: "12.4% vs last week", icon: MessageSquare, tone: "purple" },
      { label: "Positive Reviews", value: "2,245", change: "11.3% vs last week", icon: CheckCircle2, tone: "green" },
      { label: "Pending Reviews", value: "313", change: "3.2% vs last week", icon: Eye, tone: "amber" },
    ],
    search: "Search by review ID, provider, customer or service...",
    filters: ["All Ratings", "All Services", "All Statuses"],
    columns: ["Review ID", "Rating", "Review", "Related To", "Reviewer", "Provider", "Status"],
    rows: [
      ["REV-2845", "4.5", "Great service and quick response", "JOB-12458", "Kofi Mensah", "Bright Auto Care", "Published"],
      ["REV-2844", "5.0", "Excellent experience", "JOB-12457", "Ama Serwaa", "QuickFix Services", "Published"],
      ["REV-2843", "3.0", "Average service", "JOB-12456", "Kwame Asante", "Speedy Mechanics", "Published"],
      ["REV-2842", "1.0", "Not satisfied", "JOB-12452", "Kojo Darko", "DriveCare", "Flagged"],
    ],
  
  },
  disputes: {
    title: "Disputes",
    subtitle: "Review and manage all disputes raised on the platform.",
    stats: [
      { label: "Total Disputes", value: "128", change: "8.2% vs last week", icon: AlertTriangle, tone: "purple", down: true },
      { label: "Open", value: "42", change: "5.6% vs last week", icon: Clock3, tone: "amber", down: true },
      { label: "Under Review", value: "36", change: "12.1% vs last week", icon: FileText, tone: "blue" },
      { label: "Resolved", value: "41", change: "9.7% vs last week", icon: CheckCircle2, tone: "green" },
    ],
    tabs: ["All Disputes", "Open", "Under Review", "Resolved", "Rejected"],
    search: "Search by dispute ID, job ID, user, provider or reason...",
    filters: ["All Statuses"],
    columns: ["Dispute ID", "Job ID", "Raised By", "Against", "Reason", "Status"],
    rows: [
      ["DSP-1284", "JOB-12458", "Kofi Mensah", "Bright Auto Care", "Service not completed", "Open"],
      ["DSP-1283", "JOB-12457", "Ama Serwaa", "QuickFix Services", "Overcharged", "Under Review"],
      ["DSP-1282", "JOB-12456", "Kwame Asante", "Speedy Mechanics", "Poor service quality", "Under Review"],
      ["DSP-1281", "JOB-12455", "Efua Anokye", "Reliable Pros", "Service not completed", "Completed"],
    ],
    sideTitle: "Dispute Details",
    sideItems: [
      { label: "Selected dispute", value: "DSP-1284", tone: "bg-amber-500" },
      { label: "Amount in dispute", value: "GHS 120.00", tone: "bg-red-500" },
      { label: "Recommended action", value: "Request more info", tone: "bg-blue-500" },
    ],
  },
  notifications: {
    title: "Notifications",
    subtitle: "Create, manage and track all system notifications sent to users and providers.",
    action: "Create Notification",
    stats: [
      { label: "Total Sent", value: "24,785", change: "12.6% vs last week", icon: Bell, tone: "purple" },
      { label: "Email Sent", value: "12,456", change: "10.3% vs last week", icon: Mail, tone: "blue" },
      { label: "SMS Sent", value: "8,972", change: "14.2% vs last week", icon: MessageSquare, tone: "green" },
      { label: "Open Rate", value: "32.4%", change: "5.6% vs last week", icon: Eye, tone: "red" },
    ],
    tabs: ["All Notifications", "Templates", "Scheduled", "History", "Subscribers"],
    search: "Search by title, type, audience or template...",
    filters: ["All Types", "All Channels", "All Audience", "All Status"],
    columns: ["Notification Title", "Type", "Channel", "Audience", "Sent To", "Status", "Performance"],
    rows: [
      ["Job Assigned", "Job Update", "Email, SMS, Push", "Service Providers", "6,432", "Sent", "38.7% open"],
      ["Payment Received", "Payment", "Email, SMS", "Service Providers", "4,231", "Sent", "34.2% open"],
      ["Review Reminder", "Reminder", "Email, Push", "Customers", "3,987", "Sent", "29.4% open"],
      ["Promotional Offer", "Promotion", "Email, SMS, Push", "Customers", "8,765", "Scheduled", "-"],
    ],
    sideTitle: "Notification Summary",
    sideItems: [
      { label: "Email", value: "12,456 (50.2%)", tone: "bg-blue-500" },
      { label: "SMS", value: "8,972 (36.2%)", tone: "bg-green-500" },
      { label: "Push", value: "3,357 (13.6%)", tone: "bg-amber-500" },
    ],
  },
  report: {
    title: "Report",
    subtitle: "Track platform performance and key metrics in real time.",
    stats: [
      { label: "Total Revenue", value: "GHS 24,780.50", change: "12.6% vs last week", icon: Banknote, tone: "purple" },
      { label: "Total Jobs", value: "1,248", change: "8.3% vs last week", icon: BriefcaseBusiness, tone: "green" },
      { label: "Total Users", value: "5,342", change: "10.7% vs last week", icon: Users, tone: "blue" },
      { label: "Avg. Rating", value: "4.6 / 5", change: "0.2 vs last week", icon: Star, tone: "red" },
    ],
    tabs: ["Overview", "Business Reports", "Financial Reports", "User Reports", "Provider Reports"],
    search: "Search report name, category or generated by...",
    filters: ["All Categories", "All Formats", "This Week"],
    columns: ["Report Name", "Category", "Generated On", "Generated By", "Format", "Status"],
    rows: [
      ["Revenue Summary Report", "Financial", "May 18, 2025 10:45 AM", "Admin", "PDF", "Completed"],
      ["Jobs Performance Report", "Job", "May 18, 2025 10:30 AM", "Admin", "Excel", "Completed"],
      ["User Growth Report", "User", "May 18, 2025 10:15 AM", "Admin", "PDF", "Completed"],
      ["Provider Performance Report", "Provider", "May 18, 2025 10:00 AM", "Admin", "Excel", "Completed"],
    ],
    sideTitle: "Platform Overview",
    sideItems: [
      { label: "New Users", value: "842", tone: "bg-blue-500" },
      { label: "Provider Retention", value: "85.6%", tone: "bg-green-500" },
      { label: "Dispute Rate", value: "1.8%", tone: "bg-red-500" },
    ],
  },
  settings: {
    title: "Settings",
    subtitle: "Manage platform configuration and preferences.",
    action: "Save Changes",
    stats: [
      { label: "Platform Version", value: "v2.4.1", change: "Production", icon: Settings, tone: "red" },
      { label: "Server Time", value: "10:45 AM", change: "May 18, 2025", icon: Clock3, tone: "blue" },
      { label: "Database", value: "MySQL 8.0.32", change: "Healthy", icon: ShieldCheck, tone: "green" },
      { label: "Cache Driver", value: "Redis", change: "Online", icon: Gauge, tone: "amber" },
    ],
    tabs: ["General", "Organization", "Localization", "Notifications", "Payments", "Security"],
    search: "Search setting name or configuration area...",
    filters: ["General", "Production", "All Modules"],
    columns: ["Setting", "Current Value", "Area", "Updated By", "Status"],
    rows: [
      ["Platform Name", "Sherix", "Site Information", "Admin", "Active"],
      ["Platform Domain", "https://admin.sherix.com", "Site Information", "Admin", "Active"],
      ["Support Email", "support@sherix.com", "Contact Information", "Admin", "Active"],
      ["Default Currency", "GHS - Ghana Cedi", "Payments", "Admin", "Active"],
      ["Session Timeout", "30 Minutes", "Security", "Admin", "Active"],
    ],
    sideTitle: "Quick Links",
    sideItems: [
      { label: "Clear Cache", value: "Ready", tone: "bg-violet-500" },
      { label: "System Backup", value: "Enabled", tone: "bg-green-500" },
      { label: "Activity Logs", value: "5,842 events", tone: "bg-amber-500" },
    ],
  },
  organizationData: {
    title: "Organization Data",
    subtitle: "Manage organization profile, legal details, offices and operational records.",
    stats: [
      { label: "Registered Entities", value: "4", change: "All verified", icon: Building2, tone: "blue" },
      { label: "Operating Regions", value: "16", change: "2 added this month", icon: Gauge, tone: "green" },
      { label: "Documents", value: "38", change: "5 expiring soon", icon: FileText, tone: "amber" },
      { label: "Compliance Score", value: "96%", change: "4% vs last audit", icon: ShieldCheck, tone: "teal" },
    ],
    tabs: ["Services", "Issues", "Ads/Campaigns","Legal"],
    search: "Search organization records, documents or locations...",
    filters: ["All Record Types", "All Regions", "All Statuses"],
    columns: ["Record", "Type", "Owner", "Region", "Last Updated", "Status"],
    rows: [
      ["Sherix Ghana Ltd.", "Registered Entity", "Operations", "Accra", "May 18, 2025", "Verified"],
      ["Head Office", "Branch", "Admin", "Airport, Accra", "May 17, 2025", "Active"],
      ["Tax Clearance Certificate", "Document", "Finance", "Ghana", "May 15, 2025", "Pending"],
      ["Provider Vetting Policy", "Compliance", "Risk", "All Regions", "May 12, 2025", "Active"],
    ],
   
  },
  auditLogs: {
    title: "Audit Logs",
    subtitle: "Track and review all important activities performed across the platform.",
    stats: [
      { label: "Total Events", value: "5,842", change: "12.5% vs last week", icon: FileClock, tone: "purple" },
      { label: "Unique Users", value: "142", change: "8.2% vs last week", icon: Users, tone: "green" },
      { label: "Critical Events", value: "37", change: "15.6% vs last week", icon: AlertTriangle, tone: "amber" },
      { label: "Failed Attempts", value: "89", change: "4.7% vs last week", icon: ShieldCheck, tone: "red", down: true },
    ],
    search: "Search by keyword, user, action, resource or IP...",
    filters: ["All Actions", "All Users", "All Roles", "All Resources"],
    columns: ["Time", "User", "Role", "Action", "Resource", "Resource ID", "IP Address", "Status"],
    rows: [
      ["May 18, 2025 10:45 AM", "Ama Serwaa", "Admin", "Updated Provider Profile", "Service Provider", "SP-2548", "102.89.45.12", "Success"],
      ["May 18, 2025 10:32 AM", "Kofi Mensah", "Admin", "Approved Payout", "Payout", "PAYOUT-8791", "197.210.33.45", "Success"],
      ["May 18, 2025 10:12 AM", "Efua Wiafe", "Support", "Updated Job Status", "Job", "JOB-12458", "41.204.18.33", "Success"],
      ["May 18, 2025 09:03 AM", "Joseph Osei", "Admin", "Failed Login Attempt", "System", "-", "203.0.113.55", "Failed"],
    ],
    sideTitle: "Events by Severity",
    sideItems: [
      { label: "Informational", value: "3,914 (67.0%)", tone: "bg-blue-500" },
      { label: "Warning", value: "1,143 (19.6%)", tone: "bg-amber-500" },
      { label: "Error", value: "548 (9.4%)", tone: "bg-orange-500" },
      { label: "Critical", value: "237 (4.0%)", tone: "bg-red-500" },
    ],
  },
};

function statusBadge(value: string) {
  const className = statusClasses[value];
  if (!className) return value;
  return <Badge className={className}>{value}</Badge>;
}

function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{stat.label}</p>
          <p className="mt-2 truncate text-2xl font-black tracking-normal">{stat.value}</p>
          <p className={cn("mt-2 text-xs font-bold", stat.down ? "text-red-600" : "text-green-600")}>{stat.down ? "v" : "^"} {stat.change}</p>
        </div>
        <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-xl", toneClasses[stat.tone])}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function SidePanel({ title, items = [] }: { title?: string; items?: PageConfig["sideItems"] }) {
  if (!title) return null;

  return (
    <div className="space-y-5">
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border-[18px] border-blue-500 border-r-green-500 border-t-amber-400">
            <div className="text-center">
              <p className="text-xl font-black">76%</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", item.tone ?? "bg-slate-400")} />
                <span className="truncate text-muted-foreground">{item.label}</span>
              </div>
              <span className="shrink-0 font-bold">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {["View Details", "Export Data", "Open Activity"].map((item) => (
            <Button key={item} variant="outline" className="justify-between">
              {item}
              <MoreVertical className="h-4 w-4" />
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDataPage({ pageKey }: { pageKey: PageKey }) {
  const config = configs[pageKey];

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title={config.title} subtitle={config.subtitle} />
        {config.action && (
          <Button className="w-fit">
            <Plus className="h-4 w-4" />
            {config.action}
          </Button>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {config.stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </section>

      {config.tabs && (
        <div className="flex gap-7 overflow-x-auto border-b text-sm font-bold sherix-scrollbar">
          {config.tabs.map((tab, index) => (
            <div key={tab} className={cn("whitespace-nowrap border-b-2 px-1 pb-3", index === 0 ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>
              {tab}
            </div>
          ))}
        </div>
      )}

      <section className={cn("grid gap-5", config.sideTitle && "xl:grid-cols-[minmax(0,1fr)_320px]")}>
        <Card className="min-w-0 rounded-xl">
          <CardContent className="p-0">
            <div className="grid gap-3 border-b p-4 lg:grid-cols-[minmax(240px,1fr)_auto_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder={config.search} />
              </div>
              <div className="flex flex-wrap gap-2">
                {config.filters.map((filter) => (
                  <Button key={filter} variant="outline" className="justify-between">
                    {filter}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2">
               
                <Button variant="outline">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  {config.columns.map((column) => (
                    <TableHead key={column}>{column}</TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {config.rows.map((row) => (
                  <TableRow key={row.join("-")}>
                    {row.map((cell, index) => (
                      <TableCell key={`${cell}-${index}`} className={index === 0 ? "font-bold" : undefined}>
                        {statusBadge(cell)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label="More actions">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-3 border-t p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>Showing 1 to {config.rows.length} of {config.rows.length * 156} records</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((page) => (
                  <Button key={page} variant={page === 1 ? "default" : "ghost"} size="icon" className="h-8 w-8">
                    {page}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <SidePanel title={config.sideTitle} items={config.sideItems} />
      </section>
    </div>
  );
}
