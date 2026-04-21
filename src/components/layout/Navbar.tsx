import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/contexts/UserContext";
import { useApp } from "@/contexts/AppContext";
import { NAV_LINKS, type Role } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoggedIn, logout } = useUser();
  const { unreadCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const nav = NAV_LINKS[(user?.role as Role) ?? "patient"];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white text-sm font-black">L</div>
          <span className="hidden sm:inline">Laso Health</span>
        </Link>

        {/* Desktop nav */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/dashboard">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold", user?.colorClass)}>
                      {user?.avatarInitials}
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem><User className="mr-2 h-4 w-4" />Profile</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild><Link to="/login">Sign in</Link></Button>
              <Button asChild><Link to="/quiz">Get started</Link></Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && mobileOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-4 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.href
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
