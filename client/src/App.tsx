import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Onboarding from "@/pages/onboarding";
import ProviderSetup from "@/pages/provider-setup";
import ProviderDashboard from "@/pages/provider-dashboard";
import AddService from "@/pages/add-service";
import Services from "@/pages/services";
import Booking from "@/pages/booking";
import Bookings from "@/pages/bookings";
import Payment from "@/pages/payment";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/provider/setup" component={ProviderSetup} />
          <Route path="/provider/dashboard" component={ProviderDashboard} />
          <Route path="/provider/add-service" component={AddService} />
          <Route path="/services" component={Services} />
          <Route path="/booking/:id" component={Booking} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/payment/:id" component={Payment} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
