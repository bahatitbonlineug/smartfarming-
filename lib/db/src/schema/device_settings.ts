import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const deviceSettingsTable = pgTable("device_settings", {
  id: serial("id").primaryKey(),
  ip: text("ip"),
  connected: boolean("connected").notNull().default(false),
  last_polled_at: timestamp("last_polled_at", { withTimezone: true }),
  last_error: text("last_error"),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DeviceSetting = typeof deviceSettingsTable.$inferSelect;
