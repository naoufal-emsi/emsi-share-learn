import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  categories: { id: number; name: string }[];
}

export interface SearchFilters {
  searchText: string;
  tags: string[];
  isResolved: boolean | null;
  createdAfter: Date | null;
  createdBefore: Date | null;
  categoryId: string | null;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, categories }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchText: '',
    tags: [],
    isResolved: null,
    createdAfter: null,
    createdBefore: null,
    categoryId: null,
  });
  const [tagInput, setTagInput] = useState('');

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchText: e.target.value });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!filters.tags.includes(tagInput.trim())) {
        setFilters({ ...filters, tags: [...filters.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFilters({ ...filters, tags: filters.tags.filter(t => t !== tag) });
  };

  const handleResolvedChange = (value: boolean) => {
    setFilters({ ...filters, isResolved: value });
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
      tags: [],
      isResolved: null,
      createdAfter: null,
      createdBefore: null,
      categoryId: null,
    });
    onSearch({
      searchText: '',
      tags: [],
      isResolved: null,
      createdAfter: null,
      createdBefore: null,
      categoryId: null,
    });
  };

  const hasActiveFilters = filters.tags.length > 0 || 
    filters.isResolved !== null || 
    filters.createdAfter !== null || 
    filters.createdBefore !== null ||
    filters.categoryId !== null;

  return (
    <div className="w-full space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search discussions..."
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
                (filters.tags.length > 0 ? 1 : 0) + 
                (filters.isResolved !== null ? 1 : 0) + 
                (filters.createdAfter !== null || filters.createdBefore !== null ? 1 : 0) +
                (filters.categoryId !== null ? 1 : 0)
              })` : "Filters"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1 mb-2">
                  {filters.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <div className="flex items-center justify-between">
                  <Label htmlFor="resolved">Resolved</Label>
                  <div className="flex gap-2">
                    <Button 
                      variant={filters.isResolved === false ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleResolvedChange(false)}
                    >
                      Unresolved
                    </Button>
                    <Button 
                      variant={filters.isResolved === true ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleResolvedChange(true)}
                    >
                      Resolved
                    </Button>
                    {filters.isResolved !== null && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setFilters({ ...filters, isResolved: null })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
              
              <div>
                <h3 className="font-medium mb-2">Created Date</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">From</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          size="sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.createdAfter ? (
                            format(filters.createdAfter, 'PP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.createdAfter || undefined}
                          onSelect={(date) => setFilters({ ...filters, createdAfter: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label className="text-xs">To</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          size="sm"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.createdBefore ? (
                            format(filters.createdBefore, 'PP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.createdBefore || undefined}
                          onSelect={(date) => setFilters({ ...filters, createdBefore: date })}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
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
          {filters.tags.map(tag => (
            <Badge key={tag} variant="outline" className="gap-1 bg-primary/5">
              Tag: {tag}
              <button onClick={() => handleRemoveTag(tag)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {filters.isResolved !== null && (
            <Badge variant="outline" className="gap-1 bg-primary/5">
              {filters.isResolved ? 'Resolved' : 'Unresolved'}
              <button onClick={() => setFilters({ ...filters, isResolved: null })}>
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
          
          {(filters.createdAfter || filters.createdBefore) && (
            <Badge variant="outline" className="gap-1 bg-primary/5">
              Date: {filters.createdAfter ? format(filters.createdAfter, 'PP') : 'Any'} 
              {' '} to {' '}
              {filters.createdBefore ? format(filters.createdBefore, 'PP') : 'Any'}
              <button onClick={() => setFilters({ ...filters, createdAfter: null, createdBefore: null })}>
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

export default SearchFilters;