import {
  users,
  providerProfiles,
  services,
  bookings,
  payments,
  type User,
  type UpsertUser,
  type ProviderProfile,
  type InsertProviderProfile,
  type Service,
  type InsertService,
  type Booking,
  type InsertBooking,
  type Payment,
  type InsertPayment,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserType(userId: string, userType: string): Promise<User>;
  
  // Provider profile operations
  getProviderProfile(userId: string): Promise<ProviderProfile | undefined>;
  getProviderProfileById(id: string): Promise<ProviderProfile | undefined>;
  createProviderProfile(profile: InsertProviderProfile): Promise<ProviderProfile>;
  
  // Service operations
  getAllServices(): Promise<any[]>;
  getServiceById(id: string): Promise<any>;
  getProviderServices(providerId: string): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  
  // Booking operations
  getBookingById(id: string): Promise<any>;
  getCustomerBookings(customerId: string): Promise<any[]>;
  getProviderBookings(providerId: string): Promise<any[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(bookingId: string, status: string): Promise<Booking>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserType(userId: string, userType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Provider profile operations
  async getProviderProfile(userId: string): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, userId));
    return profile;
  }

  async getProviderProfileById(id: string): Promise<ProviderProfile | undefined> {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, id));
    return profile;
  }

  async createProviderProfile(profileData: InsertProviderProfile): Promise<ProviderProfile> {
    const [profile] = await db
      .insert(providerProfiles)
      .values(profileData)
      .returning();
    return profile;
  }

  // Service operations
  async getAllServices(): Promise<any[]> {
    const result = await db
      .select({
        id: services.id,
        providerId: services.providerId,
        category: services.category,
        title: services.title,
        description: services.description,
        pricePerHour: services.pricePerHour,
        imageUrl: services.imageUrl,
        createdAt: services.createdAt,
        providerProfileId: providerProfiles.id,
        providerUserId: providerProfiles.userId,
        providerBio: providerProfiles.bio,
        providerPhone: providerProfiles.phone,
        providerLocation: providerProfiles.location,
        providerYearsExperience: providerProfiles.yearsExperience,
        providerUserEmail: users.email,
        providerUserFirstName: users.firstName,
        providerUserLastName: users.lastName,
        providerUserProfileImageUrl: users.profileImageUrl,
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .orderBy(desc(services.createdAt));
    
    // Transform flat result to nested structure
    return result.map(row => ({
      id: row.id,
      providerId: row.providerId,
      category: row.category,
      title: row.title,
      description: row.description,
      pricePerHour: row.pricePerHour,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
      provider: {
        id: row.providerProfileId,
        userId: row.providerUserId,
        bio: row.providerBio,
        phone: row.providerPhone,
        location: row.providerLocation,
        yearsExperience: row.providerYearsExperience,
        user: {
          id: row.providerUserId,
          email: row.providerUserEmail,
          firstName: row.providerUserFirstName,
          lastName: row.providerUserLastName,
          profileImageUrl: row.providerUserProfileImageUrl,
        },
      },
    }));
  }

  async getServiceById(id: string): Promise<any> {
    const [row] = await db
      .select({
        id: services.id,
        providerId: services.providerId,
        category: services.category,
        title: services.title,
        description: services.description,
        pricePerHour: services.pricePerHour,
        imageUrl: services.imageUrl,
        createdAt: services.createdAt,
        providerProfileId: providerProfiles.id,
        providerUserId: providerProfiles.userId,
        providerBio: providerProfiles.bio,
        providerPhone: providerProfiles.phone,
        providerLocation: providerProfiles.location,
        providerYearsExperience: providerProfiles.yearsExperience,
        providerUserEmail: users.email,
        providerUserFirstName: users.firstName,
        providerUserLastName: users.lastName,
        providerUserProfileImageUrl: users.profileImageUrl,
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(eq(services.id, id));
    
    if (!row) return undefined;
    
    // Transform flat result to nested structure
    return {
      id: row.id,
      providerId: row.providerId,
      category: row.category,
      title: row.title,
      description: row.description,
      pricePerHour: row.pricePerHour,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
      provider: {
        id: row.providerProfileId,
        userId: row.providerUserId,
        bio: row.providerBio,
        phone: row.providerPhone,
        location: row.providerLocation,
        yearsExperience: row.providerYearsExperience,
        user: {
          id: row.providerUserId,
          email: row.providerUserEmail,
          firstName: row.providerUserFirstName,
          lastName: row.providerUserLastName,
          profileImageUrl: row.providerUserProfileImageUrl,
        },
      },
    };
  }

  async getProviderServices(providerId: string): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.providerId, providerId))
      .orderBy(desc(services.createdAt));
  }

  async createService(serviceData: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values([{
        ...serviceData,
        pricePerHour: String(serviceData.pricePerHour),
      }])
      .returning();
    return service;
  }

  // Booking operations
  async getBookingById(id: string): Promise<any> {
    const [row] = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        providerId: bookings.providerId,
        serviceId: bookings.serviceId,
        scheduledDate: bookings.scheduledDate,
        status: bookings.status,
        estimatedHours: bookings.estimatedHours,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        address: bookings.address,
        createdAt: bookings.createdAt,
        providerProfileId: providerProfiles.id,
        providerUserId: providerProfiles.userId,
        providerLocation: providerProfiles.location,
        providerUserFirstName: users.firstName,
        providerUserLastName: users.lastName,
        providerUserProfileImageUrl: users.profileImageUrl,
        serviceTitle: services.title,
        serviceCategory: services.category,
      })
      .from(bookings)
      .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, id));
    
    if (!row) return undefined;
    
    return {
      id: row.id,
      customerId: row.customerId,
      providerId: row.providerId,
      serviceId: row.serviceId,
      scheduledDate: row.scheduledDate,
      status: row.status,
      estimatedHours: row.estimatedHours,
      totalPrice: row.totalPrice,
      notes: row.notes,
      address: row.address,
      createdAt: row.createdAt,
      provider: {
        id: row.providerProfileId,
        userId: row.providerUserId,
        location: row.providerLocation,
        user: {
          id: row.providerUserId,
          firstName: row.providerUserFirstName,
          lastName: row.providerUserLastName,
          profileImageUrl: row.providerUserProfileImageUrl,
        },
      },
      service: {
        id: row.serviceId,
        title: row.serviceTitle,
        category: row.serviceCategory,
      },
    };
  }

  async getCustomerBookings(customerId: string): Promise<any[]> {
    const result = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        providerId: bookings.providerId,
        serviceId: bookings.serviceId,
        scheduledDate: bookings.scheduledDate,
        status: bookings.status,
        estimatedHours: bookings.estimatedHours,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        address: bookings.address,
        createdAt: bookings.createdAt,
        providerProfileId: providerProfiles.id,
        providerUserId: providerProfiles.userId,
        providerLocation: providerProfiles.location,
        providerUserFirstName: users.firstName,
        providerUserLastName: users.lastName,
        providerUserProfileImageUrl: users.profileImageUrl,
        serviceTitle: services.title,
        serviceCategory: services.category,
      })
      .from(bookings)
      .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));
    
    return result.map(row => ({
      id: row.id,
      customerId: row.customerId,
      providerId: row.providerId,
      serviceId: row.serviceId,
      scheduledDate: row.scheduledDate,
      status: row.status,
      estimatedHours: row.estimatedHours,
      totalPrice: row.totalPrice,
      notes: row.notes,
      address: row.address,
      createdAt: row.createdAt,
      provider: {
        id: row.providerProfileId,
        userId: row.providerUserId,
        location: row.providerLocation,
        user: {
          id: row.providerUserId,
          firstName: row.providerUserFirstName,
          lastName: row.providerUserLastName,
          profileImageUrl: row.providerUserProfileImageUrl,
        },
      },
      service: {
        id: row.serviceId,
        title: row.serviceTitle,
        category: row.serviceCategory,
      },
    }));
  }

  async getProviderBookings(providerId: string): Promise<any[]> {
    const result = await db
      .select({
        id: bookings.id,
        customerId: bookings.customerId,
        providerId: bookings.providerId,
        serviceId: bookings.serviceId,
        scheduledDate: bookings.scheduledDate,
        status: bookings.status,
        estimatedHours: bookings.estimatedHours,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        address: bookings.address,
        createdAt: bookings.createdAt,
        customerFirstName: users.firstName,
        customerLastName: users.lastName,
        customerEmail: users.email,
        serviceTitle: services.title,
        serviceCategory: services.category,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customerId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.providerId, providerId))
      .orderBy(desc(bookings.createdAt));
    
    return result.map(row => ({
      id: row.id,
      customerId: row.customerId,
      providerId: row.providerId,
      serviceId: row.serviceId,
      scheduledDate: row.scheduledDate,
      status: row.status,
      estimatedHours: row.estimatedHours,
      totalPrice: row.totalPrice,
      notes: row.notes,
      address: row.address,
      createdAt: row.createdAt,
      customer: {
        id: row.customerId,
        firstName: row.customerFirstName,
        lastName: row.customerLastName,
        email: row.customerEmail,
      },
      service: {
        id: row.serviceId,
        title: row.serviceTitle,
        category: row.serviceCategory,
      },
    }));
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values([{
        ...bookingData,
        estimatedHours: bookingData.estimatedHours ? String(bookingData.estimatedHours) : undefined,
        totalPrice: bookingData.totalPrice ? String(bookingData.totalPrice) : undefined,
      }])
      .returning();
    return booking;
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
      .returning();
    return booking;
  }

  // Payment operations
  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db
      .insert(payments)
      .values([{
        ...paymentData,
        amount: String(paymentData.amount),
      }])
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
