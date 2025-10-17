import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { length: 20 }).notNull().default('customer'), // 'customer' or 'provider'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Provider profiles - extended information for service providers
export const providerProfiles = pgTable("provider_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  bio: text("bio"),
  phone: varchar("phone", { length: 20 }),
  location: varchar("location"),
  yearsExperience: text("years_experience"),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories (plumbing, electrical, painting, etc.)
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  category: varchar("category", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bookings/Jobs
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  providerId: varchar("provider_id").notNull().references(() => providerProfiles.id, { onDelete: 'cascade' }),
  serviceId: varchar("service_id").notNull().references(() => services.id, { onDelete: 'cascade' }),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, accepted, completed, cancelled
  estimatedHours: decimal("estimated_hours", { precision: 4, scale: 1 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default('pending'), // pending, completed, failed, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  providerProfile: one(providerProfiles, {
    fields: [users.id],
    references: [providerProfiles.userId],
  }),
  bookingsAsCustomer: many(bookings, { relationName: 'customerBookings' }),
}));

export const providerProfilesRelations = relations(providerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [providerProfiles.userId],
    references: [users.id],
  }),
  services: many(services),
  bookings: many(bookings),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  provider: one(providerProfiles, {
    fields: [services.providerId],
    references: [providerProfiles.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: 'customerBookings',
  }),
  provider: one(providerProfiles, {
    fields: [bookings.providerId],
    references: [providerProfiles.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  payment: one(payments, {
    fields: [bookings.id],
    references: [payments.bookingId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
}));

// Zod schemas and types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertProviderProfileSchema = createInsertSchema(providerProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProviderProfile = z.infer<typeof insertProviderProfileSchema>;
export type ProviderProfile = typeof providerProfiles.$inferSelect;

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  pricePerHour: z.string().or(z.number()),
});
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  estimatedHours: z.string().or(z.number()).optional(),
  totalPrice: z.string().or(z.number()).optional(),
});
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.string().or(z.number()),
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
