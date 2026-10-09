const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const connectDB = require("./config/db");

const app = express();


// ==================== CORS ====================

const configuredOrigins = (process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://we-communicate.vercel.app",
  
  ...configuredOrigins
];

app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests without origin
      // Example: Postman or server-to-server requests
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS"
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);


// ==================== MIDDLEWARE ====================

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


// ==================== UPLOADS ====================

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use("/uploads", express.static(uploadsPath));


// ==================== ROUTES ====================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const blockRoutes = require("./routes/blockRoutes");
const houseRoutes = require("./routes/houseRoutes");
const postRoutes = require("./routes/postRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const eventRoutes = require("./routes/eventRoutes");
const businessRoutes = require("./routes/businessRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const communityRoutes = require("./routes/communityRoutes");
const recordRoutes = require("./routes/recordRoutes");


// Authentication
app.use("/api/auth", authRoutes);

// Users
app.use("/api/users", userRoutes);

// Blocks
app.use("/api/blocks", blockRoutes);

// Houses
app.use("/api/houses", houseRoutes);

// Community Posts
app.use("/api/posts", postRoutes);

// Complaints
app.use("/api/complaints", complaintRoutes);

// Events
app.use("/api/events", eventRoutes);

// Resident Businesses
app.use("/api/businesses", businessRoutes);

// Notifications
app.use("/api/notifications", notificationRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/records", recordRoutes);


// ==================== HOME ROUTE ====================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to We Communicate API",
    version: "1.0.0"
  });
});


// ==================== HEALTH CHECK ====================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "We Communicate Server is running healthy",
    timestamp: new Date().toISOString()
  });
});


// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});


// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


// ==================== START SERVER ====================

const port = process.env.PORT || 5000;

const startServer = async () => {

  try {

    const connected = await connectDB();

    if (!connected) {
      console.warn("Starting backend without MongoDB. Auth APIs will fail until MongoDB is available.");
    }

    app.listen(port, () => {
      console.log(`We Communicate Backend running on port ${port}`);
    });

  } catch (error) {

    console.error("Server startup failed:", error.message);

    app.listen(port, () => {
      console.log(`We Communicate Backend running on port ${port} without a database connection.`);
    });
  }
};

startServer();