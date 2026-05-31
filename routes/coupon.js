const express = require("express");
const router  = express.Router();
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

// ✅ COUPONS DATA
const COUPONS = {
  STYLE10:  { type: "percent", value: 10, label: "10% Off",      minOrder: 0    },
  NEST20:   { type: "percent", value: 20, label: "20% Off",      minOrder: 999  },
  FIRST50:  { type: "flat",    value: 50, label: "₹50 Off",      minOrder: 0    },
  FREESHIP: { type: "flat",    value: 0,  label: "Free Delivery", minOrder: 0   },
};

// ✅ VALIDATE COUPON ROUTE
router.post("/validate", authMiddleware, (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Please enter a coupon code!" });
  }

  const coupon = COUPONS[code.toUpperCase()];

  if (!coupon) {
    return res.status(400).json({ success: false, message: "Invalid coupon code!" });
  }

  if (subtotal < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      message: `Minimum order ₹${coupon.minOrder} required for this coupon!`,
    });
  }

  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.value;

  return res.json({
    success:  true,
    code:     code.toUpperCase(),
    label:    coupon.label,
    discount,
    message:  `Coupon applied! You save ₹${discount}`,
  });
});

module.exports = router;