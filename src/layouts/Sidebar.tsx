import { useState, useRef, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  Plus,
  Monitor,
  Building2,
  Menu,
  X,
  Truck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const { user, signOut } = useAuth();

  const navItems = [
    { to: "/", label: "Nova Solicitacao", icon: Plus, show: user?.isAdmin },
    { to: "/monitor", label: "Monitor de Entregas", icon: Monitor, show: true },
    { to: "/hospitais", label: "Hospitais", icon: Building2, show: user?.isAdmin },
  ].filter((item) => item.show);

  const handleMouseEnter = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setDesktopOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setDesktopOpen(false);
    }, 200);
  }, []);

  const handleNavClick = useCallback(() => {
    setDesktopOpen(false);
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Hospital Delivery</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 hover:bg-muted rounded-md transition-colors"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed top-14 left-0 z-50 h-[calc(100vh-3.5rem)] w-64 border-r bg-background p-4 transition-transform duration-200 flex flex-col lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground truncate">{user?.username}</span>
            <div className="flex gap-1">
              {user?.isAdmin && (
                <span className="text-[10px] font-medium uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
              {user?.isAnderson && (
                <span className="text-[10px] font-medium uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  Editor
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Desktop - Visible hover trigger */}
      {!desktopOpen && (
        <div
          className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-[55] lg:w-8 lg:items-center lg:justify-center lg:cursor-pointer lg:hover:bg-muted/50 lg:transition-colors"
          onMouseEnter={handleMouseEnter}
        >
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Desktop Overlay */}
      {desktopOpen && (
        <div
          className="hidden lg:fixed lg:inset-0 lg:z-40 lg:bg-black/10"
          onClick={() => setDesktopOpen(false)}
          onMouseEnter={handleMouseLeave}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-64 lg:flex-col border-r bg-background transition-transform duration-300 ease-in-out",
          desktopOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex h-14 items-center gap-2 border-b px-6">
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">Hospital Delivery Control</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={handleNavClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.username}</span>
            <div className="flex gap-1">
              {user?.isAdmin && (
                <span className="text-[10px] font-medium uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  Admin
                </span>
              )}
              {user?.isAnderson && (
                <span className="text-[10px] font-medium uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                  Editor
                </span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}
