
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { useIsMobile } from '@/hooks/use-mobile';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchHeader = ({ searchQuery, setSearchQuery }: SearchHeaderProps) => {
  const isMobile = useIsMobile();
  const compactMode = isMobile;

  return (
    <div className="flex justify-between items-center">
      <h1 className={`${compactMode ? 'text-xl' : 'text-3xl'} font-bold tracking-tight`}>Teams</h1>
      
      <div className={`relative ${compactMode ? 'w-36' : 'w-72'}`}>
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={compactMode ? "Search..." : "Search teams or divisions..."}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchHeader;
