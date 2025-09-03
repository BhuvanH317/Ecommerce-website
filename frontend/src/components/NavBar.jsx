import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import SearchSuggestions from './SearchSuggestions';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user, logout } = useAuth();
  const { cart, products } = useShop();
  const navigate = useNavigate();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const searchSuggestions = searchTerm.length >= 2 
    ? products
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearchSelect = (product) => {
    setSearchTerm('');
    setShowSearch(false);
    setShowSuggestions(false);
    navigate('/products');
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EcomStore</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Products
            </Link>
            {user && (
              <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                Orders
              </Link>
            )}
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full" onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}>
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
                  if (searchTerm.length >= 2) setShowSuggestions(true);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <SearchSuggestions
                suggestions={searchSuggestions}
                onSelect={handleSearchSelect}
                searchTerm={searchTerm}
                isVisible={showSuggestions && searchTerm.length >= 2}
              />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Search className="w-6 h-6" />
            </button>

            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="w-5 h-5" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="lg:hidden border-t border-gray-200 p-4">
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
                  if (searchTerm.length >= 2) setShowSuggestions(true);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <SearchSuggestions
                suggestions={searchSuggestions}
                onSelect={handleSearchSelect}
                searchTerm={searchTerm}
                isVisible={showSuggestions && searchTerm.length >= 2}
              />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button
                onClick={() => {
                  setShowSearch(!showSearch);
                  setIsMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Search className="w-5 h-5 mr-2" />
                Search Products
              </button>
              <Link
                to="/"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/products"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              {user && (
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Orders
                </Link>
              )}
              <Link
                to="/cart"
                className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cartItemsCount})
              </Link>

              {user ? (
                <div className="border-t border-gray-200 pt-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    {user.name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-2 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-primary-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mx-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;