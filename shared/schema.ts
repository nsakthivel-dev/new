import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Crops master data
export const crops = pgTable("crops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  scientificName: text("scientific_name"),
  category: text("category").notNull(), // vegetables, cereals, fruits, pulses, cash_crops
  imageUrl: text("image_url"),
  description: text("description"),
});

// Diseases master data
export const diseases = pgTable("diseases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cropId: varchar("crop_id").references(() => crops.id),
  symptoms: text("symptoms").array(),
  causes: text("causes"),
  organicTreatment: text("organic_treatment"),
  chemicalTreatment: text("chemical_treatment"),
  prevention: text("prevention"),
  imageUrls: text("image_urls").array(),
  severity: text("severity"), // low, medium, high
});

// Diagnosis history
export const diagnoses = pgTable("diagnoses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  cropId: varchar("crop_id").references(() => crops.id),
  imageUrl: text("image_url"),
  symptoms: text("symptoms").array(),
  results: jsonb("results"), // Array of {disease, confidence, riskLevel}
  aiAnalysis: text("ai_analysis"),
  recommendations: text("recommendations"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Experts directory
export const experts = pgTable("experts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  specialization: text("specialization").array(),
  district: text("district"),
  languages: text("languages").array(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  avatarUrl: text("avatar_url"),
  verified: boolean("verified").default(false),
});

// Alerts and bulletins
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // pest_outbreak, weather, bulletin, scheme
  severity: text("severity"), // urgent, warning, info
  region: text("region"),
  cropIds: text("crop_ids").array(),
  publishedAt: timestamp("published_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Chat messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  metadata: jsonb("metadata"), // crop type, field size, context
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback and contact
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // contact, bug, feature
  name: text("name"),
  email: text("email"),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

// Content storage
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
});

export const insertDiseaseSchema = createInsertSchema(diseases).omit({
  id: true,
});

export const insertDiagnosisSchema = createInsertSchema(diagnoses).omit({
  id: true,
  createdAt: true,
});

export const insertExpertSchema = createInsertSchema(experts).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  publishedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;

export type Disease = typeof diseases.$inferSelect;
export type InsertDisease = z.infer<typeof insertDiseaseSchema>;

export type Diagnosis = typeof diagnoses.$inferSelect;
export type InsertDiagnosis = z.infer<typeof insertDiagnosisSchema>;

export type Expert = typeof experts.$inferSelect;
export type InsertExpert = z.infer<typeof insertExpertSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Content = typeof content.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;