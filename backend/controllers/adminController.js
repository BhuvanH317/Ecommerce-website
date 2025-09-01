import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
//  Add Product
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, originalPrice, stock, category, images, brand } = req.body;

    if (!name || !description || !price || !category || !images || !originalPrice || images.length  === 0) {
      return res.status(400).json({ success: false, message: "All required fields must be provided" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      originalPrice,
      stock,
      category,
      images,
      brand
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error adding product", error: error.message });
  }
};

//  Remove Product
export const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error removing product", error: error.message });
  }
};

//  Change Product Status (we can use stock or custom field)
export const changeOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body; // expected: "pending" | "processing" | "shipped" | "delivered" | "cancelled"

    if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid order status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: orderStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: `Order status updated to ${orderStatus}`,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating order status", error: error.message });
  }
};


//  Cancel Order
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: "cancelled", "paymentInfo.status": "failed" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error cancelling order", error: error.message });
  }
};

// Apply or update discount on a product
export const applyDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { percentage, startDate, endDate, isActive } = req.body;

    // Validate discount %
    if (percentage < 0 || percentage > 100) {
      return res
        .status(400)
        .json({ success: false, message: "Discount percentage must be between 0 and 100" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Convert Decimal128 to float
    const originalPrice = product.originalPrice
      ? parseFloat(product.originalPrice.toString())
      : parseFloat(product.price.toString());

    let newPrice = originalPrice;

    // If discount is active now, calculate new price
    if (isActive && percentage > 0) {
      newPrice = originalPrice - (originalPrice * percentage) / 100;
    }

    // Save discount info
    product.discount = {
      percentage,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive,
    };

    product.price = mongoose.Types.Decimal128.fromString(newPrice.toFixed(2)); // store as Decimal128

    await product.save();

    res.json({
      success: true,
      message: "Discount applied successfully",
      product,
    });
  } catch (error) {
    console.error("Discount Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error applying discount", error: error.message });
  }
};

// Get all products (with discount-aware pricing)
export const allProducts = async (req, res) => {
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
};


export const loginAdmin = async(req,res)=>{
    try{

        const {email,password} = req.body

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
        }else{
            res.json({success:false,message:"Invalid credentials"})
        }

    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}