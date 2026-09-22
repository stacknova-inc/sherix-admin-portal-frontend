import { describe, expect, it } from "vitest";
import { canViewAuditSensitiveDetails, isSensitiveAuditKey, maskAuditPayload, safeAuditEntityHref } from "./audit";

describe("isSensitiveAuditKey", () => {
  it("flags credential-shaped field names", () => {
    expect(isSensitiveAuditKey("password")).toBe(true);
    expect(isSensitiveAuditKey("newPassword")).toBe(true);
    expect(isSensitiveAuditKey("apiKey")).toBe(true);
    expect(isSensitiveAuditKey("cardNumber")).toBe(true);
    expect(isSensitiveAuditKey("bankAccountNumber")).toBe(true);
  });

  it("does not flag ordinary field names", () => {
    expect(isSensitiveAuditKey("status")).toBe(false);
    expect(isSensitiveAuditKey("title")).toBe(false);
    expect(isSensitiveAuditKey("amount")).toBe(false);
  });
});

describe("canViewAuditSensitiveDetails", () => {
  it("only allows SUPER_ADMIN and COMPLIANCE_ADMIN", () => {
    expect(canViewAuditSensitiveDetails("sherix_admin")).toBe(true);
    expect(canViewAuditSensitiveDetails("compliance_admin")).toBe(true);
    expect(canViewAuditSensitiveDetails("customer_support_admin")).toBe(false);
    expect(canViewAuditSensitiveDetails(null)).toBe(false);
  });
});

describe("maskAuditPayload", () => {
  it("always masks credential-like fields regardless of role", () => {
    const input = { password: "hunter2", title: "Password reset" };
    expect(maskAuditPayload(input, true)).toEqual({ password: "•••••• (hidden)", title: "Password reset" });
    expect(maskAuditPayload(input, false)).toEqual({ password: "•••••• (hidden)", title: "Password reset" });
  });

  it("masks restricted (non-credential) fields only for roles without elevated access", () => {
    const input = { evidenceUrl: "https://files/evidence.pdf", status: "open" };
    expect(maskAuditPayload(input, false)).toEqual({ evidenceUrl: "Restricted — requires elevated permission", status: "open" });
    expect(maskAuditPayload(input, true)).toEqual({ evidenceUrl: "https://files/evidence.pdf", status: "open" });
  });

  it("masks nested objects and arrays recursively", () => {
    const input = { account: { bankAccountNumber: "12345", name: "Jane" }, items: [{ apiKey: "abc" }] };
    expect(maskAuditPayload(input, true)).toEqual({ account: { bankAccountNumber: "•••••• (hidden)", name: "Jane" }, items: [{ apiKey: "•••••• (hidden)" }] });
  });
});

describe("safeAuditEntityHref", () => {
  it("returns undefined for an unrecognized entity type", () => {
    expect(safeAuditEntityHref("unknown_entity", "1", "sherix_admin")).toBeUndefined();
  });

  it("returns undefined when the role cannot access the destination route", () => {
    expect(safeAuditEntityHref("dispute", "d-1", "marketing_admin")).toBeUndefined();
  });

  it("builds a safe id-addressed link when the role has access", () => {
    expect(safeAuditEntityHref("dispute", "d-1", "sherix_admin")).toBe("/dashboard/disputes/d-1");
    expect(safeAuditEntityHref("service_request", "sr-1", "sherix_admin")).toBe("/dashboard/requests/sr-1");
  });

  it("builds a list-page link for entities without an id-addressed detail route", () => {
    expect(safeAuditEntityHref("commission", "c-1", "sherix_admin")).toBe("/dashboard/commissions");
  });
});
