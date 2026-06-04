import type {
  CreateStaffInput,
  StaffAuditAction,
  StaffAuditLog,
  StaffMember,
  StaffNotification,
  StaffRoleDefinition,
  StaffStatus,
  UpdateStaffInput,
} from "@/types";

export type StaffStatusAction = "suspend" | "activate" | "deactivate";

export const staffRoleDefinitions: StaffRoleDefinition[] = [
  { department: "Finance", role: "financeAdmin", label: "Finance Admin" },
  { department: "Customer Support", role: "supportAdmin", label: "Support Admin" },
  { department: "Operations", role: "operationsAdmin", label: "Operations Admin" },
  { department: "Compliance", role: "complianceAdmin", label: "Compliance Admin" },
  { department: "Marketing", role: "marketingAdmin", label: "Marketing Admin" },
  { department: "Technical Support", role: "techAdmin", label: "Technical Support Admin" },
  { department: "Human Resources", role: "hrAdmin", label: "Human Resources Admin" },
  { department: "Business Development", role: "businessAdmin", label: "Business Development Admin" },
];

const now = new Date("2026-06-02T18:30:00.000Z");

function daysAgo(days: number) {
  const value = new Date(now);
  value.setDate(value.getDate() - days);
  return value.toISOString();
}

function roleForDepartment(department: string) {
  return staffRoleDefinitions.find((definition) => definition.department === department) ?? staffRoleDefinitions[0];
}

function makeStaff(id: string, fullName: string, email: string, phoneNumber: string, department: string, status: StaffStatus, createdDaysAgo: number, loginDaysAgo?: number): StaffMember {
  const definition = roleForDepartment(department);
  return {
    id,
    _id: id,
    fullName,
    email,
    phoneNumber,
    department,
    role: definition.role,
    status,
    createdAt: daysAgo(createdDaysAgo),
    updatedAt: daysAgo(Math.max(1, createdDaysAgo - 2)),
    lastLogin: loginDaysAgo === undefined ? undefined : daysAgo(loginDaysAgo),
    lastActivityAt: loginDaysAgo === undefined ? daysAgo(createdDaysAgo) : daysAgo(Math.max(0, loginDaysAgo - 1)),
  };
}

let staffMembers: StaffMember[] = [
  makeStaff("staff-001", "Amina Bello", "amina.bello@sherix.com", "+234 801 221 4567", "Finance", "Active", 96, 1),
  makeStaff("staff-002", "Daniel Mensah", "daniel.mensah@sherix.com", "+233 24 401 2190", "Customer Support", "Active", 81, 0),
  makeStaff("staff-003", "Nora Okafor", "nora.okafor@sherix.com", "+234 803 902 3341", "Operations", "Suspended", 64, 12),
  makeStaff("staff-004", "Kwame Boateng", "kwame.boateng@sherix.com", "+233 20 772 8842", "Compliance", "Inactive", 48, 30),
  makeStaff("staff-005", "Maya Chen", "maya.chen@sherix.com", "+1 415 201 4438", "Marketing", "Pending Invitation", 5),
  makeStaff("staff-006", "Leo Martins", "leo.martins@sherix.com", "+44 7700 900182", "Technical Support", "Active", 22, 2),
  makeStaff("staff-007", "Grace Adeyemi", "grace.adeyemi@sherix.com", "+234 805 112 7788", "Human Resources", "Active", 35, 4),
  makeStaff("staff-008", "Priya Shah", "priya.shah@sherix.com", "+1 646 209 1200", "Business Development", "Active", 17, 3),
];

let auditLogs: StaffAuditLog[] = [
  { id: "audit-001", staffId: "staff-003", actionType: "Status changes", performedBy: "Sherix Super Admin", timestamp: daysAgo(2), note: "Nora Okafor was suspended pending review." },
  { id: "audit-002", staffId: "staff-005", actionType: "Staff creation", performedBy: "Sherix Super Admin", timestamp: daysAgo(5), note: "Maya Chen was invited to Marketing." },
  { id: "audit-003", staffId: "staff-001", actionType: "Password resets", performedBy: "Sherix Super Admin", timestamp: daysAgo(7), note: "Password reset link sent to Amina Bello." },
];

let notifications: StaffNotification[] = [
  { id: "note-001", staffId: "staff-005", type: "Account created", sentTo: "maya.chen@sherix.com", timestamp: daysAgo(5), message: "Staff invitation sent." },
  { id: "note-002", staffId: "staff-003", type: "Account suspended", sentTo: "nora.okafor@sherix.com", timestamp: daysAgo(2), message: "Account suspension notification sent." },
];

function cloneStaff(staff: StaffMember) {
  return { ...staff };
}

function recordAudit(staffId: string, actionType: StaffAuditAction, note: string) {
  auditLogs = [
    {
      id: `audit-${Date.now()}`,
      staffId,
      actionType,
      performedBy: "Sherix Super Admin",
      timestamp: new Date().toISOString(),
      note,
    },
    ...auditLogs,
  ];
}

