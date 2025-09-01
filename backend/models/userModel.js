import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    phone: {
      type: String
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order" // reference to Order collection
      }
    ]
  },
  { timestamps: true } // auto adds createdAt and updatedAt
);

export default mongoose.model("User", userSchema);
