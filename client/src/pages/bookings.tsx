import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLocation } from "wouter";
import type { Booking, Service, ProviderProfile, User } from "@shared/schema";
import { format } from "date-fns";

type BookingWithDetails = Booking & {
  provider: ProviderProfile & { user: User };
  service: Service;
};

export default function Bookings() {
  const [, setLocation] = useLocation();

  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'accepted':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-50 bg-background">
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
            <h1 className="text-2xl font-bold text-primary">My Bookings</h1>
          </div>
          
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
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6" data-testid={`card-booking-${booking.id}`}>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{booking.service.title}</h3>
                        <Badge className="mb-3">{booking.service.category}</Badge>
                      </div>
                      <Badge variant={getStatusColor(booking.status) as any}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.provider.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {booking.provider.user.firstName?.[0]}{booking.provider.user.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {booking.provider.user.firstName} {booking.provider.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{booking.provider.location}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">Date:</span>
                        <span className="font-medium">{format(new Date(booking.scheduledDate), 'PPP')}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-muted-foreground min-w-24">Address:</span>
                        <span>{booking.address}</span>
                      </div>
                      {booking.estimatedHours && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-24">Duration:</span>
                          <span>{booking.estimatedHours} hours</span>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="flex gap-2">
                          <span className="text-muted-foreground min-w-24">Notes:</span>
                          <span>{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end">
                    <p className="text-3xl font-bold text-primary">
                      ${booking.totalPrice}
                    </p>
                    
                    {booking.status === 'completed' && (
                      <Button 
                        onClick={() => setLocation(`/payment/${booking.id}`)}
                        data-testid={`button-pay-${booking.id}`}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No bookings yet.</p>
            <Button onClick={() => setLocation('/services')} data-testid="button-browse-services">
              Browse Services
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
