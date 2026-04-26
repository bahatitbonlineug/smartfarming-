import { Router } from "express";
import { db, sensorDataTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import {
  PostSensorDataBody,
  GetSensorHistoryQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.post("/sensor-data", async (req, res) => {
  const parse = PostSensorDataBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const data = parse.data;

  const [row] = await db
    .insert(sensorDataTable)
    .values({
      temperature: data.temperature,
      humidity: data.humidity,
      soil_moisture: data.soil_moisture,
      light_level: data.light_level,
      nitrogen: data.nitrogen,
      phosphorus: data.phosphorus,
      potassium: data.potassium,
      latitude: data.latitude,
      longitude: data.longitude,
    })
    .returning();

  res.status(201).json(row);
});

router.get("/sensor-data", async (req, res) => {
  const [row] = await db
    .select()
    .from(sensorDataTable)
    .orderBy(desc(sensorDataTable.created_at))
    .limit(1);

  if (!row) {
    res.status(404).json({ error: "No sensor data found" });
    return;
  }

  res.json(row);
});

router.get("/sensor-data/history", async (req, res) => {
  const parse = GetSensorHistoryQueryParams.safeParse(req.query);
  const limit = parse.success && parse.data.limit != null ? parse.data.limit : 20;

  const rows = await db
    .select()
    .from(sensorDataTable)
    .orderBy(desc(sensorDataTable.created_at))
    .limit(limit);

  res.json(rows.reverse());
});

router.get("/sensor-data/stats", async (req, res) => {
  const [stats] = await db
    .select({
      temp_min: sql<number>`MIN(${sensorDataTable.temperature})`,
      temp_max: sql<number>`MAX(${sensorDataTable.temperature})`,
      temp_avg: sql<number>`AVG(${sensorDataTable.temperature})`,
      hum_min: sql<number>`MIN(${sensorDataTable.humidity})`,
      hum_max: sql<number>`MAX(${sensorDataTable.humidity})`,
      hum_avg: sql<number>`AVG(${sensorDataTable.humidity})`,
      soil_min: sql<number>`MIN(${sensorDataTable.soil_moisture})`,
      soil_max: sql<number>`MAX(${sensorDataTable.soil_moisture})`,
      soil_avg: sql<number>`AVG(${sensorDataTable.soil_moisture})`,
      light_min: sql<number>`MIN(${sensorDataTable.light_level})`,
      light_max: sql<number>`MAX(${sensorDataTable.light_level})`,
      light_avg: sql<number>`AVG(${sensorDataTable.light_level})`,
      total_readings: sql<number>`COUNT(*)`,
      last_reading_at: sql<string | null>`MAX(${sensorDataTable.created_at})`,
    })
    .from(sensorDataTable);

  const round = (v: number | null) => (v != null ? Math.round(v * 100) / 100 : null);

  res.json({
    temperature: {
      min: round(stats.temp_min),
      max: round(stats.temp_max),
      avg: round(stats.temp_avg),
    },
    humidity: {
      min: round(stats.hum_min),
      max: round(stats.hum_max),
      avg: round(stats.hum_avg),
    },
    soil_moisture: {
      min: round(stats.soil_min),
      max: round(stats.soil_max),
      avg: round(stats.soil_avg),
    },
    light_level: {
      min: round(stats.light_min),
      max: round(stats.light_max),
      avg: round(stats.light_avg),
    },
    total_readings: Number(stats.total_readings),
    last_reading_at: stats.last_reading_at ?? null,
  });
});

export default router;
