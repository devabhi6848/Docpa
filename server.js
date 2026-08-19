import express from "express";
import helmet from "helmet";
import cors from "cors";
import dns from "dns";

// Force Node.js to prioritize IPv4 over IPv6 globally (prevents ENETUNREACH errors on Render/cloud instances)
dns.setDefaultResultOrder("ipv4first");

import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { sanitizeNoSql } from "./middleware/sanitizeNoSql.js";

// Handle uncaught exceptions before server initialization
process.on("uncaughtException", (err) => {
  console.error("[CRITICAL UNCAUGHT EXCEPTION 💥]", err);
  process.exit(1);
});

const app = express();

// Trust proxy if running behind Nginx / Cloudflare / Load Balancers
app.set("trust proxy", 1);

// Connect to MongoDB Database
connectDB();

// Security HTTP Headers Middleware (HSTS, nosniff, X-Frame-Options, CSP)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.sms-gateway-provider.com"],
      },
    },
    frameguard: { action: "deny" }, // Clickjacking prevention
    hidePoweredBy: true, // Conceal Express identity
    hsts: {
      maxAge: 31536000, // 1 year strict HTTPS
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true, // Prevent MIME confusion
    xssFilter: true,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-clinic-id"],
    credentials: true,
  })
);

// Global Body Parsing (10kb maximum payload defense)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Deep NoSQL Operator Injection Sanitization
app.use(sanitizeNoSql);

// System Health Check for Uptime Monitors & Load Balancers (Unthrottled)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "docpa-backend",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// General Rate Limiting for all API routes
app.use("/api", apiLimiter);

// API Routes
app.use("/api", routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start HTTP Server
const server = app.listen(config.port, () => {
  console.log(`[SERVER] Running in ${config.env.toUpperCase()} mode on port ${config.port}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("[UNHANDLED REJECTION 💥]", err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`[SERVER] ${signal} signal received. Closing HTTP server gracefully...`);
  server.close(() => {
    console.log("[SERVER] HTTP server closed cleanly.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));