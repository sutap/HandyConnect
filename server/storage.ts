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
        provider: {
          id: providerProfiles.id,
          userId: providerProfiles.userId,
          bio: providerProfiles.bio,
          phone: providerProfiles.phone,
          location: providerProfiles.location,
          yearsExperience: providerProfiles.yearsExperience,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          },
        },
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .orderBy(desc(services.createdAt));
    
    return result;
  }

  async getServiceById(id: string): Promise<any> {
    const [result] = await db
      .select({
        id: services.id,
        providerId: services.providerId,
        category: services.category,
        title: services.title,
        description: services.description,
        pricePerHour: services.pricePerHour,
        imageUrl: services.imageUrl,
        createdAt: services.createdAt,
        provider: {
          id: providerProfiles.id,
          userId: providerProfiles.userId,
          bio: providerProfiles.bio,
          phone: providerProfiles.phone,
          location: providerProfiles.location,
          yearsExperience: providerProfiles.yearsExperience,
          user: {
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          },
        },
      })
      .from(services)
      .innerJoin(providerProfiles, eq(services.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .where(eq(services.id, id));
    
    return result;
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
      .values(serviceData)
      .returning();
    return service;
  }

  // Booking operations
  async getBookingById(id: string): Promise<any> {
    const [result] = await db
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
        provider: {
          id: providerProfiles.id,
          userId: providerProfiles.userId,
          location: providerProfiles.location,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          },
        },
        service: {
          id: services.id,
          title: services.title,
          category: services.category,
        },
      })
      .from(bookings)
      .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.id, id));
    
    return result;
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
        provider: {
          id: providerProfiles.id,
          userId: providerProfiles.userId,
          location: providerProfiles.location,
          user: {
            id: users.id,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImageUrl: users.profileImageUrl,
          },
        },
        service: {
          id: services.id,
          title: services.title,
          category: services.category,
        },
      })
      .from(bookings)
      .innerJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
      .innerJoin(users, eq(providerProfiles.userId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.customerId, customerId))
      .orderBy(desc(bookings.createdAt));
    
    return result;
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
        customer: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        service: {
          id: services.id,
          title: services.title,
          category: services.category,
        },
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.customerId, users.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.providerId, providerId))
      .orderBy(desc(bookings.createdAt));
    
    return result;
  }

  async createBooking(bookingData: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(bookingData)
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
      .values(paymentData)
      .returning();
    return payment;
  }
}

export const storage = new DatabaseStorage();
