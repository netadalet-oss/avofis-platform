"use client";

import { useAuthContext } from "@/components/providers/AuthProvider";

export function useUser() {
  const { user, session, loading } = useAuthContext();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
  };
}
