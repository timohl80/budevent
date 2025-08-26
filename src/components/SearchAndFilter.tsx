'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SearchFilters {
  searchQuery: string;
  category: string;
  dateRange: string;
  location: string;
  sortBy: string;
}

interface SearchAndFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  categories?: string[];
  isSearching?: boolean;
}

export default function SearchAndFilter({ onFiltersChange, categories = [], isSearching = false }: SearchAndFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: '',
    category: '',
    dateRange: '',
    location: '',
    sortBy: 'date'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Default categories if none provided
  const defaultCategories = [
    'All Events',
    'Music',
    'Sports',
    'Food & Drink',
    'Technology',
    'Art & Culture',
    'Business',
    'Education',
    'Health & Wellness',
    'Entertainment'
  ];

  const dateRanges = [
    'All Dates',
    'Today',
    'Tomorrow',
    'This Week',
    'This Weekend',
    'Next Week',
    'Next Month'
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (Earliest First)' },
    { value: 'date-desc', label: 'Date (Latest First)' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'title', label: 'Title A-Z' },
    { value: 'location', label: 'Location' }
  ];

  const usedCategories = categories.length > 0 ? categories : defaultCategories;

  useEffect(() => {
    // Only trigger filters change for non-search filters (category, date, location, sort)
    // Search is handled separately with debouncing
    const hasNonSearchFilters = filters.category || filters.dateRange || filters.location || filters.sortBy !== 'date';
    
    if (hasNonSearchFilters) {
      onFiltersChange(filters);
    }
  }, [filters.category, filters.dateRange, filters.location, filters.sortBy, onFiltersChange]);

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // If clearing a filter and no other active filters, show all events immediately
    if (!value && !newFilters.searchQuery && !newFilters.category && !newFilters.dateRange && !newFilters.location && newFilters.sortBy === 'date') {
      onFiltersChange(newFilters);
    }
  };

  // Debounced search to prevent rapid API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (filters: SearchFilters) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onFiltersChange(filters);
        }, 300); // 300ms delay
      };
    })(),
    [onFiltersChange]
  );

  // Handle search query changes with debouncing
  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, searchQuery: value };
    setFilters(newFilters);
    
    // Debounce the search API call
    if (value.trim()) {
      debouncedSearch(newFilters);
    } else {
      // If search is cleared, show all events immediately
      onFiltersChange(newFilters);
    }
  };

  const clearFilters = () => {
    const clearedFilters = {
      searchQuery: '',
      category: '',
      dateRange: '',
      location: '',
      sortBy: 'date'
    };
    
    setFilters(clearedFilters);
    
    // Immediately trigger filter change to show all events
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.searchQuery || filters.category || filters.dateRange || filters.location || filters.sortBy !== 'date';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
      {/* Main Search Bar */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search events by title, description, or location..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#A29BFE] transition-colors"
        >
          {isExpanded ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
            >
              <option value="">All Categories</option>
              {usedCategories.map((category) => (
                <option key={category} value={category === 'All Events' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
            >
              <option value="">All Dates</option>
              {dateRanges.slice(1).map((range) => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="Enter city or location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
            />
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-100">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: &quot;{filters.searchQuery}&quot;
              <button
                onClick={() => handleFilterChange('searchQuery', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.dateRange && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Date: {filters.dateRange}
              <button
                onClick={() => handleFilterChange('dateRange', '')}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                ×
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Location: {filters.location}
              <button
                onClick={() => handleFilterChange('location', '')}
                className="ml-1 text-orange-600 hover:text-orange-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
