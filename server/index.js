require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const uploadRoutes = require("./routes/upload");
const itineraryRoutes = require("./routes/itinerary");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin:[process.env.CLIENT_URL || "http://localhost:5173",
        "https://travel-ai-itinerary-three.vercel.app"],

  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/itinerary", itineraryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Trrip server running on port ${PORT}`);
});
