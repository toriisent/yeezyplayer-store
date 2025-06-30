
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input
        type="text"
        placeholder="Search songs, albums..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400 focus:border-white"
      />
    </div>
  );
};