function recordNotification(staff: StaffMember, type: StaffNotification["type"], message: string) {
  notifications = [
    {
      id: `note-${Date.now()}`,
      staffId: staff.id ?? staff._id ?? "",
      type,
      sentTo: staff.email,
      timestamp: new Date().toISOString(),
      message,
    },
    ...notifications,
  ];
}

function validateStaff(input: CreateStaffInput) {
  if (!input.fullName.trim()) throw new Error("Full name is required.");
  if (!/^\S+@\S+\.\S+$/.test(input.email)) throw new Error("Enter a valid email address.");
  if (!input.phoneNumber.trim()) throw new Error("Phone number is required.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (input.password !== input.confirmPassword) throw new Error("Passwords do not match.");
  if (staffMembers.some((staff) => !staff.deletedAt && staff.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("A staff member with this email already exists.");
  }
}

export const staffApi = {
  async list() {
    return staffMembers.filter((staff) => !staff.deletedAt).map(cloneStaff);
  },
  async get(id: string) {
    const staff = staffMembers.find((member) => (member.id === id || member._id === id) && !member.deletedAt);
    if (!staff) throw new Error("Staff member was not found.");
    return cloneStaff(staff);
  },
  async create(input: CreateStaffInput) {
    validateStaff(input);
    const definition = staffRoleDefinitions.find((item) => item.department === input.department && item.role === input.role) ?? roleForDepartment(input.department);
    const staff: StaffMember = {
      id: `staff-${Date.now()}`,
      _id: `staff-${Date.now()}`,
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phoneNumber: input.phoneNumber.trim(),
      department: definition.department,
      role: definition.role,
      status: "Pending Invitation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    staffMembers = [staff, ...staffMembers];
    recordAudit(staff.id ?? "", "Staff creation", `${staff.fullName} was created as ${definition.label}.`);
    recordNotification(staff, "Account created", "Account invitation sent.");
    return cloneStaff(staff);
  },
  async update(id: string, input: UpdateStaffInput) {
    let updated: StaffMember | undefined;
    staffMembers = staffMembers.map((staff) => {
      if (staff.id !== id && staff._id !== id) return staff;
      const previousRole = staff.role;
      const definition = staffRoleDefinitions.find((item) => item.department === input.department && item.role === input.role) ?? roleForDepartment(input.department);
      updated = {
        ...staff,
        fullName: input.fullName.trim(),
        phoneNumber: input.phoneNumber.trim(),
        department: definition.department,
        role: definition.role,
        updatedAt: new Date().toISOString(),
      };
      if (previousRole !== definition.role) {
        recordAudit(staff.id ?? "", "Role changes", `${updated.fullName} role changed from ${previousRole} to ${definition.role}.`);
        recordNotification(updated, "Role changed", "Role change notification sent.");
      } else {
        recordAudit(staff.id ?? "", "Staff updates", `${updated.fullName} profile details were updated.`);
      }
      return updated;
    });
    if (!updated) throw new Error("Staff member was not found.");
    return cloneStaff(updated);
  },
  async setStatus(id: string, action: StaffStatusAction) {
    const statusByAction: Record<StaffStatusAction, StaffStatus> = {
      suspend: "Suspended",
      activate: "Active",
      deactivate: "Inactive",
    };
    let updated: StaffMember | undefined;
    staffMembers = staffMembers.map((staff) => {
      if (staff.id !== id && staff._id !== id) return staff;
      updated = { ...staff, status: statusByAction[action], updatedAt: new Date().toISOString() };
      recordAudit(staff.id ?? "", "Status changes", `${staff.fullName} status changed to ${updated.status}.`);
      if (action === "suspend") recordNotification(updated, "Account suspended", "Account suspension notification sent.");
      if (action === "activate") recordNotification(updated, "Account activated", "Account activation notification sent.");
      return updated;
    });
    if (!updated) throw new Error("Staff member was not found.");
    return cloneStaff(updated);
  },
  async resetPassword(id: string) {
    const staff = await staffApi.get(id);
    recordAudit(staff.id ?? "", "Password resets", `Password reset link sent to ${staff.fullName}.`);
    recordNotification(staff, "Password reset", "Password reset link sent.");
    return { resetLink: `https://admin.sherix.com/reset-password/${staff.id}`, staff };
  },
  async softDelete(id: string) {
    let deleted: StaffMember | undefined;
    staffMembers = staffMembers.map((staff) => {
      if (staff.id !== id && staff._id !== id) return staff;
      deleted = { ...staff, status: "Inactive", deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      recordAudit(staff.id ?? "", "Deletions", `${staff.fullName} was soft deleted.`);
      return deleted;
    });
    if (!deleted) throw new Error("Staff member was not found.");
    return cloneStaff(deleted);
  },
  async auditLogs(staffId?: string) {
    return auditLogs.filter((log) => !staffId || log.staffId === staffId).map((log) => ({ ...log }));
  },
  async notifications(staffId?: string) {
    return notifications.filter((notification) => !staffId || notification.staffId === staffId).map((notification) => ({ ...notification }));
  },
};
