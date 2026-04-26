import { Router } from "express";
import { db, deviceSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { fetchFromEsp32, startPolling, stopPolling } from "../lib/device-poller";
import { UpdateDeviceBody } from "@workspace/api-zod";

const router = Router();
const DEVICE_ROW_ID = 1;

async function getDeviceRow() {
  const [row] = await db
    .select()
    .from(deviceSettingsTable)
    .where(eq(deviceSettingsTable.id, DEVICE_ROW_ID));
  return row ?? { id: DEVICE_ROW_ID, ip: null, connected: false, last_polled_at: null, last_error: null, updated_at: new Date() };
}

router.get("/device", async (req, res) => {
  const row = await getDeviceRow();
  res.json({
    ip: row.ip,
    connected: row.connected,
    last_polled_at: row.last_polled_at,
    last_error: row.last_error,
  });
});

router.put("/device", async (req, res) => {
  const parse = UpdateDeviceBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.message });
    return;
  }

  const { ip } = parse.data;

  await db
    .insert(deviceSettingsTable)
    .values({ id: DEVICE_ROW_ID, ip, connected: false, last_error: null })
    .onConflictDoUpdate({
      target: deviceSettingsTable.id,
      set: { ip, connected: false, last_error: null, updated_at: new Date() },
    });

  startPolling(ip).catch(() => {});

  const row = await getDeviceRow();
  res.json({
    ip: row.ip,
    connected: row.connected,
    last_polled_at: row.last_polled_at,
    last_error: row.last_error,
  });
});

router.post("/device/poll", async (req, res) => {
  const row = await getDeviceRow();
  if (!row.ip) {
    res.status(400).json({ error: "No ESP32 device configured. Please set the IP address first." });
    return;
  }

  try {
    const data = await fetchFromEsp32(row.ip);
    res.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: `Failed to reach ESP32: ${message}` });
  }
});

router.post("/device/disconnect", async (req, res) => {
  stopPolling();

  await db
    .update(deviceSettingsTable)
    .set({ ip: null, connected: false, last_error: null, updated_at: new Date() })
    .where(eq(deviceSettingsTable.id, DEVICE_ROW_ID))
    .catch(() => {});

  res.json({ ip: null, connected: false, last_polled_at: null, last_error: null });
});

export default router;
