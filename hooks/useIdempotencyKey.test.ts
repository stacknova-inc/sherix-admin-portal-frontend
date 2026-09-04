import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIdempotencyKey } from "./useIdempotencyKey";

describe("useIdempotencyKey", () => {
  it("DUPLICATE MUTATION GUARD: reuses the same key across re-renders while resetKey is unchanged (a retry of the same attempt)", () => {
    const { result, rerender } = renderHook(({ resetKey }: { resetKey: unknown }) => useIdempotencyKey(resetKey), {
      initialProps: { resetKey: "dialog-open" },
    });

    const first = result.current;
    rerender({ resetKey: "dialog-open" });
    const second = result.current;

    expect(second).toBe(first);
  });

  it("mints a NEW key only when resetKey actually changes (a genuinely new attempt)", () => {
    const { result, rerender } = renderHook(({ resetKey }: { resetKey: unknown }) => useIdempotencyKey(resetKey), {
      initialProps: { resetKey: false },
    });

    const closed = result.current;
    rerender({ resetKey: true });
    const openedAgain = result.current;

    expect(openedAgain).not.toBe(closed);
  });
});
