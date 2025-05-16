/**
 * Types for the frontend
 * These include all the types needed for the application to function
 */
import { z } from "zod";

export interface Activity {
  id: number;
  actSrl: string;
  activityCode: string;
  activityType: string;
  activityName: string;
  isWithItems: boolean;
  financeEffect: string;
  active: boolean;
}

export interface SubActivity {
  id: number;
  parentId: number;
  itmSrl: number;
  itemCode: string;
  itemName: string;
  activityName: string;
  activityType: string;
  pricingMethod: string;
  active: boolean;
}

export interface ActivityWithSubActivities {
  activity: Activity;
  subActivities: SubActivity[];
}

export interface TransactionType {
  id: number;
  name: string;
  createdAt?: Date;
}

// Schemas for form validation - copied from shared schema
export const activitySchema = z.object({
  id: z.number().optional(),
  actSrl: z.string().min(1, "Serial number is required"),
  activityCode: z.string().min(1, "Activity code is required"),
  activityType: z.string().min(1, "Activity type is required"),
  activityName: z.string().min(1, "Activity name is required"),
  isWithItems: z.boolean().default(false),
  financeEffect: z.string().default("No"),
  active: z.boolean().default(true),
});

export const subActivitySchema = z.object({
  id: z.number().optional(),
  parentId: z.number().int().positive("Parent activity is required"),
  itmSrl: z.number().int().positive("Item serial is required"),
  itemCode: z.string().min(1, "Item code is required"),
  itemName: z.string().min(1, "Item name is required"),
  activityName: z.string().min(1, "Activity name is required"),
  activityType: z.string().min(1, "Activity type is required"),
  pricingMethod: z.string().min(1, "Pricing method is required"),
  active: z.boolean().default(true),
});

export const insertActivitySchema = activitySchema.omit({ id: true });
export const insertSubActivitySchema = subActivitySchema.omit({ id: true });

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertSubActivity = z.infer<typeof insertSubActivitySchema>;

// Transaction Type schema
export const transactionTypeSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Transaction name is required"),
  createdAt: z.date().optional(),
});

export const insertTransactionTypeSchema = transactionTypeSchema.omit({ id: true });
export type InsertTransactionType = z.infer<typeof insertTransactionTypeSchema>;
