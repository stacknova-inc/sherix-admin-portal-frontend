import { act } from "@testing-library/react";
import { onlineManager, useMutation } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeTestQueryClient, renderHookWithQueryClient } from "@/test/utils";
import { useAutoRefresh } from "./useAutoRefresh";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { configurable: true, get: () => state });
}

beforeEach(() => {
  vi.useFakeTimers();
  setVisibility("visible");
  onlineManager.setOnline(true);
});

afterEach(() => {
  vi.useRealTimers();
  setVisibility("visible");
  onlineManager.setOnline(true);
});

describe("useAutoRefresh", () => {
  it("STALE CACHE: invalidates the given query keys on each interval tick", () => {
    const client = makeTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    renderHookWithQueryClient(() => useAutoRefresh([["serviceRequests", "list"], ["serviceRequests", "stats"]], 1000), client);

    expect(invalidateSpy).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["serviceRequests", "list"], refetchType: "active" });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["serviceRequests", "stats"], refetchType: "active" });

    invalidateSpy.mockClear();
    act(() => vi.advanceTimersByTime(1000));
    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  it("DISCONNECT: skips a tick while offline instead of spending a doomed request", () => {
    const client = makeTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    onlineManager.setOnline(false);

    renderHookWithQueryClient(() => useAutoRefresh([["serviceRequests"]], 1000), client);
    act(() => vi.advanceTimersByTime(1000));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("skips a tick while the tab is hidden", () => {
    const client = makeTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    setVisibility("hidden");

    renderHookWithQueryClient(() => useAutoRefresh([["serviceRequests"]], 1000), client);
    act(() => vi.advanceTimersByTime(1000));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it("UNSAVED WORK GUARD: skips a tick while a mutation is pending, so a background refresh can't race an in-flight save", async () => {
    const client = makeTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");
    let resolveMutation: (() => void) | undefined;

    const { result } = renderHookWithQueryClient(
      () => {
        useAutoRefresh([["serviceRequests"]], 1000);
        return useMutation({
          mutationFn: () =>
            new Promise<void>((resolve) => {
              resolveMutation = resolve;
            }),
        });
      },
      client,
    );

    await act(async () => {
      result.current.mutate();
     
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.isPending).toBe(true);

    act(() => vi.advanceTimersByTime(1000));
    expect(invalidateSpy).not.toHaveBeenCalled();

    await act(async () => {
      resolveMutation?.();
      await vi.runOnlyPendingTimersAsync();
    });

    act(() => vi.advanceTimersByTime(1000));
    expect(invalidateSpy).toHaveBeenCalled();
  });

  it("does nothing when disabled", () => {
    const client = makeTestQueryClient();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    renderHookWithQueryClient(() => useAutoRefresh([["serviceRequests"]], 1000, false), client);
    act(() => vi.advanceTimersByTime(5000));

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
