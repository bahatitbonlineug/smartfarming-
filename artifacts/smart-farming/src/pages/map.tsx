import { Layout } from "@/components/layout";
import { useGetLatestSensorData, getGetLatestSensorDataQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Signal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MapPage() {
  const { data: latestData, isLoading } = useGetLatestSensorData({
    query: { refetchInterval: 10000, queryKey: getGetLatestSensorDataQueryKey() }
  });

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">GPS Tracking</h2>
        <p className="text-muted-foreground mt-1">Live location of the mobile sensor node.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Signal className="h-5 w-5 text-primary" />
                Node Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Device ID</span>
                  <span className="font-mono font-medium">NODE-ESP-01</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2 text-primary font-medium">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                    </span>
                    Transmitting
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Fix</span>
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <span className="font-mono text-sm">
                      {latestData ? new Date(latestData.created_at).toLocaleTimeString() : "--:--:--"}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-blue-500" />
                Coordinates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-md border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Latitude</p>
                    <p className="text-2xl font-mono">{latestData?.latitude?.toFixed(6) || "N/A"}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-md border border-border/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Longitude</p>
                    <p className="text-2xl font-mono">{latestData?.longitude?.toFixed(6) || "N/A"}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-2 border-border/50 flex flex-col h-[500px] md:h-auto min-h-[500px]">
          <CardHeader>
            <CardTitle>Field Map</CardTitle>
            <CardDescription>Simulated view based on GPS coordinates</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-0 relative bg-muted/10 overflow-hidden">
            {/* A synthetic map visualization to match the aesthetic since we don't have a real map provider configured */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute h-[1px] w-full bg-primary/20 top-1/2"></div>
              <div className="absolute w-[1px] h-full bg-primary/20 left-1/2"></div>
              
              <div className="absolute h-[300px] w-[300px] rounded-full border border-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute h-[150px] w-[150px] rounded-full border border-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              
              {!isLoading && latestData && (
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/40"></div>
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 relative z-10 border-2 border-background">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-2 bg-background/90 backdrop-blur-sm border border-border px-3 py-1.5 rounded-md text-xs font-mono shadow-sm">
                    {latestData.latitude.toFixed(4)}, {latestData.longitude.toFixed(4)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono text-muted-foreground">
              <span>SCALE: 1:1000</span>
              <span>GRID: 24M</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
