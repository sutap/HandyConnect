import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { insertServiceSchema } from "@shared/schema";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

const serviceFormSchema = insertServiceSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  pricePerHour: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
});

type ServiceFormData = z.infer<typeof serviceFormSchema>;

const CATEGORIES = ["Plumbing", "Electrical", "Painting", "Carpentry", "HVAC", "Cleaning"];

export default function AddService() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { register, handleSubmit, control, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      pricePerHour: "",
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return await apiRequest('POST', '/api/services', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/services'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services'] });
      toast({
        title: "Service Created",
        description: "Your service has been added successfully!",
      });
      setLocation('/provider/dashboard');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ServiceFormData) => {
    createServiceMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/provider/dashboard')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Add New Service</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="category">Service Category *</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="mt-2" data-testid="select-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Professional Plumbing Repairs"
                className="mt-2"
                data-testid="input-title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what you offer, your expertise, and what customers can expect..."
                className="mt-2 min-h-32"
                data-testid="input-description"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="pricePerHour">Price per Hour ($) *</Label>
              <Input
                id="pricePerHour"
                type="number"
                step="0.01"
                placeholder="50.00"
                className="mt-2"
                data-testid="input-price"
                {...register("pricePerHour")}
              />
              {errors.pricePerHour && (
                <p className="text-sm text-destructive mt-1">{errors.pricePerHour.message}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setLocation('/provider/dashboard')}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createServiceMutation.isPending}
                data-testid="button-submit"
              >
                {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
