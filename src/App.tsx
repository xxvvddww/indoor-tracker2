
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Fixtures from "./pages/Fixtures";
import Standings from "./pages/Standings";
import Teams from "./pages/Teams";
import Stats from "./pages/Stats";
import Settings from "./pages/Settings";
import MatchDetails from "./pages/MatchDetails";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/fixtures" element={<Fixtures />} />
      <Route path="/standings" element={<Standings />} />
      <Route path="/teams" element={<Teams />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/match/:id" element={<MatchDetails />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
