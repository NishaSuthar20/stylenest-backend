const express = require("express");
const router  = express.Router();
const Order   = require("../models/Order");
const User    = require("../models/User");
const jwt     = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token!" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token!" });
  }
};

const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(403).json({ message: "User not found!" });
    if (user.email !== "admin@stylenest.in") {
      return res.status(403).json({ message: "Access denied!" });
    }
    next();
  } catch {
    res.status(500).json({ message: "Server error!" });
  }
};

router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, discount, finalAmount, couponUsed, address, paymentMethod } = req.body;
    const order = new Order({
      user: req.userId,
      items, totalAmount, discount, finalAmount, couponUsed, address, paymentMethod,
    });
    await order.save();
    res.status(201).json({ message: "Order placed successfully!", order });
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

router.put("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found!" });
    if (order.status === "Delivered") {
      return res.status(400).json({ message: "Delivered order cannot be cancelled!" });
    }
    order.status = "Cancelled";
    await order.save();
    res.json({ message: "Order cancelled!", order });
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

router.put("/status/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status!" });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found!" });
    res.json({ message: "Status updated!", order });
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found!" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error!", error: err.message });
  }
});

module.exports = router;