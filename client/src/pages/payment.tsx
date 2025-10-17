import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft } from "lucide-react";
import type { Booking, Service, ProviderProfile, User } from "@shared/schema";
import { format } from "date-fns";

type BookingWithDetails = Booking & {
  provider: ProviderProfile & { user: User };
  service: Service;
};

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

function CheckoutForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/bookings`,
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your payment!",
      });
      setLocation('/bookings');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        className="w-full"
        disabled={!stripe || isProcessing}
        data-testid="button-submit-payment"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

export default function Payment() {
  const params = useParams();
  const bookingId = params.id;
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");

  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ["/api/bookings", bookingId],
    enabled: !!bookingId,
  });

  useEffect(() => {
    if (booking && !clientSecret) {
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: parseFloat(booking.totalPrice || "0"),
        bookingId: booking.id 
      })
        .then((data: any) => {
          setClientSecret(data.clientSecret);
        })
        .catch(() => {
          // Stripe not configured - skip payment
          setLocation('/bookings');
        });
    }
  }, [booking, clientSecret]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    );
  }

  // If Stripe is not configured, show message
  if (!stripePromise || !import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/bookings')}
                data-testid="button-back"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-primary">Payment</h1>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Payment System Not Configured</h2>
            <p className="text-muted-foreground mb-6">
              Stripe payment integration is not yet configured. Please contact support to enable payments.
            </p>
            <Button onClick={() => setLocation('/bookings')} data-testid="button-back-to-bookings">
              Back to Bookings
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
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
              onClick={() => setLocation('/bookings')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Complete Payment</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Summary */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Service</p>
                <p className="font-medium">{booking.service.title}</p>
                <Badge variant="secondary" className="mt-1">{booking.service.category}</Badge>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Provider</p>
                <p className="font-medium">
                  {booking.provider.user.firstName} {booking.provider.user.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(booking.scheduledDate), 'PPP')}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{booking.estimatedHours} hours</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-3xl font-bold text-primary">${booking.totalPrice}</span>
              </div>
            </div>
          </Card>

          {/* Payment Form */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="text-xl font-semibold mb-6">Payment Information</h3>
            
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm bookingId={booking.id} />
            </Elements>
          </Card>
        </div>
      </div>
    </div>
  );
}
