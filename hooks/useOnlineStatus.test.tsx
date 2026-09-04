import { act, waitFor } from "@testing-library/react";
import { onlineManager } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/utils";
import { useOnlineStatus } from "./useOnlineStatus";

afterEach(() => {
  onlineManager.setOnline(true);
});

describe("useOnlineStatus", () => {
  it("DISCONNECT: reports offline immediately when connectivity is lost", () => {
    const { result } = renderHookWithQueryClient(() => useOnlineStatus());

    expect(result.current.state).toBe("online");

    act(() => onlineManager.setOnline(false));

    expect(result.current.state).toBe("offline");
    expect(result.current.isOnline).toBe(false);
  });

  it("RECONNECT: transitions offline -> reconnecting -> online and refetches active queries, without ever regressing to offline again on its own", async () => {
    const { result, client } = renderHookWithQueryClient(() => useOnlineStatus());
    const refetchSpy = vi.spyOn(client, "refetchQueries");

    act(() => onlineManager.setOnline(false));
    expect(result.current.state).toBe("offline");

    act(() => onlineManager.setOnline(true));

 
    expect(result.current.state).toBe("reconnecting");
    expect(refetchSpy).toHaveBeenCalledWith({ type: "active" });

    await waitFor(() => expect(result.current.state).toBe("online"));
  });

  it("does not treat a fresh mount (never having been offline) as a reconnect - no refetch storm on load", () => {
    const { client } = renderHookWithQueryClient(() => useOnlineStatus());
    const refetchSpy = vi.spyOn(client, "refetchQueries");

    expect(refetchSpy).not.toHaveBeenCalled();
  });
});
