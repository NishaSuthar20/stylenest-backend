const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: Number,
      name: String,
      price: Number,
      quantity: Number,
      image: String,
      selectedSize: String,
      gender: String,
      category: String,
    },
  ],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  couponUsed: String,
  status: {
    type: String,
    enum: ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
    default: "Processing",
  },
  address: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: {
    type: String,
    default: "Cash on Delivery",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);