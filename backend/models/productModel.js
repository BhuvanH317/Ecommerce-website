import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    originalPrice: {   // store original price
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    price: {           // current price (might be discounted)
      type: mongoose.Schema.Types.Decimal128,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    category: {
      type: String,
      required: true
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String, required: true } // from Cloudinary
      }
    ],
    brand: {
      type: String
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    discount: {
      percentage: { type: Number, min: 0, max: 100 },
      startDate: { type: Date },
      endDate: { type: Date },
      isActive: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// 🔹 Middleware: ensure price matches originalPrice when product is created
productSchema.pre("save", function (next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

export default mongoose.model("Product", productSchema);
