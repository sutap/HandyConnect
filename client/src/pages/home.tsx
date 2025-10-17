import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import type { User, ProviderProfile } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: providerProfile } = useQuery<ProviderProfile>({
    queryKey: ["/api/provider/profile"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      // Check if user is a provider or needs to complete profile
      if (user.userType === 'provider' && providerProfile) {
        setLocation('/provider/dashboard');
      } else if (user.userType === 'provider' && !providerProfile) {
        setLocation('/provider/setup');
      } else if (user.userType === 'customer') {
        setLocation('/services');
      } else {
        // New user, let them choose their role
        setLocation('/onboarding');
      }
    }
  }, [user, providerProfile, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
    </div>
  );
}
