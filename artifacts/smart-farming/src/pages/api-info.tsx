import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Code, FileJson } from "lucide-react";

export default function ApiInfo() {
  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">API Integrations</h2>
        <p className="text-muted-foreground mt-1">Documentation for ESP32 hardware integration.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Ingestion Endpoint
            </CardTitle>
            <CardDescription>Configure your ESP32 to POST data to this endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md border border-border font-mono text-sm mb-6 flex items-center justify-between">
              <div>
                <span className="text-primary font-bold mr-4">POST</span>
                <span className="text-foreground">/api/sensor-data</span>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Request Payload (JSON)
            </h3>
            
            <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto font-mono text-sm leading-relaxed border border-border/50">
<pre><code>{`{
  "temperature": 24.5,    // Float: Celsius (-40 to 80)
  "humidity": 45.2,       // Float: Percentage (0-100)
  "soil_moisture": 350,   // Integer: Raw ADC value
  "light_level": 420,     // Integer: Lux or raw value
  "nitrogen": 120,        // Integer: NPK value
  "phosphorus": 45,       // Integer: NPK value
  "potassium": 80,        // Integer: NPK value
  "latitude": 34.0522,    // Float: GPS coordinate
  "longitude": -118.2437  // Float: GPS coordinate
}`}</code></pre>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-500" />
              Arduino / ESP32 Example
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 text-zinc-50 p-4 rounded-md overflow-x-auto font-mono text-sm leading-relaxed border border-border/50">
<pre><code>{`#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverName = "https://your-domain.com/api/sensor-data";

void sendData() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    
    // Construct JSON payload
    String httpRequestData = "{\"temperature\":24.5,\"humidity\":45.2," 
                             "\"soil_moisture\":350,\"light_level\":420,"
                             "\"nitrogen\":120,\"phosphorus\":45,"
                             "\"potassium\":80,\"latitude\":34.0522,"
                             "\"longitude\":-118.2437}";
                             
    int httpResponseCode = http.POST(httpRequestData);
    
    if (httpResponseCode > 0) {
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error code: ");
      Serial.println(httpResponseCode);
    }
    http.end();
  }
}`}</code></pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
