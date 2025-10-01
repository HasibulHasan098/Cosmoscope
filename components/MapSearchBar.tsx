
import React, { useState, useEffect, useRef } from 'react';

interface Suggestion {
  place_id: number;
  display_name: string;
}

interface MapSearchBarProps {
  onSearch: (query: string) => void;
}

const MapSearchBar: React.FC<MapSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    debounceTimeoutRef.current = window.setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestions(data);
        setIsOpen(data.length > 0);
      } catch (error) {
        console.error("Failed to fetch geocoding suggestions", error);
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 400);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSearch(suggestion.display_name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div ref={searchBarRef} className="absolute top-4 right-4 z-[1000] w-64 md:w-80">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          placeholder="Search for a location..."
          className="w-full bg-white dark:bg-[#1f2937] rounded-full py-2 pl-4 pr-10 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-blue-500 shadow-lg"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full w-10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          aria-label="Search"
        >
          <i className="ri-search-line"></i>
        </button>
      </form>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <ul role="listbox">
            {suggestions.map((suggestion) => (
              <li key={suggestion.place_id} role="option" aria-selected="false">
                <button
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white first:rounded-t-lg last:rounded-b-lg flex items-start gap-2"
                >
                  <i className="ri-map-pin-2-line mt-1"></i>
                  <span>{suggestion.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MapSearchBar;
