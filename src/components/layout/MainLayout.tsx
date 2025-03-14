
import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Award, Users, Calendar, BarChart3, Settings, Home, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const isActive = (path: string) => {
    return location.pathname === path 
      ? "bg-secondary text-white border-l-2 border-success" 
      : "text-muted-foreground hover:text-white hover:bg-secondary/50";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/fixtures", label: "Fixtures & Results", icon: Calendar },
    { path: "/standings", label: "Team Standings", icon: Award },
    { path: "/teams", label: "Teams", icon: Users },
    { path: "/stats", label: "Player Statistics", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-background border-r border-secondary hidden md:block">
        <div className="p-4 border-b border-secondary">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-success" />
            <h1 className="font-bold text-xl">Cricket Tracker</h1>
          </div>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  to={item.path} 
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path)}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-secondary z-20">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-success" />
            <h1 className="font-bold text-base">Cricket Tracker</h1>
          </div>
          <button 
            className="p-1 rounded-md hover:bg-secondary/50 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-12 left-0 right-0 bottom-0 bg-background z-10 overflow-y-auto">
          <nav className="p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(item.path)}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-2 md:p-6 md:pt-4 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
