export type StatusLevel = "critical" | "warning" | "optimal" | "unknown";

export function getSoilMoistureStatus(value: number): { label: string; level: StatusLevel } {
  if (value < 200) return { label: "Soil Dry", level: "warning" };
  if (value > 600) return { label: "Waterlogged", level: "critical" };
  return { label: "Optimal", level: "optimal" };
}

export function getTemperatureStatus(celsius: number): { label: string; level: StatusLevel } {
  if (celsius < 15) return { label: "Cold", level: "warning" };
  if (celsius > 35) return { label: "Hot", level: "critical" };
  return { label: "Optimal", level: "optimal" };
}

export function getHumidityStatus(percentage: number): { label: string; level: StatusLevel } {
  if (percentage < 30) return { label: "Low", level: "warning" };
  if (percentage > 70) return { label: "High", level: "warning" };
  return { label: "Optimal", level: "optimal" };
}

export function getLightLevelStatus(value: number): { label: string; level: StatusLevel } {
  if (value < 100) return { label: "Dark", level: "warning" };
  if (value > 500) return { label: "Bright", level: "optimal" }; // Adjusted to not be warning
  return { label: "Moderate", level: "optimal" };
}

export function getStatusColorClass(level: StatusLevel): string {
  switch (level) {
    case "critical":
      return "bg-destructive/10 text-destructive border-destructive/20";
    case "warning":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/20";
    case "optimal":
      return "bg-primary/10 text-primary border-primary/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}
