
import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Award, Users, Calendar, BarChart3, Settings, Home } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card hidden md:block">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl">Cricket Tracker</h1>
          </div>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Link 
                to="/" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/')}`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/fixtures" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/fixtures')}`}
              >
                <Calendar className="h-4 w-4" />
                Fixtures & Results
              </Link>
            </li>
            <li>
              <Link 
                to="/standings" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/standings')}`}
              >
                <Award className="h-4 w-4" />
                Team Standings
              </Link>
            </li>
            <li>
              <Link 
                to="/teams" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/teams')}`}
              >
                <Users className="h-4 w-4" />
                Teams
              </Link>
            </li>
            <li>
              <Link 
                to="/stats" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/stats')}`}
              >
                <BarChart3 className="h-4 w-4" />
                Player Statistics
              </Link>
            </li>
            <li>
              <Link 
                to="/settings" 
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive('/settings')}`}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <h1 className="font-bold text-xl">Cricket Tracker</h1>
          </div>
          <button className="p-2">
            <span className="sr-only">Open menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-4 md:p-6 md:pt-4 overflow-y-auto pt-16 md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
