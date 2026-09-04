import { describe, expect, it } from "vitest";
import { pickNewerServiceRequest } from "./service-request-helpers";
import type { ServiceRequest } from "@/types";

function sr(id: string, updatedAt: string, status: string): ServiceRequest {
  return { _id: id, updatedAt, status };
}

describe("pickNewerServiceRequest (out-of-order protection)", () => {
  it("keeps the incoming record when there is nothing cached yet", () => {
    const incoming = sr("1", "2024-01-01T00:01:00.000Z", "arrived");
    expect(pickNewerServiceRequest(undefined, incoming)).toBe(incoming);
  });

  it("REGRESSION GUARD: a late-arriving en_route response must not overwrite an already-cached arrived state", () => {
   
    const arrived = sr("123", "2024-01-01T00:05:00.000Z", "arrived");
    const staleEnRoute = sr("123", "2024-01-01T00:01:00.000Z", "en_route");

    const result = pickNewerServiceRequest(arrived, staleEnRoute);

    expect(result.status).toBe("arrived");
    expect(result).toBe(arrived);
  });

  it("accepts a genuinely newer incoming record", () => {
    const cached = sr("123", "2024-01-01T00:01:00.000Z", "en_route");
    const newer = sr("123", "2024-01-01T00:05:00.000Z", "arrived");

    const result = pickNewerServiceRequest(cached, newer);

    expect(result.status).toBe("arrived");
    expect(result).toBe(newer);
  });

  it("trusts the incoming record when timestamps are equal (normal refetch of unchanged data)", () => {
    const cached = sr("123", "2024-01-01T00:01:00.000Z", "en_route");
    const incoming = sr("123", "2024-01-01T00:01:00.000Z", "en_route");

    expect(pickNewerServiceRequest(cached, incoming)).toBe(incoming);
  });

  it("falls back to trusting the incoming record when updatedAt is missing or unparseable", () => {
    const cached: ServiceRequest = { _id: "123", status: "arrived" };
    const incoming: ServiceRequest = { _id: "123", status: "en_route" };

    expect(pickNewerServiceRequest(cached, incoming)).toBe(incoming);
  });
});
