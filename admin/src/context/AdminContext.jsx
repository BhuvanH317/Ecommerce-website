import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchProducts();
      fetchOrders();
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/login`, {
        email,
        password
      });

      if (response.data.success) {
        const newToken = response.data.token;
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', newToken);
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/admin/products`, {
        headers: { atoken: token }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      // Note: You'll need to add this endpoint to your backend
      const response = await axios.get(`${backendUrl}/api/admin/orders`, {
        headers: { atoken: token }
      });
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const addProduct = async (productData) => {
    try {
      const response = await axios.post(`${backendUrl}/api/admin/products`, productData, {
        headers: { atoken: token }
      });
      
      if (response.data.success) {
        fetchProducts();
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to add product' };
    }
  };

  const removeProduct = async (productId) => {
    try {
      const response = await axios.delete(`${backendUrl}/api/admin/products/${productId}`, {
        headers: { atoken: token }
      });
      
      if (response.data.success) {
        fetchProducts();
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to remove product' };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.patch(
        `${backendUrl}/api/admin/orders/${orderId}/status`,
        { orderStatus: status },
        { headers: { atoken: token } }
      );
      
      if (response.data.success) {
        fetchOrders();
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to update order status' };
    }
  };

  const applyDiscount = async (productId, discountData) => {
    try {
      const response = await axios.put(
        `${backendUrl}/api/admin/products/${productId}/discount`,
        discountData,
        { headers: { atoken: token } }
      );
      
      if (response.data.success) {
        fetchProducts();
        return { success: true };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      return { success: false, message: 'Failed to apply discount' };
    }
  };

  const value = {
    isAuthenticated,
    token,
    loading,
    products,
    orders,
    login,
    logout,
    fetchProducts,
    fetchOrders,
    addProduct,
    removeProduct,
    updateOrderStatus,
    applyDiscount
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};