import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull(), // "host-to-guest" or "guest-to-host"
  status: text("status").notNull(), // "published", "pending", etc.
  channel: text("channel").notNull(), // "hostaway", "airbnb", "booking.com", "direct", etc.
  rating: integer("rating"),
  publicReview: text("public_review"),
  reviewCategory: jsonb("review_category").$type<Array<{category: string, rating: number}>>(),
  submittedAt: timestamp("submitted_at").notNull(),
  guestName: text("guest_name").notNull(),
  listingName: text("listing_name").notNull(),
  listingId: varchar("listing_id"), // Normalized listing identifier
  approved: boolean("approved").default(false),
  approvedAt: timestamp("approved_at"),
  approvedBy: varchar("approved_by"),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  averageRating: integer("average_rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  approved: true,
  approvedAt: true,
  approvedBy: true,
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  averageRating: true,
  reviewCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

// Filter schemas for API
export const reviewFiltersSchema = z.object({
  property: z.string().optional(),
  rating: z.string().optional(),
  categories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['all', 'approved', 'pending']).optional(),
  channel: z.string().optional(),
  type: z.string().optional(),
  search: z.string().optional(),
});

export type ReviewFilters = z.infer<typeof reviewFiltersSchema>;
