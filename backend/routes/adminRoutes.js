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
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();


adminRouter.post('/products', authAdmin, upload.single('image'), addProduct);
adminRouter.delete('/products/:id', authAdmin, removeProduct);      
adminRouter.get('/products', authAdmin, allProducts);               
adminRouter.put('/products/:id/discount', authAdmin, applyDiscount);
adminRouter.patch('/orders/:id/status', authAdmin, changeOrderStatus);              
adminRouter.patch('/orders/:id/cancel', authAdmin, cancelOrder);                    
adminRouter.post('/login', loginAdmin);                                             

export default adminRouter;
