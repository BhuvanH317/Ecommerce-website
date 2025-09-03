import express from 'express';
import { registerUser,loginUser,listOrder,placeOrder,cancelOrder,updateProfile, getProfile } from '../controllers/userController.js';
import Product from '../models/productModel.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

// Get all products for users (public route)
userRouter.get('/products', async (req, res) => {
  try {
    const products = await Product.find();

    const formattedProducts = products.map((product) => {
      const originalPrice = product.originalPrice
        ? parseFloat(product.originalPrice.toString())
        : null;

      const currentPrice = product.price
        ? parseFloat(product.price.toString())
        : null;

      return {
        ...product.toObject(),
        originalPrice,
        price: currentPrice,
      };
    });

    res.json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/get-profile',authUser,getProfile);
userRouter.post('/update-profile',authUser, updateProfile);
userRouter.post('/place-order',authUser,placeOrder);
userRouter.get('/list-order',authUser,listOrder);
userRouter.delete('/cancel-order',authUser,cancelOrder);

export default userRouter;