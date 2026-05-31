const express   = require("express");
const router    = express.Router();
const Razorpay  = require("razorpay");
const crypto    = require("crypto");
const jwt       = require("jsonwebtoken");

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

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ CREATE ORDER
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount:   amount * 100, // paise mein convert karo
      currency: "INR",
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Payment error!", error: err.message });
  }
});

// ✅ VERIFY PAYMENT
router.post("/verify", authMiddleware, (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body      = razorpay_order_id + "|" + razorpay_payment_id;
    const expected  = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected === razorpay_signature) {
      res.json({ success: true, message: "Payment verified!" });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Verification error!" });
  }
});

module.exports = router;