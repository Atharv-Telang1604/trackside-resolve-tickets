
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import { LogOut } from "lucide-react";
import { useLocation } from "react-router-dom";

interface NavbarProps {
  userRole?: "customer" | "admin" | null;
  onLogout?: () => void;
}

export function Navbar({ userRole, onLogout }: NavbarProps) {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(!!userRole);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsAuthenticated(false);
  };

  // Don't show navbar on landing page
  if (location.pathname === "/" && !userRole) {
    return null;
  }

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {userRole === "admin" ? "Admin Dashboard" : "Customer Dashboard"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
