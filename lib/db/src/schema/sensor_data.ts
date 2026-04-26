import { pgTable, serial, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorDataTable = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  temperature: real("temperature").notNull(),
  humidity: real("humidity").notNull(),
  soil_moisture: real("soil_moisture").notNull(),
  light_level: real("light_level").notNull(),
  nitrogen: integer("nitrogen").notNull(),
  phosphorus: integer("phosphorus").notNull(),
  potassium: integer("potassium").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertSensorDataSchema = createInsertSchema(sensorDataTable).omit({
  id: true,
  created_at: true,
});

export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SensorData = typeof sensorDataTable.$inferSelect;
