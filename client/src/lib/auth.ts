import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  email?: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  return {
    user: user as User | null,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}

export function loginWithDiscord() {
  // Redirect to Discord OAuth
  window.location.href = "/api/auth/discord";
}

export function logout() {
  // Redirect to logout endpoint
  window.location.href = "/api/auth/logout";
}
