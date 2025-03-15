
import React from 'react';
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface FixturesSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  resetState: () => void;
}

export const FixturesSearch = ({ searchTerm, setSearchTerm, resetState }: FixturesSearchProps) => {
  return (
    <div className="relative w-28 sm:w-64">
      <Input
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          resetState();
        }}
        className="pr-8 h-7 text-xs"
      />
      <Filter className="absolute right-2 top-1.5 h-3 w-3 text-muted-foreground" />
    </div>
  );
};
