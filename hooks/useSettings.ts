"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "@/services/settings";
import type { GeneralSettings } from "@/types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: settingsApi.get,
  });
}

export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GeneralSettings) => settingsApi.updateGeneral(input),
    onSuccess: (settings) => {
      queryClient.setQueryData(["settings"], settings);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}