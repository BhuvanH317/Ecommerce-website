import React from 'react';
import { Search } from 'lucide-react';

const SearchSuggestions = ({ suggestions, onSelect, searchTerm, isVisible }) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
        >
          <Search className="w-4 h-4 text-gray-400" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{suggestion.name}</p>
            <p className="text-sm text-gray-500">{suggestion.category}</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-semibold text-primary-600">${suggestion.price}</span>
            {suggestion.stock !== undefined && (
              <p className="text-xs text-gray-400">Stock: {suggestion.stock}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;