import bcrypt from 'bcrypt';
import validator from 'validator';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import orderModel from '../models/orderModel.js';




const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing details" });
    }

    // Validate email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // Validate password length
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter a strong password" });
    }

    // Optional: Validate phone number if provided
    if (phone && !validator.isMobilePhone(phone, "any")) {
      return res.json({ success: false, message: "Enter a valid phone number" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object
    const userData = { name, email, password: hashedPassword };
    if (phone) userData.phone = phone; // only add phone if provided

    // Save user
    const newUser = new userModel(userData);
    const user = await newUser.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const {  name, email, phone } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "User ID missing" });
    }

    // Build update object with only provided fields
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone) updates.phone = phone;

    if (Object.keys(updates).length === 0) {
      return res.json({ success: false, message: "No fields provided to update" });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true } // validate schema rules
    );

    if (!updatedUser) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



 const placeOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentInfo } = req.body;
    const userId = req.userId; // added in auth middleware

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "No items in order" });
    }

    let totalAmount = 0;

    // ✅ Validate products & calculate total
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ success: false, message: `Not enough stock for ${product.name}` });
      }

      // calculate total (convert Decimal128 to number)
      totalAmount += parseFloat(product.price.toString()) * item.quantity;
    }

    // ✅ Create order
    const order = new Order({
      user: userId,
      items,
      shippingAddress,
      paymentInfo,
      totalAmount
    });

    const savedOrder = await order.save();

    // ✅ Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const listOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await orderModel.find({ user: userId })
          .populate('items.product', 'name images')
          .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => ({
          ...order.toObject(),
          totalAmount: parseFloat(order.totalAmount.toString()),
          items: order.items.map(item => ({
            ...item,
            price: parseFloat(item.price.toString())
          }))
        }));

        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

 const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id; // from authMiddleware

    // find order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // check if order belongs to this user (or admin can also cancel)
    if (order.user.toString() !== userId.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }

    // check if already processed/shipped/delivered
    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled at this stage" });
    }

    // update order status
    order.orderStatus = "cancelled";
    await order.save();

    // Restock products
    for (let item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } } 
      );
    }

    return res.status(200).json({ message: "Order cancelled successfully", order });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const  userId  = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "User ID missing" });
    }

    // Fetch user without password
    const userData = await userModel.findById(userId).select('-password');

    if (!userData) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: userData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


export{cancelOrder,placeOrder,listOrder,updateProfile,loginUser,registerUser,getProfile}