'use client';

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search jobs by title, company, or location...",
  className = ""
}: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full sm:min-w-md pl-10"
      />
    </div>
  );
};

export default SearchBar; 