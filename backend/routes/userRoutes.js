import express from 'express';
import { registerUser,loginUser,listOrder,placeOrder,cancelOrder,updateProfile, getProfile } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser);
userRouter.post('/login',loginUser);
userRouter.get('/get-profile',authUser,getProfile);
userRouter.post('/update-profile',authUser, updateProfile);
userRouter.post('/place-order',authUser,placeOrder);
userRouter.get('/list-order',authUser,listOrder);
userRouter.delete('/cancel-order',authUser,cancelOrder);

export default userRouter;