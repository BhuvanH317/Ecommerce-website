import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // reference to User collection
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",   // reference to Product collection
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: mongoose.Schema.Types.Decimal128, // store accurate price
          required: true
        }
    
      }
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    paymentInfo: {
      method: { type: String, enum: ["card", "paypal", "cod"], required: true },
      status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
      transactionId: { type: String }
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending"
    },
    totalAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true
    }
  },
  { timestamps: true } // auto adds createdAt and updatedAt
);

export default mongoose.model("Order", orderSchema);
