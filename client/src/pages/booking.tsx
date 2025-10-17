import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertBookingSchema } from "@shared/schema";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, CalendarIcon, MapPin } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import type { Service, ProviderProfile, User } from "@shared/schema";

type ServiceWithProvider = Service & {
  provider: ProviderProfile & { user: User };
};

const bookingFormSchema = insertBookingSchema.extend({
  scheduledDate: z.date({ required_error: "Please select a date" }),
  estimatedHours: z.string().min(1, "Estimated hours required"),
  address: z.string().min(5, "Address is required"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function Booking() {
  const params = useParams();
  const serviceId = params.id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const { data: service, isLoading } = useQuery<ServiceWithProvider>({
    queryKey: ["/api/services", serviceId],
    enabled: !!serviceId,
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      address: "",
      notes: "",
      estimatedHours: "1",
    },
  });

  const estimatedHours = watch("estimatedHours");
  const totalPrice = service ? (parseFloat(service.pricePerHour) * parseFloat(estimatedHours || "0")).toFixed(2) : "0.00";

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      return await apiRequest('POST', '/api/bookings', {
        ...data,
        serviceId,
        providerId: service?.providerId,
        totalPrice,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Booking Created",
        description: "Your booking request has been sent to the provider!",
      });
      setLocation('/bookings');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Service not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/services')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Book Service</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Details */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <Badge variant="secondary" className="mb-4">{service.category}</Badge>
            <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
            <p className="text-muted-foreground mb-6">{service.description}</p>

            {/* Provider Info */}
            <div className="border-t pt-6">
              <p className="text-sm text-muted-foreground mb-3">Provider</p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={service.provider.user.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {service.provider.user.firstName?.[0]}{service.provider.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {service.provider.user.firstName} {service.provider.user.lastName}
                  </p>
                  {service.provider.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{service.provider.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{service.provider.yearsExperience}</p>
            </div>

            {/* Price */}
            <div className="border-t mt-6 pt-6">
              <p className="text-3xl font-bold text-primary">
                ${service.pricePerHour}
                <span className="text-base text-muted-foreground font-normal">/hour</span>
              </p>
            </div>
          </Card>

          {/* Booking Form */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-semibold mb-6">Booking Details</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="scheduledDate">Select Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                      data-testid="button-date-picker"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        if (date) setValue("scheduledDate", date);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.scheduledDate && (
                  <p className="text-sm text-destructive mt-1">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours *</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="2"
                  className="mt-2"
                  data-testid="input-hours"
                  {...register("estimatedHours")}
                />
                {errors.estimatedHours && (
                  <p className="text-sm text-destructive mt-1">{errors.estimatedHours.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Service Address *</Label>
                <Input
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  className="mt-2"
                  data-testid="input-address"
                  {...register("address")}
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requirements or details..."
                  className="mt-2"
                  data-testid="input-notes"
                  {...register("notes")}
                />
              </div>

              {/* Price Summary */}
              <Card className="p-4 bg-muted">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Rate:</span>
                  <span>${service.pricePerHour}/hour</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Hours:</span>
                  <span>{estimatedHours || 0}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">${totalPrice}</span>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation('/services')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createBookingMutation.isPending}
                  data-testid="button-submit"
                >
                  {createBookingMutation.isPending ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
