import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  DollarSign,
  Eye,
  FileClock,
  FileText,
  Gift,
  Mail,
  MessageSquare,
  RefreshCcw,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Star,
  UserCheck,
  UserPlus,
  UserRoundX,
  Users,
  Wallet,
  WalletCards,
  XCircle,
} from "lucide-react";

export const statCards = [
  { label: "Total Users", value: "12,458", change: "+8.5% vs last week", icon: Users, tone: "red" },
  { label: "Service Providers", value: "1,245", change: "+10.3% vs last week", icon: ShieldCheck, tone: "red" },
  { label: "Total Jobs", value: "3,892", change: "+12.7% vs last week", icon: Briefcase, tone: "blue" },
  { label: "Total Revenue", value: "GHS 128,540", change: "+15.4% vs last week", icon: DollarSign, tone: "amber" },
  { label: "Completed Jobs", value: "3,256", change: "+11.2% vs last week", icon: ClipboardCheck, tone: "green" },
] as const;

export const jobsOverview = [
  { day: "May 12", completed: 380, inProgress: 70, cancelled: 8 },
  { day: "May 13", completed: 460, inProgress: 88, cancelled: 10 },
  { day: "May 14", completed: 430, inProgress: 76, cancelled: 7 },
  { day: "May 15", completed: 520, inProgress: 95, cancelled: 9 },
  { day: "May 16", completed: 610, inProgress: 110, cancelled: 11 },
  { day: "May 17", completed: 570, inProgress: 100, cancelled: 6 },
  { day: "May 18", completed: 286, inProgress: 82, cancelled: 5 },
];

export const jobStatus = [
  { name: "Completed", value: 3256, percent: "83.7%", color: "#16A34A" },
  { name: "In Progress", value: 421, percent: "10.8%", color: "#2563EB" },
  { name: "Pending", value: 167, percent: "4.3%", color: "#F59E0B" },
  { name: "Cancelled", value: 48, percent: "1.2%", color: "#DC2626" },
];

export const recentRequests = [
  { id: "#REQ-12458", name: "Kofi Mensah", location: "Accra, Airport", status: "Pending", time: "5 min ago" },
  { id: "#REQ-12457", name: "Ama Serwaa", location: "Madina, Accra", status: "Ongoing", time: "12 min ago" },
  { id: "#REQ-12456", name: "Kwame Asante", location: "Tema, Community 25", status: "Pending", time: "18 min ago" },
  { id: "#REQ-12455", name: "Abena Osei", location: "Spintex, Accra", status: "Ongoing", time: "25 min ago" },
  { id: "#REQ-12454", name: "Yaw Boadu", location: "Lapaz, Accra", status: "Completed", time: "35 min ago" },
];

