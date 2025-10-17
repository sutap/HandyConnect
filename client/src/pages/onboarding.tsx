import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Wrench, User as UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<'customer' | 'provider' | null>(null);

  const updateUserTypeMutation = useMutation({
    mutationFn: async (userType: 'customer' | 'provider') => {
      return await apiRequest('POST', '/api/user/type', { userType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      if (selectedType === 'provider') {
        setLocation('/provider/setup');
      } else {
        setLocation('/services');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account type. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelection = (type: 'customer' | 'provider') => {
    setSelectedType(type);
    updateUserTypeMutation.mutate(type);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">HandyConnect</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to HandyConnect!</h2>
          <p className="text-xl text-muted-foreground">
            Let's get you started. Are you looking to hire a handyman or offer your services?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className={`p-8 cursor-pointer hover-elevate active-elevate-2 transition-all ${
              selectedType === 'customer' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelection('customer')}
            data-testid="card-customer"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">I Need Services</h3>
              <p className="text-muted-foreground mb-6">
                Find and book trusted handymen for your home or business repair needs.
              </p>
              <Button 
                className="w-full"
                disabled={updateUserTypeMutation.isPending}
                data-testid="button-customer"
              >
                {updateUserTypeMutation.isPending && selectedType === 'customer' ? 'Setting up...' : 'Continue as Customer'}
              </Button>
            </div>
          </Card>

          <Card 
            className={`p-8 cursor-pointer hover-elevate active-elevate-2 transition-all ${
              selectedType === 'provider' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelection('provider')}
            data-testid="card-provider"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">I Offer Services</h3>
              <p className="text-muted-foreground mb-6">
                Become a provider and connect with customers who need your expertise.
              </p>
              <Button 
                className="w-full"
                disabled={updateUserTypeMutation.isPending}
                data-testid="button-provider"
              >
                {updateUserTypeMutation.isPending && selectedType === 'provider' ? 'Setting up...' : 'Continue as Provider'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
