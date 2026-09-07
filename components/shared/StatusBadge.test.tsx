import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders a plain string status normally", () => {
    render(<StatusBadge status="Completed" />);
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("formats a snake_case Service Request status", () => {
    render(<StatusBadge status="price_update_pending" />);
    expect(screen.getByText("Price Update Pending")).toBeInTheDocument();
  });

  it("REGRESSION (D-1): does not throw when status is a non-string value (e.g. an unexpectedly nested API field)", () => {
   
    expect(() => render(<StatusBadge status={{ value: "approved" }} />)).not.toThrow();
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("does not crash on null/undefined status", () => {
 
    expect(() => render(<StatusBadge status={null} />)).not.toThrow();
  });
});
