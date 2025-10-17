import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProviderProfileSchema, 
  insertServiceSchema, 
  insertBookingSchema,
  insertPaymentSchema,
} from "@shared/schema";
import Stripe from "stripe";

// Initialize Stripe if available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-11-20.acacia" })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User type update
  app.post('/api/user/type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;
      
      if (!userType || !['customer', 'provider'].includes(userType)) {
        return res.status(400).json({ message: "Invalid user type" });
      }

      const user = await storage.updateUserType(userId, userType);
      res.json(user);
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ message: "Failed to update user type" });
    }
  });

  // Provider profile routes
  app.get('/api/provider/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProviderProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching provider profile:", error);
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  app.post('/api/provider/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertProviderProfileSchema.parse({
        ...req.body,
        userId,
      });

      const profile = await storage.createProviderProfile(validatedData);
      res.json(profile);
    } catch (error: any) {
      console.error("Error creating provider profile:", error);
      res.status(400).json({ message: error.message || "Failed to create provider profile" });
    }
  });

  // Service routes
  app.get('/api/services', async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get('/api/services/:id', async (req, res) => {
    try {
      const service = await storage.getServiceById(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.get('/api/provider/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProviderProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      const services = await storage.getProviderServices(profile.id);
      res.json(services);
    } catch (error) {
      console.error("Error fetching provider services:", error);
      res.status(500).json({ message: "Failed to fetch provider services" });
    }
  });

  app.post('/api/services', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProviderProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      // Remove any client-provided providerId and use authenticated user's profile
      const { providerId, ...serviceData } = req.body;
      
      const validatedData = insertServiceSchema.parse({
        ...serviceData,
        providerId: profile.id, // Always use authenticated user's provider ID
      });

      const service = await storage.createService(validatedData);
      res.json(service);
    } catch (error: any) {
      console.error("Error creating service:", error);
      res.status(400).json({ message: error.message || "Failed to create service" });
    }
  });

  // Booking routes - Customer bookings only
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only allow customers to access this endpoint
      // Providers should use /api/provider/bookings
      if (user.userType === 'provider') {
        return res.status(403).json({ message: "Providers should use /api/provider/bookings" });
      }

      const bookings = await storage.getCustomerBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const booking = await storage.getBookingById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify the user is either the customer or the provider for this booking
      const isCustomer = booking.customerId === userId;
      const profile = await storage.getProviderProfile(userId);
      const isProvider = profile && booking.providerId === profile.id;

      if (!isCustomer && !isProvider) {
        return res.status(403).json({ message: "Unauthorized to view this booking" });
      }

      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  app.get('/api/provider/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProviderProfile(userId);
      if (!profile) {
        return res.status(404).json({ message: "Provider profile not found" });
      }

      const bookings = await storage.getProviderBookings(profile.id);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Remove any client-provided customerId and providerId
      const { customerId, providerId, ...bookingData } = req.body;
      
      // Verify the service exists and get the provider from it
      const service = await storage.getServiceById(bookingData.serviceId);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }

      // Derive providerId from the service (server-side, not client-provided)
      const serviceProviderId = service.providerId;
      
      const validatedData = insertBookingSchema.parse({
        ...bookingData,
        customerId: userId, // Always use authenticated user's ID
        providerId: serviceProviderId, // Always derive from the service
      });

      const booking = await storage.createBooking(validatedData);
      res.json(booking);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.patch('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { status } = req.body;
      const userId = req.user.claims.sub;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      // Verify the booking exists
      const existingBooking = await storage.getBookingById(req.params.id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Verify the user is the provider for this booking
      const profile = await storage.getProviderProfile(userId);
      if (!profile || existingBooking.providerId !== profile.id) {
        return res.status(403).json({ message: "Unauthorized to update this booking" });
      }

      const booking = await storage.updateBookingStatus(req.params.id, status);
      res.json(booking);
    } catch (error: any) {
      console.error("Error updating booking:", error);
      res.status(400).json({ message: error.message || "Failed to update booking" });
    }
  });

  // Stripe payment route for one-time payments
  // NOTE: Production apps should implement Stripe webhooks to handle payment.succeeded events
  // and update payment status accordingly. This MVP creates the payment intent but status
  // updates would need webhook implementation for production use.
  app.post("/api/create-payment-intent", isAuthenticated, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ message: "Payment system not configured" });
      }

      const { amount, bookingId } = req.body;
      const userId = req.user.claims.sub;

      // Verify the booking exists and belongs to the authenticated user
      const booking = await storage.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      if (booking.customerId !== userId) {
        return res.status(403).json({ message: "Unauthorized to pay for this booking" });
      }

      // Use the booking's totalPrice instead of trusting client amount
      const bookingAmount = parseFloat(booking.totalPrice);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(bookingAmount * 100), // Convert to cents
        currency: "usd",
        metadata: { 
          bookingId,
          customerId: userId,
        },
      });

      // Create payment record with server-verified data
      await storage.createPayment({
        bookingId,
        amount: bookingAmount.toString(),
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Error creating payment intent:", error);
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
