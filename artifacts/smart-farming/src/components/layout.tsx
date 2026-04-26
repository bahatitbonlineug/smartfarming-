import { Link, useLocation } from "wouter";
import { 
  Activity, 
  Clock, 
  MapPin, 
  Menu,
  Server,
  PlugZap,
} from "lucide-react";
import rrfLogo from "@assets/RRF-LOGO-scaled_1776239452256_1777135249978.jpg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetDevice, getGetDeviceQueryKey } from "@workspace/api-client-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/history", label: "History Logs", icon: Clock },
  { href: "/map", label: "GPS Tracking", icon: MapPin },
  { href: "/connect", label: "Connect Device", icon: PlugZap },
  { href: "/api-info", label: "API Info", icon: Server },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: device } = useGetDevice({
    query: { refetchInterval: 5000, queryKey: getGetDeviceQueryKey() },
  });

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card">
        <div className="px-5 py-4 flex items-center gap-3 border-b border-border">
          <img src={rrfLogo} alt="RRF Logo" className="h-12 w-12 rounded-md object-contain bg-white shrink-0" />
          <div>
            <h1 className="font-bold text-sm tracking-wide leading-tight">RRF SMART FARMING</h1>
            <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Rwamanja Rural Foundation</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">System Active</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1 mt-6">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Monitoring</div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <Link href="/connect">
            <div className="bg-muted rounded-md p-3 text-xs flex items-start gap-2 hover:bg-muted/80 transition-colors cursor-pointer">
              <PlugZap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-semibold">ESP32 Node</p>
                  {device?.connected ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                  )}
                </div>
                <p className="text-muted-foreground font-mono truncate">
                  {device?.ip ?? "No device connected"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between h-14 px-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <img src={rrfLogo} alt="RRF Logo" className="h-8 w-8 rounded object-contain bg-white" />
            <div>
              <h1 className="font-bold text-sm leading-tight">RRF SMART FARMING</h1>
              <p className="text-[9px] text-muted-foreground leading-tight">Rwamanja Rural Foundation</p>
            </div>
          </div>
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="px-5 py-4 flex items-center gap-3 border-b border-border">
                <img src={rrfLogo} alt="RRF Logo" className="h-10 w-10 rounded-md object-contain bg-white shrink-0" />
                <div>
                  <h1 className="font-bold text-sm tracking-wide leading-tight">RRF SMART FARMING</h1>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Rwamanja Rural Foundation</p>
                </div>
              </div>
              <nav className="flex-1 px-4 flex flex-col gap-1 mt-6">
                <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Monitoring</div>
                {NAV_ITEMS.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto bg-background/50">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