export const verificationStats = [
  { label: "Pending Verification", value: "32", icon: UserCheck, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/15" },
  { label: "Approved This Week", value: "47", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/15" },
  { label: "Rejected This Week", value: "8", icon: Bell, color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/15" },
  { label: "Total Service Providers", value: "1,245", icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/15" },
];

export const revenueOverview = [
  { day: "Mon", revenue: 14500 },
  { day: "Tue", revenue: 18200 },
  { day: "Wed", revenue: 17100 },
  { day: "Thu", revenue: 22800 },
  { day: "Fri", revenue: 24600 },
  { day: "Sat", revenue: 19500 },
  { day: "Sun", revenue: 11840 },
];

export const topServices = [
  { name: "Battery Jump Start", count: "1,256", percent: 32.3 },
  { name: "Flat Tire Change", count: "982", percent: 25.2 },
  { name: "Car Diagnostics", count: "754", percent: 19.4 },
  { name: "Fuel Delivery", count: "456", percent: 11.7 },
  { name: "Others", count: "444", percent: 11.4 },
];

export const recentActivity = [
  { text: "Payment of GHS 150.00 to Bright Auto Care completed", time: "2 min ago", icon: CreditCard, color: "text-green-600", bg: "bg-green-100 dark:bg-green-500/15" },
  { text: "New service provider, John Boateng, has been approved", time: "15 min ago", icon: UserCheck, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-500/15" },
  { text: "New job request #REQ-12458 received from Kofi Mensah", time: "18 min ago", icon: Briefcase, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-500/15" },
  { text: "Dispute #DSP-1246 raised for Job #JOB-12430", time: "1 hour ago", icon: BarChart3, color: "text-red-600", bg: "bg-red-100 dark:bg-red-500/15" },
];

export const systemStatus = ["App Status", "Payment Gateway", "Push Notifications", "Server Status"];

export const userManagementMetrics = [
  { label: "Total Users", value: "12,458", change: "8.5% vs last week", direction: "up", tone: "red", icon: Users },
  { label: "Active Users", value: "9,784", change: "7.3% vs last week", direction: "up", tone: "green", icon: UserCheck },
  { label: "New Users (This Week)", value: "256", change: "12.8% vs last week", direction: "up", tone: "blue", icon: UserPlus },
  { label: "Inactive Users", value: "2,674", change: "4.1% vs last week", direction: "down", tone: "amber", icon: Clock3 },
  { label: "Suspended Users", value: "156", change: "1.2% vs last week", direction: "down", tone: "purple", icon: UserRoundX },
];

export const usersManagement = [
  { id: "USR-12086", name: "Kofi Mensah", email: "kofi@gmail.com", phone: "050 123 4567", type: "Customer", joinedDate: "May 18, 2025", status: "Active", initials: "KM", avatarTone: "bg-slate-900 text-white" },
  { id: "USR-12087", name: "Ama Serwaa", email: "ama@gmail.com", phone: "050 987 6543", type: "Customer", joinedDate: "May 18, 2025", status: "Active", initials: "AS", avatarTone: "bg-amber-600 text-white" },
  { id: "USR-12088", name: "Kwame Asante", email: "kwame@gmail.com", phone: "050 456 7890", type: "Customer", joinedDate: "May 17, 2025", status: "Active", initials: "KA", avatarTone: "bg-slate-700 text-white" },
  { id: "USR-12089", name: "Abena Osei", email: "abena@gmail.com", phone: "050 321 0987", type: "Customer", joinedDate: "May 17, 2025", status: "Inactive", initials: "AO", avatarTone: "bg-rose-600 text-white" },
  { id: "USR-12090", name: "Yaw Boadu", email: "yaw@gmail.com", phone: "050 644 3210", type: "Customer", joinedDate: "May 16, 2025", status: "Active", initials: "YB", avatarTone: "bg-slate-900 text-white" },
  { id: "USR-12091", name: "Nana Addo", email: "nana@gmail.com", phone: "050 111 2222", type: "Customer", joinedDate: "May 16, 2025", status: "Active", initials: "NA", avatarTone: "bg-orange-700 text-white" },
  { id: "USR-12092", name: "Kojo Darko", email: "kojo@gmail.com", phone: "020 333 4444", type: "Service Provider", joinedDate: "May 15, 2025", status: "Active", initials: "KD", avatarTone: "bg-slate-950 text-white" },
  { id: "USR-12093", name: "Efua Anokye", email: "efua@gmail.com", phone: "050 777 8888", type: "Service Provider", joinedDate: "May 15, 2025", status: "Active", initials: "EA", avatarTone: "bg-purple-700 text-white" },
  { id: "USR-12094", name: "Abosua Dema", email: "abosua@gmail.com", phone: "050 999 0000", type: "Service Provider", joinedDate: "May 14, 2025", status: "Pending", initials: "AD", avatarTone: "bg-slate-800 text-white" },
  { id: "USR-12095", name: "Ofori Kwadwo", email: "ofori@gmail.com", phone: "050 600 1111", type: "Customer", joinedDate: "May 14, 2025", status: "Active", initials: "OK", avatarTone: "bg-slate-900 text-white" },
];

export const serviceProviderMetrics = [
  { label: "Total Providers", value: "1,245", change: "10.3% vs last week", direction: "up", tone: "red", icon: Users },
  { label: "Verified Providers", value: "978", change: "8.6% vs last week", direction: "up", tone: "green", icon: ShieldCheck },
  { label: "Pending Verification", value: "147", change: "2.1% vs last week", direction: "up", tone: "amber", icon: Clock3 },
  { label: "Rejected Providers", value: "78", change: "5.4% vs last week", direction: "down", tone: "red", icon: XCircle },
  { label: "Active Providers", value: "1,102", change: "9.7% vs last week", direction: "up", tone: "blue", icon: Briefcase },
];

export const serviceProviders = [
  { id: "SP-2548", name: "Bright Auto Care", email: "bright@gmail.com", services: ["Battery", "Diagnostics"], extraServices: 2, phone: "050 123 4567", location: "Accra, Airport", rating: 4.8, reviews: 126, status: "Verified", joinedDate: "May 18, 2025", initials: "BAC", avatarTone: "bg-black text-white" },
  { id: "SP-2547", name: "QuickFix Services", email: "quickfix@gmail.com", services: ["Tire Change", "Battery"], extraServices: 0, phone: "050 987 6543", location: "Madina, Accra", rating: 4.6, reviews: 98, status: "Verified", joinedDate: "May 18, 2025", initials: "QS", avatarTone: "bg-purple-800 text-white" },
  { id: "SP-2546", name: "Speedy Mechanics", email: "speedy@gmail.com", services: ["Diagnostics", "Engine"], extraServices: 1, phone: "050 456 7890", location: "Tema, Community 25", rating: 4.7, reviews: 156, status: "Pending", joinedDate: "May 17, 2025", initials: "SM", avatarTone: "bg-black text-amber-300" },
  { id: "SP-2545", name: "Auto Rescue GH", email: "rescuegh@gmail.com", services: ["Towing", "Battery"], extraServices: 0, phone: "050 321 0087", location: "Spintex, Accra", rating: 4.5, reviews: 87, status: "Verified", joinedDate: "May 17, 2025", initials: "AB", avatarTone: "bg-black text-white" },
  { id: "SP-2544", name: "Wheels & More", email: "wheels@gmail.com", services: ["Tires", "Alignment"], extraServices: 1, phone: "050 644 3210", location: "Lapaz, Accra", rating: 4.3, reviews: 64, status: "Rejected", joinedDate: "May 16, 2025", initials: "WM", avatarTone: "bg-black text-sky-300" },
  { id: "SP-2543", name: "DriveCare", email: "drivecare@gmail.com", services: ["Diagnostics", "AC Repair"], extraServices: 0, phone: "050 111 2222", location: "Dzorwulu, Accra", rating: 4.6, reviews: 74, status: "Verified", joinedDate: "May 16, 2025", initials: "DC", avatarTone: "bg-black text-white" },
  { id: "SP-2542", name: "FixIt Right", email: "fixit@gmail.com", services: ["Battery", "Brakes"], extraServices: 1, phone: "050 333 4444", location: "East Legon, Accra", rating: 4.4, reviews: 68, status: "Pending", joinedDate: "May 15, 2025", initials: "FR", avatarTone: "bg-black text-white" },
  { id: "SP-2541", name: "Reliable Pros", email: "reliable@gmail.com", services: ["Engine", "Diagnostics"], extraServices: 2, phone: "050 666 6666", location: "Adenta, Accra", rating: 4.9, reviews: 210, status: "Verified", joinedDate: "May 15, 2025", initials: "RP", avatarTone: "bg-black text-emerald-300" },
  { id: "SP-2540", name: "Auto Hub", email: "autohub@gmail.com", services: ["Towing", "AC Repair"], extraServices: 0, phone: "050 777 8888", location: "Kasoa, Central", rating: 4.2, reviews: 55, status: "Rejected", joinedDate: "May 14, 2025", initials: "AA", avatarTone: "bg-black text-white" },
  { id: "SP-2539", name: "GH Auto Experts", email: "experts@gmail.com", services: ["Diagnostics", "Battery"], extraServices: 1, phone: "050 000 0000", location: "Ashaiman, Accra", rating: 4.6, reviews: 92, status: "Verified", joinedDate: "May 14, 2025", initials: "GHA", avatarTone: "bg-black text-white" },
];

export const jobsMetrics = [
  { label: "Total Requests", value: "3,892", change: "12.7% vs last week", direction: "up", tone: "blue", icon: Briefcase },
  { label: "Pending Requests", value: "167", change: "3.4% vs last week", direction: "down", tone: "amber", icon: Clock3 },
  { label: "In Progress", value: "421", change: "8.1% vs last week", direction: "up", tone: "blue", icon: RefreshCcw },
  { label: "Completed Jobs", value: "3,256", change: "11.2% vs last week", direction: "up", tone: "green", icon: ClipboardCheck },
  { label: "Cancelled Jobs", value: "48", change: "1.2% vs last week", direction: "down", tone: "red", icon: XCircle },
];

export const jobsRequests = [
  { id: "JOB-12458", requestId: "REQ-12458", service: "Battery Jump Start", customer: "Kofi Mensah", provider: "Bright Auto Care", location: "Accra, Airport", amount: "GHS 120.00", status: "Completed", priority: "High", paymentStatus: "Paid", date: "May 18, 2025", time: "10:30 AM" },
  { id: "JOB-12457", requestId: "REQ-12457", service: "Tire Change", customer: "Ama Serwaa", provider: "QuickFix Services", location: "Madina, Accra", amount: "GHS 100.00", status: "Ongoing", priority: "Medium", paymentStatus: "Paid", date: "May 18, 2025", time: "09:30 AM" },
  { id: "JOB-12456", requestId: "REQ-12456", service: "Car Diagnostics", customer: "Kwame Asante", provider: "Speedy Mechanics", location: "Tema, Community 25", amount: "GHS 150.00", status: "Ongoing", priority: "Medium", paymentStatus: "Pending", date: "May 17, 2025", time: "08:15 PM" },
  { id: "JOB-12455", requestId: "REQ-12455", service: "Oil Change", customer: "Efua Anokye", provider: "Reliable Pros", location: "Adenta, Accra", amount: "GHS 80.00", status: "Completed", priority: "Low", paymentStatus: "Paid", date: "May 17, 2025", time: "04:45 PM" },
  { id: "JOB-12454", requestId: "REQ-12454", service: "Towing Service", customer: "Ofori Kwadwo", provider: "CoolPro Auto", location: "Dzorwulu, Accra", amount: "GHS 200.00", status: "Completed", priority: "High", paymentStatus: "Paid", date: "May 16, 2025", time: "02:30 PM" },
  { id: "JOB-12453", requestId: "REQ-12453", service: "AC Repair", customer: "Nana Addo", provider: "Auto Rescue GH", location: "Spintex, Accra", amount: "GHS 250.00", status: "Cancelled", priority: "High", paymentStatus: "Refunded", date: "May 16, 2025", time: "11:20 AM" },
  { id: "JOB-12452", requestId: "REQ-12452", service: "Car Lockout", customer: "Abena Osei", provider: "DriveCare", location: "Lapaz, Accra", amount: "GHS 90.00", status: "Pending", priority: "Medium", paymentStatus: "Unpaid", date: "May 15, 2025", time: "06:05 PM" },
  { id: "JOB-12451", requestId: "REQ-12451", service: "Fuel Delivery", customer: "Yaw Bediako", provider: "QuickFix Services", location: "East Legon, Accra", amount: "GHS 60.00", status: "Pending", priority: "Low", paymentStatus: "Unpaid", date: "May 15, 2025", time: "03:45 PM" },
];

export const jobDetails = {
  id: "JOB-12458",
  service: "Battery Jump Start",
  status: "Completed",
  priority: "High",
  paymentStatus: "Paid",
  amount: "GHS 120",
  createdOn: "May 18, 2025",
  createdTime: "10:30 AM",
  customer: { name: "Kofi Mensah", email: "kofi@gmail.com", phone: "050 123 4567", address: "Accra, Airport Residential Area Block 2, House 12", initials: "KM", avatarTone: "bg-slate-900 text-white" },
  provider: { name: "Bright Auto Care", email: "bright@gmail.com", phone: "050 123 4567", id: "SP-2548", rating: 4.8, reviews: 126, initials: "BAC", avatarTone: "bg-black text-white" },
  info: [
    ["Job ID", "JOB-12458"],
    ["Service", "Battery Jump Start"],
    ["Category", "Battery"],
    ["Sub Category", "Jump Start"],
    ["Requested On", "May 18, 2025 10:30 AM"],
    ["Preferred Time", "May 18, 2025 10:30 AM"],
    ["Completed On", "May 18, 2025 11:05 AM"],
    ["Job Source", "Mobile App (Customer)"],
    ["Notes from Customer", "My car battery is dead. Need jump start at the location."],
  ],
  meta: [
    ["Status", "Completed"],
    ["Priority", "High"],
    ["Service Type", "On-site"],
    ["Estimated Time", "30 mins"],
    ["Actual Time", "35 mins"],
    ["Distance", "6.4 km"],
    ["Created By", "Kofi Mensah (Customer)"],
    ["Job Type", "Standard"],
  ],
  description: "Customer requested a battery jump start for their vehicle which is not starting.",
  vehicle: [
    ["Make / Model", "Toyota Corolla"],
    ["Year", "2015"],
    ["Color", "Silver"],
    ["Plate No.", "GW 1234-20"],
  ],
  timeline: [
    { label: "Job Created", time: "May 18, 2025 10:30 AM", tone: "blue" },
    { label: "Provider Assigned", time: "May 18, 2025 10:32 AM", tone: "purple" },
    { label: "Provider En Route", time: "May 18, 2025 10:38 AM", tone: "amber" },
    { label: "Provider Arrived", time: "May 18, 2025 10:45 AM", tone: "blue" },
    { label: "Job In Progress", time: "May 18, 2025 10:45 AM", tone: "amber" },
    { label: "Job Completed", time: "May 18, 2025 11:05 AM", tone: "green" },
  ],
  payment: [
    ["Amount", "GHS 120.00"],
    ["Platform Fee", "- GHS 12.00"],
    ["Provider Payout", "GHS 108.00"],
  ],
};

export const earningsMetrics = [
  { label: "Total Earnings", value: "GHS 128,540", change: "16.4% vs last week", direction: "up", tone: "green", icon: Wallet },
  { label: "Platform Commission", value: "GHS 10,215", change: "10.1% vs last week", direction: "up", tone: "purple", icon: DollarSign },
  { label: "Provider Earnings", value: "GHS 118,325", change: "14.2% vs last week", direction: "up", tone: "blue", icon: WalletCards },
  { label: "Pending Payouts", value: "GHS 8,230", change: "5.3% vs last week", direction: "down", tone: "amber", icon: Clock3 },
  { label: "Paid This Month", value: "GHS 76,890", change: "18.7% vs last week", direction: "up", tone: "teal", icon: CheckCircle2 },
];

export const earningsChart = [
  { day: "May 12", provider: 20000, commission: 2600 },
  { day: "May 13", provider: 26000, commission: 3900 },
  { day: "May 14", provider: 22000, commission: 5200 },
  { day: "May 15", provider: 28000, commission: 4300 },
  { day: "May 16", provider: 32500, commission: 5400 },
  { day: "May 17", provider: 24500, commission: 4700 },
  { day: "May 18", provider: 28250, commission: 5300 },
];

export const earningsDistribution = [
  { name: "Provider Payouts", value: 118325, percent: "92.1%", color: "#16A34A" },
  { name: "Platform Commission", value: 10215, percent: "8.0%", color: "#2563EB" },
  { name: "Other Deductions", value: 0, percent: "-0.1%", color: "#F59E0B" },
];

export const recentPayouts = [
  { id: "PAYOUT-1248", provider: "Bright Auto Care", initials: "BAC", amount: "GHS 1,320", method: "Mobile Money", date: "May 18, 2025", status: "Completed" },
  { id: "PAYOUT-1247", provider: "QuickFix Services", initials: "QS", amount: "GHS 960", method: "Bank Transfer", date: "May 18, 2025", status: "Completed" },
  { id: "PAYOUT-1246", provider: "Speedy Mechanics", initials: "SM", amount: "GHS 1,400", method: "Mobile Money", date: "May 17, 2025", status: "Completed" },
  { id: "PAYOUT-1245", provider: "Wheels & More", initials: "WM", amount: "GHS 780", method: "Bank Transfer", date: "May 17, 2025", status: "Completed" },
  { id: "PAYOUT-1244", provider: "Auto Rescue GH", initials: "AR", amount: "GHS 2,050", method: "Mobile Money", date: "May 16, 2025", status: "Completed" },
];

export const topEarningProviders = [
  { rank: 1, provider: "Bright Auto Care", initials: "BAC", earnings: "GHS 12,340", jobs: 56 },
  { rank: 2, provider: "QuickFix Services", initials: "QS", earnings: "GHS 9,870", jobs: 48 },
  { rank: 3, provider: "Speedy Mechanics", initials: "SM", earnings: "GHS 8,450", jobs: 42 },
  { rank: 4, provider: "Wheels & More", initials: "WM", earnings: "GHS 7,230", jobs: 38 },
  { rank: 5, provider: "Auto Rescue GH", initials: "AR", earnings: "GHS 6,780", jobs: 34 },
];

export const transactionsMetrics = [
  { label: "Total Transactions", value: "GHS 256,780", change: "12.6% vs last week", direction: "up", tone: "purple", icon: DollarSign },
  { label: "Total Amount In", value: "GHS 187,540", change: "14.8% vs last week", direction: "up", tone: "green", icon: Wallet },
  { label: "Total Amount Out", value: "GHS 151,320", change: "5.2% vs last week", direction: "down", tone: "amber", icon: WalletCards },
  { label: "Refunds Issued", value: "GHS 8,450", change: "8.7% vs last week", direction: "down", tone: "blue", icon: Briefcase },
  { label: "Disputes Amount", value: "GHS 5,680", change: "3.4% vs last week", direction: "down", tone: "red", icon: RefreshCcw },
];

export const transactions = [
  { id: "TRX-12548", type: "Payment", relatedTo: "Job #JOB-12458", detail: "Battery Jump Start", from: "Kofi Mensah", fromRole: "Customer", to: "Bright Auto Care", toRole: "Provider", method: "Mobile Money", amount: "GHS 120.00", status: "Completed", date: "May 18, 2025", time: "10:30 AM" },
  { id: "TRX-12547", type: "Payout", relatedTo: "Payout to Provider", detail: "", from: "Sherix Platform", fromRole: "Platform", to: "QuickFix Services", toRole: "Provider", method: "Bank Transfer", amount: "GHS 100.00", status: "Completed", date: "May 18, 2025", time: "09:15 AM" },
  { id: "TRX-12546", type: "Refund", relatedTo: "Job #JOB-12453", detail: "Brake Repair", from: "Sherix Platform", fromRole: "Platform", to: "Nana Addo", toRole: "Customer", method: "Mobile Money", amount: "GHS 80.00", status: "Pending", date: "May 17, 2025", time: "04:45 PM" },
  { id: "TRX-12545", type: "Commission", relatedTo: "Job #JOB-12454", detail: "Towing Service", from: "QuickFix Services", fromRole: "Provider", to: "Sherix Platform", toRole: "Platform", method: "Wallet Balance", amount: "GHS 16.00", status: "Completed", date: "May 17, 2025", time: "03:20 PM" },
  { id: "TRX-12544", type: "Payment", relatedTo: "Job #JOB-12455", detail: "Oil Change", from: "Ama Serwaa", fromRole: "Customer", to: "Speedy Mechanics", toRole: "Provider", method: "Card Payment", amount: "GHS 150.00", status: "Completed", date: "May 17, 2025", time: "11:10 AM" },
  { id: "TRX-12543", type: "Payout", relatedTo: "Payout to Provider", detail: "", from: "Sherix Platform", fromRole: "Platform", to: "Speedy Mechanics", toRole: "Provider", method: "Bank Transfer", amount: "GHS 150.00", status: "Completed", date: "May 16, 2025", time: "06:25 PM" },
  { id: "TRX-12542", type: "Dispute Hold", relatedTo: "Job #JOB-12450", detail: "AC Repair", from: "Sherix Platform", fromRole: "Platform", to: "CoolPro Auto", toRole: "Provider", method: "Wallet Balance", amount: "GHS 160.00", status: "Pending", date: "May 16, 2025", time: "02:30 PM" },
  { id: "TRX-12541", type: "Refund", relatedTo: "Job #JOB-12449", detail: "AC Repair", from: "Sherix Platform", fromRole: "Platform", to: "Ofori Kwadwo", toRole: "Customer", method: "Mobile Money", amount: "GHS 60.00", status: "Completed", date: "May 16, 2025", time: "10:05 AM" },
  { id: "TRX-12540", type: "Payment", relatedTo: "Job #JOB-12451", detail: "Battery Replacement", from: "Abena Osei", fromRole: "Customer", to: "Reliable Pros", toRole: "Provider", method: "Mobile Money", amount: "GHS 250.00", status: "Completed", date: "May 16, 2025", time: "09:45 AM" },
  { id: "TRX-12539", type: "Payout", relatedTo: "Payout to Provider", detail: "", from: "Sherix Platform", fromRole: "Platform", to: "Reliable Pros", toRole: "Provider", method: "Bank Transfer", amount: "GHS 250.00", status: "Completed", date: "May 15, 2025", time: "05:30 PM" },
];

export const ratingsMetrics = [
  { label: "Average Rating", value: "4.6", change: "0.2 vs last week", direction: "up", tone: "amber", icon: Star },
  { label: "Total Reviews", value: "2,845", change: "12.4% vs last week", direction: "up", tone: "purple", icon: MessageSquare },
  { label: "Reviews This Week", value: "342", change: "8.7% vs last week", direction: "up", tone: "blue", icon: Briefcase },
  { label: "Positive Reviews", value: "2,245 (79%)", change: "11.3% vs last week", direction: "up", tone: "green", icon: CheckCircle2 },
  { label: "Negative Reviews", value: "287 (10%)", change: "5.6% vs last week", direction: "down", tone: "red", icon: XCircle },
  { label: "Pending Reviews", value: "313 (11%)", change: "3.2% vs last week", direction: "up", tone: "amber", icon: Eye },
];

export const reviews = [
  { id: "REV-2845", rating: 4.5, title: "Great service and quick response", text: "The provider arrived on time and fixed my car battery quickly. Very professional!", job: "Job #JOB-12458", service: "Battery Jump Start", reviewer: "Kofi Mensah", provider: "Bright Auto Care", providerId: "SP-2548", date: "May 18, 2025", time: "10:45 AM", status: "Published", initials: "KM" },
  { id: "REV-2844", rating: 5.0, title: "Excellent experience", text: "Very friendly and knowledgeable. Explained everything clearly.", job: "Job #JOB-12457", service: "Tire Change", reviewer: "Ama Serwaa", provider: "QuickFix Services", providerId: "SP-2547", date: "May 18, 2025", time: "09:30 AM", status: "Published", initials: "AS" },
  { id: "REV-2843", rating: 3.0, title: "Average service", text: "The service was okay, but took longer than expected.", job: "Job #JOB-12456", service: "Car Diagnostics", reviewer: "Kwame Asante", provider: "Speedy Mechanics", providerId: "SP-2546", date: "May 17, 2025", time: "08:15 PM", status: "Published", initials: "KS" },
  { id: "REV-2842", rating: 1.0, title: "Not satisfied", text: "Provider didn't show up on time and communication was poor.", job: "Job #JOB-12452", service: "Car Lockout", reviewer: "Kojo Darko", provider: "DriveCare", providerId: "SP-2543", date: "May 17, 2025", time: "11:20 AM", status: "Flagged", initials: "KD" },
  { id: "REV-2841", rating: 4.0, title: "Good service", text: "Did the job well. Would recommend.", job: "Job #JOB-12451", service: "Oil Change", reviewer: "Efua Anokye", provider: "Reliable Pros", providerId: "SP-2541", date: "May 16, 2025", time: "04:45 PM", status: "Published", initials: "EA" },
  { id: "REV-2840", rating: 5.0, title: "Highly recommended", text: "Very efficient, polite and professional. Great work!", job: "Job #JOB-12449", service: "AC Repair", reviewer: "Ofori Kwadwo", provider: "CoolPro Auto", providerId: "SP-2549", date: "May 16, 2025", time: "10:10 AM", status: "Published", initials: "OF" },
  { id: "REV-2839", rating: 2.0, title: "Below expectations", text: "Quality of work was not up to the mark.", job: "Job #JOB-12450", service: "Fuel Delivery", reviewer: "Abosua Dema", provider: "QuickFix Services", providerId: "SP-2547", date: "May 16, 2025", time: "02:30 AM", status: "Pending", initials: "AD" },
  { id: "REV-2838", rating: 4.5, title: "Nice and smooth", text: "Everything went well. Happy with the service.", job: "Job #JOB-12448", service: "Towing Service", reviewer: "Nana Addo", provider: "Auto Rescue GH", providerId: "SP-2545", date: "May 15, 2025", time: "06:05 PM", status: "Published", initials: "NA" },
];

export const ratingDistribution = [
  { label: "5 Stars", value: 1324, percent: "46.6%", color: "#16A34A", width: 88 },
  { label: "4 Stars", value: 845, percent: "29.7%", color: "#22C55E", width: 58 },
  { label: "3 Stars", value: 402, percent: "14.1%", color: "#FBBF24", width: 36 },
  { label: "2 Stars", value: 168, percent: "5.9%", color: "#F97316", width: 22 },
  { label: "1 Star", value: 106, percent: "3.7%", color: "#DC2626", width: 14 },
];

export const topRatedProviders = [
  { rank: 1, name: "Bright Auto Care", initials: "BAC", rating: 4.8, reviews: 268 },
  { rank: 2, name: "Speedy Mechanics", initials: "SM", rating: 4.7, reviews: 223 },
  { rank: 3, name: "QuickFix Services", initials: "QS", rating: 4.6, reviews: 198 },
  { rank: 4, name: "Reliable Pros", initials: "RP", rating: 4.6, reviews: 186 },
  { rank: 5, name: "Wheels & More", initials: "WM", rating: 4.5, reviews: 164 },
];

export const notificationsMetrics = [
  { label: "Total Sent", value: "24,785", change: "12.6% vs last week", direction: "up", tone: "purple", icon: Send },
  { label: "Email Sent", value: "12,456", change: "10.3% vs last week", direction: "up", tone: "blue", icon: Mail },
  { label: "SMS Sent", value: "8,972", change: "14.2% vs last week", direction: "up", tone: "green", icon: MessageSquare },
  { label: "Push Sent", value: "3,357", change: "8.7% vs last week", direction: "up", tone: "amber", icon: Bell },
  { label: "Open Rate (Email)", value: "32.4%", change: "5.6% vs last week", direction: "up", tone: "red", icon: Eye },
];

export const notificationRows = [
  { title: "Job Assigned", description: "You have been assigned a new job...", type: "Job Update", channels: ["Email", "SMS", "Push"], audience: "Service Providers", sentTo: "6,432", status: "Sent", sentOn: "May 18, 2025", time: "10:45 AM", tone: "green" },
  { title: "Payment Received", description: "You have received a payment of GHS...", type: "Payment", channels: ["Email", "SMS"], audience: "Service Providers", sentTo: "4,231", status: "Sent", sentOn: "May 18, 2025", time: "09:30 AM", tone: "blue" },
  { title: "Review Reminder", description: "Don't forget to review your recent service...", type: "Reminder", channels: ["Email", "Push"], audience: "Customers", sentTo: "3,987", status: "Sent", sentOn: "May 17, 2025", time: "08:00 PM", tone: "amber" },
  { title: "New Feature Update", description: "We have launched a new feature...", type: "Announcement", channels: ["Email", "Push"], audience: "All Users", sentTo: "15,642", status: "Sent", sentOn: "May 17, 2025", time: "03:15 PM", tone: "purple" },
  { title: "Job Cancellation", description: "Job #JOB-12458 has been cancelled.", type: "Alert", channels: ["SMS"], audience: "Service Providers", sentTo: "1,204", status: "Sent", sentOn: "May 17, 2025", time: "11:20 AM", tone: "red" },
  { title: "Security Alert", description: "New sign-in detected from a new device.", type: "Security", channels: ["Email", "SMS"], audience: "Customers", sentTo: "2,319", status: "Sent", sentOn: "May 16, 2025", time: "10:05 PM",  tone: "green" },
  { title: "Promotional Offer", description: "Get 20% off on your next service.", type: "Promotion", channels: ["Email", "SMS", "Push"], audience: "Customers", sentTo: "8,765", status: "Scheduled", sentOn: "May 20, 2025", time: "09:00 AM",  tone: "blue" },
  { title: "Maintenance Notice", description: "We will be performing scheduled...", type: "System", channels: ["Email", "Push"], audience: "All Users", sentTo: "18,320", status: "Draft", sentOn: "-", time: "-", tone: "slate" },
];

export const notificationSummary = [
  { name: "Email", value: 12456, percent: "50.2%", color: "#2563EB" },
  { name: "SMS", value: 8972, percent: "36.2%", color: "#16A34A" },
  { name: "Push", value: 3357, percent: "13.6%", color: "#F59E0B" },
];

export const topNotifications = [
  { name: "Job Assigned", rate: "38.7%" },
  { name: "Security Alert", rate: "41.8%" },
  { name: "Payment Received", rate: "34.2%" },
  { name: "New Feature Update", rate: "31.6%" },
  { name: "Promo: 20% Off", rate: "28.9%" },
];

export const disputeMetrics = [
  { label: "Total Disputes", value: "128", change: "8.2% vs last week", direction: "down", tone: "purple", icon: AlertTriangle },
  { label: "Open", value: "42", change: "5.6% vs last week", direction: "down", tone: "amber", icon: Clock3 },
  { label: "Under Review", value: "36", change: "12.1% vs last week", direction: "up", tone: "blue", icon: FileClock },
  { label: "Resolved", value: "41", change: "9.7% vs last week", direction: "up", tone: "green", icon: CheckCircle2 },
  { label: "Rejected", value: "9", change: "18.2% vs last week", direction: "down", tone: "red", icon: XCircle },
];

export const disputes = [
  { id: "DSP-1284", jobId: "JOB-12458", jobName: "Battery Jump Start", raisedBy: "Kofi Mensah", raisedInitials: "KM", against: "Bright Auto Care", againstInitials: "BAC", reason: "Service not completed as described", amount: "GHS 120.00", status: "Open", raisedOn: "May 18, 2025", time: "10:45 AM" },
  { id: "DSP-1283", jobId: "JOB-12457", jobName: "Tire Change", raisedBy: "Ama Serwaa", raisedInitials: "AS", against: "QuickFix Services", againstInitials: "QS", reason: "Overcharged", amount: "GHS 100.00", status: "Under Review", raisedOn: "May 18, 2025", time: "09:30 AM" },
  { id: "DSP-1282", jobId: "JOB-12456", jobName: "Car Diagnostics", raisedBy: "Kwame Asante", raisedInitials: "KA", against: "Speedy Mechanics", againstInitials: "SM", reason: "Poor service quality", amount: "GHS 150.00", status: "Under Review", raisedOn: "May 17, 2025", time: "08:15 PM" },
  { id: "DSP-1281", jobId: "JOB-12455", jobName: "Oil Change", raisedBy: "Efua Anokye", raisedInitials: "EA", against: "Reliable Pros", againstInitials: "RP", reason: "Service not completed", amount: "GHS 80.00", status: "Resolved", raisedOn: "May 17, 2025", time: "04:45 PM" },
  { id: "DSP-1280", jobId: "JOB-12454", jobName: "Towing Service", raisedBy: "Ofori Kwadwo", raisedInitials: "OK", against: "CoolPro Auto", againstInitials: "CP", reason: "Late arrival", amount: "GHS 200.00", status: "Resolved", raisedOn: "May 16, 2025", time: "02:30 PM" },
  { id: "DSP-1279", jobId: "JOB-12453", jobName: "AC Repair", raisedBy: "Nana Addo", raisedInitials: "NA", against: "Auto Rescue GH", againstInitials: "AR", reason: "Incorrect diagnosis", amount: "GHS 250.00", status: "Rejected", raisedOn: "May 16, 2025", time: "11:20 AM" },
  { id: "DSP-1278", jobId: "JOB-12452", jobName: "Car Lockout", raisedBy: "Abena Osei", raisedInitials: "AO", against: "DriveCare", againstInitials: "DC", reason: "Billing dispute", amount: "GHS 90.00", status: "Open", raisedOn: "May 15, 2025", time: "06:05 PM" },
  { id: "DSP-1277", jobId: "JOB-12451", jobName: "Fuel Delivery", raisedBy: "Yaw Bediako", raisedInitials: "YB", against: "QuickFix Services", againstInitials: "QS", reason: "Wrong fuel delivered", amount: "GHS 60.00", status: "Open", raisedOn: "May 15, 2025", time: "03:45 PM" },
];

export const reportsMetrics = [
  { label: "Total Revenue", value: "GHS 24,780.50", change: "12.6% vs May 5 - May 11", direction: "up", tone: "purple", icon: WalletCards },
  { label: "Total Jobs", value: "1,248", change: "8.3% vs May 5 - May 11", direction: "up", tone: "green", icon: Briefcase },
  { label: "Total Users", value: "5,342", change: "10.7% vs May 5 - May 11", direction: "up", tone: "blue", icon: Users },
  { label: "Active Providers", value: "892", change: "9.1% vs May 5 - May 11", direction: "up", tone: "amber", icon: UserCheck },
  { label: "Avg. Rating", value: "4.6 / 5", change: "0.2 vs May 5 - May 11", direction: "up", tone: "red", icon: Star },
];

export const reportsRevenue = [
  { day: "May 12", thisPeriod: 4200, previous: 2500 },
  { day: "May 13", thisPeriod: 6200, previous: 4400 },
  { day: "May 14", thisPeriod: 3000, previous: 1900 },
  { day: "May 15", thisPeriod: 4100, previous: 2900 },
  { day: "May 16", thisPeriod: 5000, previous: 2400 },
  { day: "May 17", thisPeriod: 5800, previous: 4200 },
  { day: "May 18", thisPeriod: 4500, previous: 2700 },
];

export const reportsJobsTrend = [
  { day: "May 12", thisPeriod: 245, previous: 150 },
  { day: "May 13", thisPeriod: 270, previous: 168 },
  { day: "May 14", thisPeriod: 274, previous: 142 },
  { day: "May 15", thisPeriod: 258, previous: 146 },
  { day: "May 16", thisPeriod: 272, previous: 178 },
  { day: "May 17", thisPeriod: 260, previous: 152 },
  { day: "May 18", thisPeriod: 274, previous: 158 },
];

export const reportsCategoryRevenue = [
  { category: "Home Services", value: 8450 },
  { category: "Auto Services", value: 6240 },
  { category: "Repair & Maintenance", value: 4860 },
  { category: "Beauty & Wellness", value: 2980 },
  { category: "Delivery & Errands", value: 1720 },
  { category: "Others", value: 530 },
];

export const reportsJobStatus = [
  { name: "Completed", value: 642, percent: "51.4%", color: "#16A34A" },
  { name: "In Progress", value: 287, percent: "23.0%", color: "#2563EB" },
  { name: "Pending", value: 187, percent: "15.0%", color: "#F59E0B" },
  { name: "Cancelled", value: 82, percent: "6.6%", color: "#DC2626" },
  { name: "Rejected", value: 50, percent: "4.0%", color: "#9333EA" },
];

export const recentReports = [
  { name: "Revenue Summary Report", category: "Financial", generatedOn: "May 18, 2025 10:45 AM", generatedBy: "Admin", format: "PDF" },
  { name: "Jobs Performance Report", category: "Job", generatedOn: "May 18, 2025 10:30 AM", generatedBy: "Admin", format: "Excel" },
  { name: "User Growth Report", category: "User", generatedOn: "May 18, 2025 10:15 AM", generatedBy: "Admin", format: "PDF" },
  { name: "Provider Performance Report", category: "Provider", generatedOn: "May 18, 2025 10:00 AM", generatedBy: "Admin", format: "Excel" },
  { name: "Earnings Overview Report", category: "Financial", generatedOn: "May 18, 2025 09:45 AM", generatedBy: "Admin", format: "PDF" },
];

export const providerPerformance = [
  { provider: "Bright Auto Care", initials: "BAC", jobs: 48, revenue: "GHS 3,240", rating: 4.8 },
  { provider: "Speedy Mechanics", initials: "SM", jobs: 42, revenue: "GHS 2,780", rating: 4.7 },
  { provider: "QuickFix Services", initials: "QS", jobs: 36, revenue: "GHS 2,450", rating: 4.6 },
  { provider: "Reliable Pros", initials: "RP", jobs: 31, revenue: "GHS 1,980", rating: 4.6 },
  { provider: "Wheels & More", initials: "WM", jobs: 29, revenue: "GHS 1,720", rating: 4.5 },
];

export const platformOverview = [
  { label: "New Users", value: "842", change: "15.4%", tone: "blue", icon: UserPlus },
  { label: "Repeat Users", value: "2,341", change: "11.2%", tone: "blue", icon: RefreshCcw },
  { label: "New Providers", value: "112", change: "9.3%", tone: "blue", icon: Users },
  { label: "Provider Retention", value: "85.6%", change: "6.1%", tone: "green", icon: ShieldCheck },
  { label: "Job Completion Rate", value: "91.2%", change: "3.8%", tone: "green", icon: CheckCircle2 },
  { label: "Dispute Rate", value: "1.8%", change: "0.3%", tone: "red", icon: AlertTriangle, direction: "down" },
];

export const auditMetrics = [
  { label: "Total Events", value: "5,842", change: "12.5% vs May 5 - May 11", direction: "up", tone: "purple", icon: FileText },
  { label: "Unique Users", value: "142", change: "8.2% vs May 5 - May 11", direction: "up", tone: "green", icon: Users },
  { label: "Critical Events", value: "37", change: "15.6% vs May 5 - May 11", direction: "up", tone: "amber", icon: AlertTriangle },
  { label: "Failed Attempts", value: "89", change: "4.7% vs May 5 - May 11", direction: "down", tone: "red", icon: ShieldAlert },
];

export const auditLogs = [
  { time: "May 18, 2025\n10:45:32 AM", user: "Ama Serwaa", email: "ama@sherix.com", initials: "AM", role: "Admin", action: "Updated Provider Profile", resource: "Service Provider", resourceId: "SP-2548", ip: "102.89.45.12", status: "Success" },
  { time: "May 18, 2025\n10:32:18 AM", user: "Kofi Mensah", email: "kofi@sherix.com", initials: "KM", role: "Admin", action: "Approved Payout", resource: "Payout", resourceId: "PAYOUT-8791", ip: "197.210.33.45", status: "Success" },
  { time: "May 18, 2025\n10:12:05 AM", user: "Efua Wiafe", email: "efua@sherix.com", initials: "EW", role: "Support", action: "Updated Job Status", resource: "Job", resourceId: "JOB-12458", ip: "41.204.18.33", status: "Success" },
  { time: "May 18, 2025\n09:58:41 AM", user: "Bright Asare", email: "bright@sherix.com", initials: "BA", role: "Admin", action: "Deleted User", resource: "User", resourceId: "USER-8843", ip: "102.89.45.12", status: "Success" },
  { time: "May 18, 2025\n09:41:09 AM", user: "Nana Addo", email: "nana@sherix.com", initials: "NA", role: "Admin", action: "Changed Pricing", resource: "Service", resourceId: "SVC-4432", ip: "165.22.10.8", status: "Success" },
  { time: "May 18, 2025\n09:30:27 AM", user: "Kojo Dankwa", email: "kojo@sherix.com", initials: "KD", role: "Moderator", action: "Rejected Dispute", resource: "Dispute", resourceId: "DSP-1282", ip: "197.210.33.45", status: "Success" },
  { time: "May 18, 2025\n09:15:10 AM", user: "Abena Boateng", email: "abena@sherix.com", initials: "AB", role: "Support", action: "Sent Notification", resource: "Notification", resourceId: "NTF-6672", ip: "41.204.18.33", status: "Success" },
  { time: "May 18, 2025\n09:03:56 AM", user: "Joseph Osei", email: "joseph@sherix.com", initials: "JO", role: "Admin", action: "Failed Login Attempt", resource: "System", resourceId: "-", ip: "203.0.113.55", status: "Failed" },
  { time: "May 18, 2025\n08:47:33 AM", user: "System", email: "system@sherix.com", initials: "SY", role: "System", action: "Database Backup", resource: "System", resourceId: "-", ip: "10.0.0.12", status: "Success" },
  { time: "May 18, 2025\n08:30:11 AM", user: "Ama Serwaa", email: "ama@sherix.com", initials: "AM", role: "Admin", action: "Updated Platform Settings", resource: "System", resourceId: "-", ip: "102.89.45.12", status: "Success" },
];

export const auditActionBreakdown = [
  { name: "User Management", value: 1245, percent: "21.3%", color: "#2563EB" },
  { name: "Job Management", value: 1132, percent: "19.4%", color: "#0EA5E9" },
  { name: "Payment & Payouts", value: 987, percent: "16.9%", color: "#F59E0B" },
  { name: "Settings Changes", value: 764, percent: "13.1%", color: "#F97316" },
  { name: "Login / Auth", value: 592, percent: "10.1%", color: "#A21CAF" },
  { name: "Others", value: 1122, percent: "19.2%", color: "#7C3AED" },
];

export const auditSeverityBreakdown = [
  { label: "Informational", value: 3914, percent: "67.0%", color: "#2563EB", width: 86 },
  { label: "Warning", value: 1143, percent: "19.6%", color: "#FBBF24", width: 32 },
  { label: "Error", value: 548, percent: "9.4%", color: "#F97316", width: 18 },
  { label: "Critical", value: 237, percent: "4.0%", color: "#DC2626", width: 9 },
];

export const settingsSections = [
  { title: "General", subtitle: "Basic platform settings", icon: Settings },
  { title: "Notifications", subtitle: "System notification settings", icon: Bell },
  { title: "Payments", subtitle: "Payouts, fees & preferences", icon: CreditCard },
  { title: "Security", subtitle: "Security & access controls", icon: ShieldCheck },
  { title: "Email & SMS", subtitle: "Email and SMS configuration", icon: Mail },
  { title: "Appearance", subtitle: "Theme, branding & customizations", icon: Eye },
  { title: "Integrations", subtitle: "Third-party integrations", icon: RefreshCcw },
  { title: "System", subtitle: "System preferences & tools", icon: Settings },
];

export const quickLinks = [
  { title: "Clear Cache", subtitle: "Clear system cache", tone: "purple", icon: ClipboardCheck },
  { title: "System Backup", subtitle: "Create a system backup", tone: "green", icon: ShieldCheck },
  { title: "Activity Logs", subtitle: "View system activity logs", tone: "amber", icon: FileClock },
  { title: "System Status", subtitle: "Check system health", tone: "blue", icon: RefreshCcw },
];

export const systemInformation = [
  ["Platform Version", "v2.4.1"],
  ["Environment", "Production"],
  ["Server Time", "May 18, 2025 10:45 AM"],
  ["PHP Version", "8.2.10"],
  ["Database", "MySQL 8.0.32"],
  ["Cache Driver", "Redis"],
  ["Queue Driver", "Database"],
];
