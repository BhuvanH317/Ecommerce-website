import express from 'express';
import {
  addProduct,
  removeProduct,
  allProducts,
  changeOrderStatus,
  cancelOrder,
  applyDiscount,
  loginAdmin
} from '../controllers/adminController.js';
import Order from '../models/orderModel.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

// Get all orders for admin
adminRouter.get('/orders', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      totalAmount: parseFloat(order.totalAmount.toString()),
      items: order.items.map(item => ({
        ...item,
        price: parseFloat(item.price.toString())
      }))
    }));

    res.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

adminRouter.post('/products', authAdmin, upload.single('image'), addProduct);
adminRouter.delete('/products/:id', authAdmin, removeProduct);      
adminRouter.get('/products', authAdmin, allProducts);               
adminRouter.put('/products/:id/discount', authAdmin, applyDiscount);
adminRouter.patch('/orders/:id/status', authAdmin, changeOrderStatus);              
adminRouter.patch('/orders/:id/cancel', authAdmin, cancelOrder);                    
adminRouter.post('/login', loginAdmin);                                             

export default adminRouter;
