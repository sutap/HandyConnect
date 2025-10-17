import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, LogOut, DollarSign, Clock, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Booking, Service, User, ProviderProfile } from "@shared/schema";
import { format } from "date-fns";

type BookingWithDetails = Booking & {
  customer: User;
  service: Service;
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: profile } = useQuery<ProviderProfile>({
    queryKey: ["/api/provider/profile"],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/provider/services"],
  });

  const { data: bookings } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/provider/bookings"],
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/bookings/${bookingId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/provider/bookings'] });
      toast({
        title: "Booking Updated",
        description: "The booking status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking.",
        variant: "destructive",
      });
    },
  });

  const pendingBookings = bookings?.filter(b => b.status === 'pending') || [];
  const acceptedBookings = bookings?.filter(b => b.status === 'accepted') || [];
  const completedBookings = bookings?.filter(b => b.status === 'completed') || [];

  const totalEarnings = completedBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Provider Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              asChild
              data-testid="button-logout"
            >
              <a href="/api/logout">
                <LogOut className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="text-2xl">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-muted-foreground mb-4">{profile?.bio}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.yearsExperience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">${totalEarnings.toFixed(2)} earned</span>
                </div>
              </div>
            </div>

            <Button onClick={() => setLocation('/provider/add-service')} data-testid="button-add-service">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Pending Requests</p>
                <p className="text-3xl font-bold">{pendingBookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-chart-3/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-chart-3" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Jobs</p>
                <p className="text-3xl font-bold">{acceptedBookings.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-chart-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings" data-testid="tab-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">My Services</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking) => (
                <Card key={booking.id} className="p-6" data-testid={`card-booking-${booking.id}`}>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{booking.service.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Customer: {booking.customer.firstName} {booking.customer.lastName}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            booking.status === 'completed' ? 'default' : 
                            booking.status === 'accepted' ? 'secondary' : 
                            'outline'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Date:</span> {format(new Date(booking.scheduledDate), 'PPP')}</p>
                        <p><span className="text-muted-foreground">Address:</span> {booking.address}</p>
                        {booking.notes && (
                          <p><span className="text-muted-foreground">Notes:</span> {booking.notes}</p>
                        )}
                        <p className="text-lg font-semibold text-primary">
                          ${booking.totalPrice}
                        </p>
                      </div>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="flex md:flex-col gap-2">
                        <Button
                          onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, status: 'accepted' })}
                          disabled={updateBookingMutation.isPending}
                          data-testid={`button-accept-${booking.id}`}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, status: 'cancelled' })}
                          disabled={updateBookingMutation.isPending}
                          data-testid={`button-decline-${booking.id}`}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {booking.status === 'accepted' && (
                      <Button
                        onClick={() => updateBookingMutation.mutate({ bookingId: booking.id, status: 'completed' })}
                        disabled={updateBookingMutation.isPending}
                        data-testid={`button-complete-${booking.id}`}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No bookings yet.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            {services && services.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-6" data-testid={`card-service-${service.id}`}>
                    <Badge variant="secondary" className="mb-3">{service.category}</Badge>
                    <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                    <p className="text-muted-foreground mb-4">{service.description}</p>
                    <p className="text-2xl font-bold text-primary">
                      ${service.pricePerHour}/hr
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No services added yet.</p>
                <Button onClick={() => setLocation('/provider/add-service')} data-testid="button-add-first-service">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Service
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
