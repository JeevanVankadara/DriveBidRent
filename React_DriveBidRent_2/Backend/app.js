// Backend/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";                 // Loads environment variables
import morgan from "morgan";
import helmet from "helmet";            // Security headers
import rateLimit from "express-rate-limit"; // Rate limiting
import compression from "compression";  // Response compression

// Database connection
import connectDB from "./config/db.js";

// Import models (ensures schemas are registered with Mongoose)
import "./models/User.js";
import "./models/RentalRequest.js";
import "./models/AuctionRequest.js";
import "./models/Chat.js";
import "./models/Message.js";
import "./models/InspectionChat.js";
import "./models/InspectionMessage.js";

// === ROUTES ===
import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/home.routes.js";
import sellerRoutes from "./routes/seller.routes.js";
import auctionManagerRoutes from "./routes/auctionManager.routes.js";   // NEW: Auction Manager API
import mechanicRoutes from "./routes/mechanic.routes.js";               // NEW: Mechanic API
import adminRoutes from "./routes/admin.routes.js";                     // NEW: Admin API routes
import buyerRoutes from "./routes/buyer.routes.js";                     // NEW: Buyer API Routes (Single Consolidated File)

// === MIDDLEWARES ===
import sellerMiddleware from "./middlewares/seller.middleware.js";
import mechanicMiddleware from "./middlewares/mechanic.middleware.js";
import adminMiddleware from "./middlewares/admin.middleware.js";
import auctionManagerMiddleware from "./middlewares/auction_manager.middleware.js";
import buyerMiddleware from "./middlewares/buyer.middleware.js";
import chatRoutes from './routes/chat.routes.js';
import inspectionChatRoutes from './routes/inspectionChat.routes.js';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === SECURITY: Helmet - Set security headers ===
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now (can be configured later)
  crossOriginEmbedderPolicy: false // Allow embedding if needed
}));

// === PERFORMANCE: Compression - Compress responses ===
app.use(compression());

// === RATE LIMITING: Prevent abuse ===
// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Strict rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 requests per 15 minutes for auth routes
  message: { success: false, message: "Too many login/signup attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// === CORS Setup (Flexible & Secure) ===
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://yourdomain.com", // Replace with your actual domain in production
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy: Origin not allowed"));
    },
    credentials: true, // Important for cookies/jwt
  })
);

// === Global Middlewares ===
app.use(morgan("dev", {
  skip: (req) => {
    // Skip logging for polling routes to reduce console spam
    return req.url.includes('/notifications') || 
           req.url.includes('/auction/') || 
           req.url.includes('/buyer/dashboard') ||
           req.url.includes('/wishlist');
  }
}));                                                        // HTTP request logging
app.use(express.json());                                    // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));            // Parse form data
app.use(cookieParser());                                    // Parse cookies
app.use(express.static(path.join(__dirname, "public")));   // Serve static files (uploads, images, etc.)

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);

// === API ROUTES (Clean /api prefix) ===
app.use("/api/auth", authLimiter, authRoutes); // Apply strict rate limiting to auth routes
app.use("/api/home", homeRoutes);
app.use("/api/seller", sellerMiddleware, sellerRoutes);
app.use("/api/buyer", buyerMiddleware, buyerRoutes);
app.use("/api/auctionmanager", auctionManagerMiddleware, auctionManagerRoutes);   // NEW
app.use("/api/mechanic", mechanicMiddleware, mechanicRoutes);                     // NEW
app.use("/api/admin", adminMiddleware, adminRoutes);                              // NEW
// Chat routes (requires auth cookie or Authorization header)
app.use('/api/chat', chatRoutes);
// Inspection chat routes (auction manager <-> mechanic)
app.use('/api/inspection-chat', inspectionChatRoutes);

// === PRODUCTION: Serve React/Vite Build (SPA Support) ===
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "..", "client", "dist");

  // Dynamically import fs only when needed (top-level await not allowed in all envs)
  (async () => {
    try {
      const fs = await import("fs");
      if (fs.existsSync(clientDistPath)) {
        app.use(express.static(clientDistPath));

        // Serve index.html for all non-API routes (critical for React Router)
        app.get("*", (req, res) => {
          if (req.path.startsWith("/api")) {
            return res.status(404).json({ error: "API route not found" });
          }
          res.sendFile(path.join(clientDistPath, "index.html"));
        });

        console.log("Production mode: Serving client build from", clientDistPath);
      } else {
        console.warn("Client build not found at:", clientDistPath, "- skipping static serving.");
      }
    } catch (err) {
      console.error("Error checking client build:", err);
    }
  })();
}


app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error("Failed to connect to database or start server:", err);
    process.exit(1);
  }
};

startServer();

export default app;