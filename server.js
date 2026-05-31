const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://stylenest-e-commerce.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.options("*", cors()); 
app.use(express.json());

// ROUTES
const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders"); // ✅ ADD
const couponRoutes = require("./routes/coupon");
const paymentRoutes = require("./routes/payment");

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes); // ✅ ADD
app.use("/api/coupon", couponRoutes);
app.use("/api/payment", paymentRoutes);

// MONGODB CONNECT
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected!");
    app.listen(process.env.PORT, () => {
      console.log(`✅ Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("❌ Error:", err));