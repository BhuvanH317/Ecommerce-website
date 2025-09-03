import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Search, X } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import SearchSuggestions from '../components/SearchSuggestions';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const { products, removeProduct, applyDiscount } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountData, setDiscountData] = useState({
    percentage: 0,
    startDate: '',
    endDate: '',
    isActive: false
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

  // Get search suggestions
  const searchSuggestions = searchTerm.length >= 2 
    ? products
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product?')) {
      await removeProduct(productId);
    }
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    const result = await applyDiscount(selectedProduct._id, discountData);
    
    if (result.success) {
      setShowDiscountModal(false);
      setSelectedProduct(null);
      setDiscountData({ percentage: 0, startDate: '', endDate: '', isActive: false });
    }
  };

  const openDiscountModal = (product) => {
    setSelectedProduct(product);
    setDiscountData({
      percentage: product.discount?.percentage || 0,
      startDate: product.discount?.startDate ? new Date(product.discount.startDate).toISOString().split('T')[0] : '',
      endDate: product.discount?.endDate ? new Date(product.discount.endDate).toISOString().split('T')[0] : '',
      isActive: product.discount?.isActive || false
    });
    setShowDiscountModal(true);
  };

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          to="/add-product"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </Link>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.images?.[0]?.url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg'}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${product.price}
                      {product.discount?.isActive && (
                        <div className="text-xs text-red-600">
                          -{product.discount.percentage}% off
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' :
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openDiscountModal(product)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Manage Discount"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveProduct(product._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Remove Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Manage Discount - {selectedProduct?.name}
            </h3>
            
            <form onSubmit={handleDiscountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountData.percentage}
                  onChange={(e) => setDiscountData({...discountData, percentage: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={discountData.startDate}
                  onChange={(e) => setDiscountData({...discountData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={discountData.endDate}
                  onChange={(e) => setDiscountData({...discountData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={discountData.isActive}
                  onChange={(e) => setDiscountData({...discountData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Now
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDiscountModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Apply Discount
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;