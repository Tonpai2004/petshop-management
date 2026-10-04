import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityKeys } from "@/features/activity/hooks/use-activity";
import { teamApi } from "../api/team.api";
import type { CreateMemberPayload } from "../types";

export const teamKeys = {
  all: ["team"] as const,
};

export function useTeam(enabled: boolean) {
  return useQuery({ queryKey: teamKeys.all, queryFn: teamApi.list, enabled });
}

function useRefreshTeam() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: teamKeys.all }),
      queryClient.invalidateQueries({ queryKey: activityKeys.all }),
    ]);
}

export function useCreateMember() {
  const refresh = useRefreshTeam();
  return useMutation({
    mutationFn: (payload: CreateMemberPayload) => teamApi.create(payload),
    onSuccess: refresh,
  });
}

export function useSetMemberActive() {
  const refresh = useRefreshTeam();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      teamApi.setActive(id, isActive),
    onSuccess: refresh,
  });
}

export function useResetMemberPassword() {
  const refresh = useRefreshTeam();
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      teamApi.resetPassword(id, password),
    onSuccess: refresh,
  });
}
