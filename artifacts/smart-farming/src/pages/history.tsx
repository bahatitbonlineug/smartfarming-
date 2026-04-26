import { Layout } from "@/components/layout";
import { useGetSensorHistory } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getTemperatureStatus, getSoilMoistureStatus, getStatusColorClass } from "@/lib/status";

export default function History() {
  const { data: historyData, isLoading } = useGetSensorHistory(
    { limit: 50 },
    { query: { queryKey: ["history-page", 50] } }
  );

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">History Logs</h2>
        <p className="text-muted-foreground mt-1">Review historical sensor telemetry data.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Telemetry (Last 50 Records)</CardTitle>
          <CardDescription>Raw data readings from the ESP32 node</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>Temp</TableHead>
                  <TableHead>Humidity</TableHead>
                  <TableHead>Soil</TableHead>
                  <TableHead>Light</TableHead>
                  <TableHead className="text-right">NPK</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : historyData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No historical data available.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData?.map((record) => {
                    const tempStatus = getTemperatureStatus(record.temperature);
                    const soilStatus = getSoilMoistureStatus(record.soil_moisture);
                    
                    return (
                      <TableRow key={record.id} className="font-mono text-sm">
                        <TableCell className="text-muted-foreground">
                          {format(new Date(record.created_at), "yyyy-MM-dd HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{record.temperature.toFixed(1)}°C</span>
                            {tempStatus.level !== 'optimal' && (
                              <div className={`h-2 w-2 rounded-full ${tempStatus.level === 'critical' ? 'bg-destructive' : 'bg-amber-500'}`} title={tempStatus.label} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{record.humidity.toFixed(1)}%</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{record.soil_moisture}</span>
                            {soilStatus.level !== 'optimal' && (
                              <div className={`h-2 w-2 rounded-full ${soilStatus.level === 'critical' ? 'bg-destructive' : 'bg-amber-500'}`} title={soilStatus.label} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{record.light_level}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {record.nitrogen}/{record.phosphorus}/{record.potassium}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
