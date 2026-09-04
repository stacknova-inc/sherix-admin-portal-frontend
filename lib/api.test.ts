import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { describeMutationError, generateIdempotencyKey, getMutationOutcomeMessage, isApiConflict, isUnknownOutcome } from "./api";

function networkError(overrides: Partial<AxiosError> = {}) {
  const error = new AxiosError("Network Error", undefined, undefined, {});
  Object.assign(error, overrides);
  return error;
}

function responseError(status: number, data: unknown = {}) {
  const error = new AxiosError("Request failed", undefined, undefined, {}, {
    status,
    data,
    statusText: "",
    headers: {},
    config: {} as never,
  });
  return error;
}

describe("isUnknownOutcome", () => {
  it("UNKNOWN OUTCOME: a request that left the client but got no response is unknown, not failed", () => {
  
    const error = networkError();
    expect(isUnknownOutcome(error)).toBe(true);
  });

  it("treats a timeout (ECONNABORTED) as unknown", () => {
    const error = networkError({ code: "ECONNABORTED", request: undefined });
    expect(isUnknownOutcome(error)).toBe(true);
  });

  it("is NOT unknown when the server actually responded, even with an error status", () => {
    const error = responseError(400, { message: "Invalid input" });
    expect(isUnknownOutcome(error)).toBe(false);
  });

  it("is not unknown for a non-axios error", () => {
    expect(isUnknownOutcome(new Error("boom"))).toBe(false);
  });
});

describe("isApiConflict", () => {
  it("recognizes a 409 response as a conflict", () => {
    expect(isApiConflict(responseError(409))).toBe(true);
  });

  it("does not treat other statuses as a conflict", () => {
    expect(isApiConflict(responseError(400))).toBe(false);
    expect(isApiConflict(responseError(500))).toBe(false);
  });
});

describe("getMutationOutcomeMessage", () => {
  it("UNKNOWN OUTCOME UX: never claims the action failed when the outcome is genuinely unknown", () => {
    const { message, outcome } = getMutationOutcomeMessage(networkError(), "Cancelling this service request");

    expect(outcome).toBe("unknown");
    expect(message.toLowerCase()).not.toContain("failed");
    expect(message).toContain("could not be confirmed");
  });

  it("reports a definitive failure message for a real server rejection", () => {
    const { message, outcome } = getMutationOutcomeMessage(responseError(422, { message: "Reason is required" }), "Cancelling this service request");

    expect(outcome).toBe("failed");
    expect(message).toBe("Reason is required");
  });
});

describe("describeMutationError", () => {
  it("prioritizes the conflict message over unknown/failed classification", () => {
    const message = describeMutationError(responseError(409), "Updating this record");
    expect(message).toContain("changed by another administrator");
  });

  it("falls through to unknown-outcome messaging for a dropped connection", () => {
    const message = describeMutationError(networkError(), "Updating this record");
    expect(message).toContain("could not be confirmed");
  });
});

describe("generateIdempotencyKey", () => {
  it("RETRY SAFETY: produces a value, and repeated calls produce DIFFERENT keys (caller must reuse one key per attempt, not call this per retry)", () => {
    const a = generateIdempotencyKey();
    const b = generateIdempotencyKey();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toEqual(b);
  });
});
