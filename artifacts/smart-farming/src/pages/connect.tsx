import { useState } from "react";
import { Layout } from "@/components/layout";
import {
  useGetDevice,
  useUpdateDevice,
  usePollDevice,
  useDisconnectDevice,
  getGetDeviceQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wifi,
  WifiOff,
  PlugZap,
  RefreshCw,
  Radio,
  CheckCircle,
  AlertTriangle,
  Unplug,
  Cpu,
  Signal,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Connect() {
  const [ipInput, setIpInput] = useState("");
  const queryClient = useQueryClient();

  const { data: device, isLoading } = useGetDevice({
    query: { refetchInterval: 3000, queryKey: getGetDeviceQueryKey() },
  });

  const updateDevice = useUpdateDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDeviceQueryKey() });
        setIpInput("");
      },
    },
  });

  const pollDevice = usePollDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDeviceQueryKey() });
      },
    },
  });

  const disconnectDevice = useDisconnectDevice({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetDeviceQueryKey() });
      },
    },
  });

  const handleConnect = () => {
    const ip = ipInput.trim();
    if (!ip) return;
    updateDevice.mutate({ data: { ip } });
  };

  const handlePoll = () => {
    pollDevice.mutate();
  };

  const handleDisconnect = () => {
    disconnectDevice.mutate();
  };

  const isConnected = device?.connected === true;
  const isConnecting = updateDevice.isPending;
  const isPolling = pollDevice.isPending;
  const isDisconnecting = disconnectDevice.isPending;

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">ESP32 Device Connection</h2>
        <p className="text-muted-foreground mt-1">
          Connect your ESP32 sensor node by entering its local IP address. The system will automatically fetch sensor data every 5 seconds.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connection Panel */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-primary" />
              Device Setup
            </CardTitle>
            <CardDescription>
              Enter the IP address shown on your ESP32 serial monitor or router DHCP table.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status badge */}
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    Connected — {device?.ip}
                  </Badge>
                ) : device?.ip ? (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 flex items-center gap-1.5">
                    <WifiOff className="h-3 w-3" />
                    Offline — {device.ip}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground flex items-center gap-1.5">
                    <WifiOff className="h-3 w-3" />
                    No device configured
                  </Badge>
                )}
              </div>
            )}

            {/* IP Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">ESP32 IP Address</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                    placeholder={device?.ip ?? "192.168.1.100"}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleConnect}
                  disabled={!ipInput.trim() || isConnecting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  {isConnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlugZap className="h-4 w-4" />
                  )}
                  {isConnecting ? "Connecting..." : "Connect"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The ESP32 must serve sensor JSON at{" "}
                <code className="font-mono bg-muted px-1 py-0.5 rounded text-xs border border-border">
                  http://&lt;IP&gt;/data
                </code>
              </p>
            </div>

            {/* Error display */}
            {device?.last_error && (
              <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-md">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Connection error</p>
                  <p className="text-xs text-destructive/80 mt-0.5 font-mono">{device.last_error}</p>
                </div>
              </div>
            )}

            {/* Last poll time */}
            {device?.last_polled_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                Last successful reading{" "}
                {formatDistanceToNow(new Date(device.last_polled_at), { addSuffix: true })}
              </div>
            )}

            {/* Action buttons */}
            {device?.ip && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  onClick={handlePoll}
                  disabled={isPolling}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border bg-background rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  {isPolling ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Signal className="h-3.5 w-3.5" />
                  )}
                  {isPolling ? "Polling..." : "Poll Now"}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-destructive/30 text-destructive bg-destructive/5 rounded-md hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  Disconnect
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ESP32 Firmware Guide */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wifi className="h-4 w-4 text-primary" />
              ESP32 Firmware Setup
            </CardTitle>
            <CardDescription>
              Your ESP32 must run a web server that serves sensor readings at <code className="font-mono">/data</code>. Copy this sketch:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted border border-border rounded-md p-4 overflow-x-auto leading-relaxed font-mono whitespace-pre text-foreground/80">
{`#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
// Add your sensor libraries here:
// #include <DHT.h>
// #include <TinyGPS++.h>

const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

WebServer server(80);

void handleData() {
  // Replace with real sensor readings:
  float temperature  = 26.5;  // DHT22
  float humidity     = 68.0;  // DHT22
  float soil_moisture = 380;  // Analog sensor
  float light_level  = 320;   // LDR/light sensor
  int   nitrogen     = 22;    // NPK sensor
  int   phosphorus   = 12;    // NPK sensor
  int   potassium    = 6;     // NPK sensor
  float latitude     = 0.3476; // GPS
  float longitude    = 32.5825;// GPS

  StaticJsonDocument<256> doc;
  doc["temperature"]   = temperature;
  doc["humidity"]      = humidity;
  doc["soil_moisture"] = soil_moisture;
  doc["light_level"]   = light_level;
  doc["nitrogen"]      = nitrogen;
  doc["phosphorus"]    = phosphorus;
  doc["potassium"]     = potassium;
  doc["latitude"]      = latitude;
  doc["longitude"]     = longitude;

  String json;
  serializeJson(doc, json);
  server.send(200, "application/json", json);
}

void setup() {
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  
  Serial.println("IP: " + WiFi.localIP().toString());
  
  server.on("/data", handleData);
  server.begin();
}

void loop() {
  server.handleClient();
}`}
            </pre>
            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-md">
              <p className="text-xs text-muted-foreground">
                After uploading, open the Serial Monitor to see the ESP32's IP address, then paste it above and click <strong>Connect</strong>. The dashboard will start receiving live readings automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
