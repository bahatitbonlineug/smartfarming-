import { useEffect, useState } from "react";
import { Layout } from "@/components/layout";
import { 
  useGetLatestSensorData, 
  useGetSensorHistory, 
  useGetSensorStats,
  getGetLatestSensorDataQueryKey
} from "@workspace/api-client-react";
import { 
  Droplets, 
  ThermometerSun, 
  Wind, 
  Sun,
  Beaker,
  AlertTriangle,
  Activity
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  getSoilMoistureStatus, 
  getTemperatureStatus, 
  getHumidityStatus, 
  getLightLevelStatus,
  getStatusColorClass
} from "@/lib/status";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [timeAgo, setTimeAgo] = useState("just now");

  const { data: latestData, isLoading: isLoadingLatest, error: latestError } = useGetLatestSensorData({
    query: {
      refetchInterval: 5000,
      queryKey: getGetLatestSensorDataQueryKey(),
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
    }
  });

  const noDataYet = (latestError as any)?.response?.status === 404;

  const { data: historyData, isLoading: isLoadingHistory } = useGetSensorHistory(
    { limit: 20 },
    { query: { refetchInterval: 15000, queryKey: ["dashboard-history", 20] } }
  );

  const { data: statsData, isLoading: isLoadingStats } = useGetSensorStats({
    query: { refetchInterval: 60000, queryKey: ["dashboard-stats"] }
  });

  useEffect(() => {
    if (!latestData?.created_at) return;
    
    const interval = setInterval(() => {
      setTimeAgo(formatDistanceToNow(new Date(latestData.created_at), { addSuffix: true }));
    }, 1000);
    
    setTimeAgo(formatDistanceToNow(new Date(latestData.created_at), { addSuffix: true }));
    
    return () => clearInterval(interval);
  }, [latestData?.created_at]);

  const renderMetricCard = (
    title: string, 
    value: string | number, 
    unit: string, 
    icon: React.ReactNode, 
    statusInfo?: { label: string, level: string },
    isLoading?: boolean
  ) => {
    return (
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/30">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          {statusInfo && (
            <Badge variant="outline" className={`${getStatusColorClass(statusInfo.level as any)} uppercase text-[10px] tracking-wider font-bold`}>
              {statusInfo.level === 'critical' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current animate-pulse inline-block" />}
              {statusInfo.label}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold tracking-tight font-mono">{value}</span>
              <span className="text-sm text-muted-foreground font-medium">{unit}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const chartData = historyData ? [...historyData].reverse().map(d => ({
    time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    temp: d.temperature,
    soil: d.soil_moisture
  })) : [];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Dashboard</h2>
          <p className="text-muted-foreground mt-1">Real-time agricultural metrics from field node ESP32-WROOM</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-md font-mono flex items-center gap-2 border border-border">
            <Activity className="h-4 w-4 text-primary" />
            Updated {timeAgo}
          </div>
        </div>
      </div>

      {noDataYet ? (
        <div className="bg-primary/5 border border-primary/20 rounded-md flex flex-col items-center justify-center py-16 mb-8 text-center">
          <Activity className="h-12 w-12 mb-4 text-primary animate-pulse" />
          <h3 className="text-lg font-semibold mb-2">Awaiting First Reading</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            No sensor data has been received yet. Power on your ESP32 and point it to:
          </p>
          <code className="mt-3 text-xs bg-muted px-4 py-2 rounded-md font-mono border border-border">
            POST {window.location.origin}/api/sensor-data
          </code>
          <p className="text-xs text-muted-foreground mt-3">Dashboard will update automatically once data arrives.</p>
        </div>
      ) : latestError ? (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-md flex flex-col items-center justify-center py-12 mb-8">
          <AlertTriangle className="h-10 w-10 mb-4 opacity-80" />
          <h3 className="text-lg font-semibold mb-1">Telemetry Offline</h3>
          <p className="text-sm opacity-80">Unable to reach the sensor node. Check network connection or ESP32 power.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {renderMetricCard(
            "Temperature", 
            latestData && latestData.temperature ? latestData.temperature.toFixed(1) : "--", 
            "°C", 
            <ThermometerSun className="h-4 w-4 text-orange-500" />,
            latestData ? getTemperatureStatus(latestData.temperature) : undefined,
            isLoadingLatest
          )}
          {renderMetricCard(
            "Soil Moisture", 
            latestData?.soil_moisture || "--", 
            "raw", 
            <Droplets className="h-4 w-4 text-blue-500" />,
            latestData ? getSoilMoistureStatus(latestData.soil_moisture) : undefined,
            isLoadingLatest
          )}
          {renderMetricCard(
            "Humidity", 
            latestData && latestData.humidity ? latestData.humidity.toFixed(1) : "--", 
            "%", 
            <Wind className="h-4 w-4 text-teal-500" />,
            latestData ? getHumidityStatus(latestData.humidity) : undefined,
            isLoadingLatest
          )}
          {renderMetricCard(
            "Light Level", 
            latestData?.light_level || "--", 
            "lux", 
            <Sun className="h-4 w-4 text-yellow-500" />,
            latestData ? getLightLevelStatus(latestData.light_level) : undefined,
            isLoadingLatest
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-7 mb-8">
        <Card className="col-span-7 lg:col-span-5 border-border/50">
          <CardHeader>
            <CardTitle>Environmental Trends</CardTitle>
            <CardDescription>Temperature and soil moisture history over the last 20 readings</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isLoadingHistory ? (
              <div className="w-full h-full flex items-center justify-center">
                <Skeleton className="w-full h-[250px]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickMargin={10} minTickGap={30} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `${value}°C`} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                    itemStyle={{ fontFamily: 'var(--font-mono)' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Temperature" />
                  <Line yAxisId="right" type="monotone" dataKey="soil" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Soil Moisture" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-7 lg:col-span-2 border-border/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5 text-emerald-600" />
              NPK Nutrients
            </CardTitle>
            <CardDescription>Current soil macronutrients</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLatest ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nitrogen (N)</p>
                    <p className="text-2xl font-bold font-mono mt-1">{latestData?.nitrogen || 0}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold">N</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phosphorus (P)</p>
                    <p className="text-2xl font-bold font-mono mt-1">{latestData?.phosphorus || 0}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 font-bold">P</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border/50">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Potassium (K)</p>
                    <p className="text-2xl font-bold font-mono mt-1">{latestData?.potassium || 0}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">K</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </Layout>
  );
}
