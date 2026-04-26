import { db, deviceSettingsTable, sensorDataTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const POLL_INTERVAL_MS = 5000;
const DEVICE_ROW_ID = 1;

let pollTimer: ReturnType<typeof setInterval> | null = null;
let currentIp: string | null = null;

export async function fetchFromEsp32(ip: string) {
  const url = `http://${ip}/data`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${url}`);
    }

    const raw = await response.json() as Record<string, unknown>;

    const row = await db
      .insert(sensorDataTable)
      .values({
        temperature: Number(raw.temperature),
        humidity: Number(raw.humidity),
        soil_moisture: Number(raw.soil_moisture),
        light_level: Number(raw.light_level),
        nitrogen: Math.round(Number(raw.nitrogen)),
        phosphorus: Math.round(Number(raw.phosphorus)),
        potassium: Math.round(Number(raw.potassium)),
        latitude: Number(raw.latitude),
        longitude: Number(raw.longitude),
      })
      .returning();

    await db
      .update(deviceSettingsTable)
      .set({ last_polled_at: new Date(), last_error: null, connected: true })
      .where(eq(deviceSettingsTable.id, DEVICE_ROW_ID));

    return row[0];
  } catch (err: unknown) {
    clearTimeout(timeout);
    const message = err instanceof Error ? err.message : String(err);
    logger.warn({ ip, err: message }, "ESP32 poll failed");

    await db
      .update(deviceSettingsTable)
      .set({ last_error: message, connected: false })
      .where(eq(deviceSettingsTable.id, DEVICE_ROW_ID))
      .catch(() => {});

    throw err;
  }
}

export async function startPolling(ip: string) {
  stopPolling();
  currentIp = ip;

  const tick = async () => {
    if (!currentIp) return;
    try {
      await fetchFromEsp32(currentIp);
    } catch {
    }
  };

  await tick();
  pollTimer = setInterval(tick, POLL_INTERVAL_MS);
  logger.info({ ip }, "ESP32 auto-poll started");
}

export function stopPolling() {
  if (pollTimer !== null) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  currentIp = null;
  logger.info("ESP32 auto-poll stopped");
}

export async function ensureDeviceRow() {
  const [existing] = await db
    .select()
    .from(deviceSettingsTable)
    .where(eq(deviceSettingsTable.id, DEVICE_ROW_ID));

  if (!existing) {
    await db.insert(deviceSettingsTable).values({
      id: DEVICE_ROW_ID,
      ip: null,
      connected: false,
      last_polled_at: null,
      last_error: null,
    });
  } else if (existing.ip && existing.connected) {
    logger.info({ ip: existing.ip }, "Resuming polling on server restart");
    await startPolling(existing.ip);
  }
}
