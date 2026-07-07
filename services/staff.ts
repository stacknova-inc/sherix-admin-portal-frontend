import { api, assertApiId, unwrapData } from "@/lib/api";
import { StaffRole } from "@/lib/rbac";

import type {
  CreateStaffInput,
  StaffMember,
  StaffRoleDefinition,
  StaffStatus,
  UpdateStaffInput,
} from "@/types";

export type StaffStatusAction = "suspend" | "activate";

export const staffRoleDefinitions: StaffRoleDefinition[] = [
  { department: "Sherix Admin", role: StaffRole.SUPER_ADMIN, label: "Super Admin" },
  { department: "Human Resources", role: StaffRole.HR_ADMIN, label: "HR Admin" },
  { department: "Finance", role: StaffRole.FINANCE_ADMIN, label: "Finance Admin" },
  { department: "Customer Support", role: StaffRole.SUPPORT_ADMIN, label: "Support Admin" },
  { department: "Marketing", role: StaffRole.MARKETING_ADMIN, label: "Marketing Admin" },
  
];

function statusFromRecord(record: Record<string, unknown>): StaffStatus {
  if (typeof record.status === "string") {
    const status = record.status.toLowerCase();
    if (status.includes("suspend")) return "Suspended";
    if (status.includes("inactive") || status.includes("disabled")) return "Inactive";
    return "Active";
  }

  if (typeof record.isActive === "boolean") return record.isActive ? "Active" : "Suspended";
  return "Active";
}

function mapStaff(staff: unknown): StaffMember {
  const record = staff && typeof staff === "object" ? (staff as Record<string, unknown>) : {};
  const firstName = typeof record.firstName === "string" ? record.firstName : "";
  const lastName = typeof record.lastName === "string" ? record.lastName : "";
  const fullName =
    String(record.name ?? record.fullName ?? `${firstName} ${lastName}`.trim() ?? "").trim() ||
    "Unnamed staff";

  return {
    ...(record as unknown as StaffMember),
    _id: typeof record._id === "string" ? record._id : undefined,
    id: typeof record.id === "string" ? record.id : undefined,
    fullName,
    name: fullName,
    email: String(record.email ?? ""),
    phoneNumber: String(record.phoneNumber ?? record.phone ?? ""),
    department: String(record.department ?? ""),
    role: String(record.role ?? ""),
    status: statusFromRecord(record),
    isActive: typeof record.isActive === "boolean" ? record.isActive : statusFromRecord(record) === "Active",
    lastLogin: typeof record.lastLogin === "string" ? record.lastLogin : undefined,
    lastActivityAt:
      typeof record.lastActivityAt === "string"
        ? record.lastActivityAt
        : typeof record.updatedAt === "string"
          ? record.updatedAt
          : undefined,
  };
}

function createPayload(input: CreateStaffInput) {
  return {
    name: String(input.name ?? input.fullName ?? "").trim(),
    email: input.email.trim(),
    phoneNumber: input.phoneNumber.trim(),
    department: input.department,
    role: input.role,
    password: input.password,
    confirmPassword: input.confirmPassword,
  };
}

function updatePayload(input: UpdateStaffInput) {
  return {
    name: String(input.name ?? input.fullName ?? "").trim(),
    email: input.email?.trim(),
    phoneNumber: input.phoneNumber.trim(),
    department: input.department,
    role: input.role,
    isActive: input.isActive,
  };
}

export const staffApi = {
  async list() {
    const response = await api.get("/staff");
    const inner = response.data?.data;
    const staffArray: unknown[] = Array.isArray(inner?.staff)
      ? inner.staff
      : Array.isArray(inner)
        ? inner
        : [];
    return staffArray.map(mapStaff);
  },

  async get(id: string) {
    const staffId = assertApiId(id, "Staff");
    const staff = (await staffApi.list()).find(
      (member) => member.id === staffId || member._id === staffId,
    );
    if (!staff) throw new Error("Staff member was not found.");
    return staff;
  },

  async create(input: CreateStaffInput) {
    const response = await api.post("/staff/create", createPayload(input));
    return mapStaff(unwrapData<unknown>(response.data));
  },

  async update(id: string, input: UpdateStaffInput) {
    const staffId = assertApiId(id, "Staff");
    const response = await api.patch(`/staff/${staffId}`, updatePayload(input));
    return mapStaff(unwrapData<unknown>(response.data));
  },

  async setStatus(id: string, action: StaffStatusAction) {
    const current = await staffApi.get(id);
    return staffApi.update(id, {
      name: current.fullName,
      email: current.email,
      phoneNumber: current.phoneNumber,
      department: current.department,
      role: current.role,
      isActive: action === "activate",
    });
  },
};
