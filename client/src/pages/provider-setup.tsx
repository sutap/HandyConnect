import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertProviderProfileSchema } from "@shared/schema";
import { ThemeToggle } from "@/components/ThemeToggle";
import { z } from "zod";

const profileFormSchema = insertProviderProfileSchema.extend({
  bio: z.string().min(20, "Bio must be at least 20 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  location: z.string().min(3, "Please enter your location"),
  yearsExperience: z.string().min(1, "Please enter your years of experience"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function ProviderSetup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
      phone: "",
      location: "",
      yearsExperience: "",
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return await apiRequest('POST', '/api/provider/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/profile'] });
      toast({
        title: "Profile Created",
        description: "Your provider profile has been created successfully!",
      });
      setLocation('/provider/dashboard');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    createProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">HandyConnect</h1>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Complete Your Provider Profile</h2>
          <p className="text-muted-foreground">
            Tell customers about your skills and experience to start receiving job requests.
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="bio">Professional Bio *</Label>
              <Textarea
                id="bio"
                placeholder="Describe your skills, experience, and what makes you great at what you do..."
                className="mt-2 min-h-32"
                data-testid="input-bio"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="mt-2"
                  data-testid="input-phone"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="location">Service Area *</Label>
                <Input
                  id="location"
                  placeholder="City, State"
                  className="mt-2"
                  data-testid="input-location"
                  {...register("location")}
                />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="yearsExperience">Years of Experience *</Label>
              <Input
                id="yearsExperience"
                placeholder="e.g., 5 years"
                className="mt-2"
                data-testid="input-experience"
                {...register("yearsExperience")}
              />
              {errors.yearsExperience && (
                <p className="text-sm text-destructive mt-1">{errors.yearsExperience.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={createProfileMutation.isPending}
              data-testid="button-create-profile"
            >
              {createProfileMutation.isPending ? 'Creating Profile...' : 'Create Profile'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
