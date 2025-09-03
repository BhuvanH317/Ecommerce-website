import React, { useEffect } from 'react';
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import {Link} from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
  const { orders, fetchOrders } = useShop();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please log in to view orders</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/products"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order._id.slice(-8)}
                      </h3>
                      <p className="text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.orderStatus)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product?.name || `Product ID: ${item.product}`}
                            </p>
                            <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ${((typeof item.price === 'number' ? item.price : parseFloat(item.price.toString())) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">
                        ${(typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount.toString())).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Shipping Address:</h4>
                    <p className="text-gray-600 text-sm">
                      {order.shippingAddress.street}, {order.shippingAddress.city}
                      {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
                      {' '}{order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;