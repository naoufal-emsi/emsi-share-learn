import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import { resourcesAPI } from '@/services/api';

interface ResourceSearchFiltersProps {
  onSearch: (filters: ResourceFilters) => void;
}

export interface ResourceFilters {
  searchText: string;
  type: string | null;
  categoryId: string | null;
}

const ResourceSearchFilters: React.FC<ResourceSearchFiltersProps> = ({ onSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ResourceFilters>({
    searchText: '',
    type: null,
    categoryId: null,
  });
  const [categories, setCategories] = useState<{ id: number; name: string; color: string }[]>([]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await resourcesAPI.getCategories();
        setCategories(response.results || []);
      } catch (error) {
        console.error('Failed to fetch resource categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleTypeChange = (type: string | null) => {
    setFilters({ ...filters, type });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, categoryId: e.target.value || null });
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      searchText: '',
      type: null,
      categoryId: null,
    });
    onSearch({
      searchText: '',
      type: null,
      categoryId: null,
    });
  };

  const hasActiveFilters = filters.type !== null || filters.categoryId !== null;

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search resources..."
            value={filters.searchText}
            onChange={handleSearchTextChange}
            className="pr-10"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          {filters.searchText && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilters({ ...filters, searchText: '' })}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant={hasActiveFilters ? "default" : "outline"} className="gap-2">
              <Filter className="h-4 w-4" />
              {hasActiveFilters ? `Filters (${
                (filters.type !== null ? 1 : 0) + 
                (filters.categoryId !== null ? 1 : 0)
              })` : "Filters"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Resource Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={filters.type === 'document' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTypeChange(filters.type === 'document' ? null : 'document')}
                    className="justify-start"
                  >
                    Documents
                  </Button>
                  <Button 
                    variant={filters.type === 'video' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTypeChange(filters.type === 'video' ? null : 'video')}
                    className="justify-start"
                  >
                    Videos
                  </Button>
                  <Button 
                    variant={filters.type === 'code' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTypeChange(filters.type === 'code' ? null : 'code')}
                    className="justify-start"
                  >
                    Code
                  </Button>
                  <Button 
                    variant={filters.type === 'other' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleTypeChange(filters.type === 'other' ? null : 'other')}
                    className="justify-start"
                  >
                    Other
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Category</h3>
                <select 
                  className="w-full p-2 border rounded-md"
                  value={filters.categoryId || ''}
                  onChange={handleCategoryChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Reset
                </Button>
                <Button size="sm" onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1">
          {filters.type && (
            <Badge variant="outline" className="gap-1 bg-primary/5">
              Type: {filters.type.charAt(0).toUpperCase() + filters.type.slice(1)}
              <button onClick={() => setFilters({ ...filters, type: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.categoryId && (
            <Badge variant="outline" className="gap-1 bg-primary/5">
              Category: {categories.find(c => c.id.toString() === filters.categoryId)?.name}
              <button onClick={() => setFilters({ ...filters, categoryId: null })}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleReset}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};

export default ResourceSearchFilters;