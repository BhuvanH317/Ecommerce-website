import React, { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchSuggestions from '../components/SearchSuggestions';
import { useShop } from '../context/ShopContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const { products, loading } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(product => product.category))];
    return cats.filter(Boolean);
  }, [products]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchTerm.trim() || searchTerm.length < 2) return [];
    
    return products
      .filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice(0, 5);
  }, [products, searchTerm]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  const handleSearchSelect = (product) => {
    setSearchTerm(product.name);
    setShowSuggestions(false);
    setSearchFocused(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const clearCategory = () => {
    setSelectedCategory('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">All Products</h1>
          
          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {/* Active Filters */}
            {(searchTerm || selectedCategory) && (
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    Search: "{searchTerm}"
                    <button onClick={clearSearch} className="ml-2 hover:text-primary-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Category: {selectedCategory}
                    <button onClick={clearCategory} className="ml-2 hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (searchTerm.length >= 2) setShowSuggestions(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <SearchSuggestions
                  suggestions={searchSuggestions}
                  onSelect={handleSearchSelect}
                  searchTerm={searchTerm}
                  isVisible={showSuggestions && searchFocused && searchTerm.length >= 2}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Quick Category Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;