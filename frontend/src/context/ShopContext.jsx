import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/admin/products`);
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const addToCart = (productId, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product === productId);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product: productId, quantity }];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product !== productId));
  };

  // Update cart quantity
  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.product === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p._id === item.product);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Place order
  const placeOrder = async (shippingAddress, paymentInfo) => {
    try {
      const orderItems = cart.map(item => {
        const product = products.find(p => p._id === item.product);
        return {
          product: item.product,
          quantity: item.quantity,
          price: product.price
        };
      });

      const response = await axios.post(
        `${backendUrl}/api/user/place-order`,
        {
          items: orderItems,
          shippingAddress,
          paymentInfo
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        setCart([]);
        fetchOrders();
        return { success: true, order: response.data.order };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to place order' };
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${backendUrl}/api/user/list-order`, {
        headers: { token }
      });
      
      if (response.data.success) {
        setOrders(response.data.order || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [token]);

  const value = {
    products,
    cart,
    orders,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartTotal,
    placeOrder,
    fetchProducts,
    fetchOrders
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};