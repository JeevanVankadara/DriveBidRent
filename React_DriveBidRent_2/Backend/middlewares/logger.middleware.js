import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDirectory = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

// Utility function to pad numbers
const pad = (num) => (num > 9 ? num : `0${num}`);

// Generator function for access log filenames
const accessGenerator = (time) => {
  if (!time) return "access.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `access-${year}-${month}-${day}.log`;
};

// Generator function for error log filenames
const errorGenerator = (time) => {
  if (!time) return "error.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `error-${year}-${month}-${day}.log`;
};

// Create rotating file streams
const accessLogStream = createStream(accessGenerator, {
  interval: "1d", // Rotate daily
  path: logsDirectory,
  maxFiles: 14, // Keep 14 days of logs
  compress: "gzip", // Compress old logs
});

const errorLogStream = createStream(errorGenerator, {
  interval: "1d",
  path: logsDirectory,
  maxFiles: 30, // Keep 30 days of error logs
  compress: "gzip",
});

// Custom Morgan tokens for user information
morgan.token("username", (req) => {
  return req.user ? req.user.firstName || req.user.email || "anonymous" : "guest";
});

morgan.token("usertype", (req) => {
  return req.user ? req.user.role || req.user.userType || "none" : "none";
});

morgan.token("userid", (req) => {
  return req.user ? req.user._id?.toString() || req.user.id?.toString() || "-" : "-";
});

morgan.token("body", (req) => {
  // Redact sensitive information from logs
  if (
    req.originalUrl.includes("login") ||
    req.originalUrl.includes("register") ||
    req.originalUrl.includes("password")
  ) {
    return "[REDACTED]";
  }
  try {
    return req.body && Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : "-";
  } catch (error) {
    return "-";
  }
});

morgan.token("ip", (req) => {
  return (
    req.ip ||
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "-"
  );
});

// Define custom format with detailed information
morgan.format(
  "detailed",
  ":date[iso] | :method :url :status | :response-time ms | User: :username | Type: :usertype | ID: :userid | IP: :ip"
);

// Dev logger - for console output in development
const devLogger = morgan("dev", {
  skip: (req) => (
    req.url.includes('/notifications') ||
    req.url.includes('/auction/') ||
    req.url.includes('/buyer/dashboard') ||
    req.url.includes('/wishlist')
  )
});

// Access logger - logs all requests to file with detailed format
const accessLogger = morgan("detailed", { 
  stream: accessLogStream 
});

// Error logger - logs only error responses (4xx, 5xx) to separate file
const errorLogger = morgan("detailed", {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

// Main logger middleware function
const logger = (req, res, next) => {
  accessLogger(req, res, (err) => {
    if (err) return next(err);
    next();
  });
};

export { 
  logger, 
  devLogger, 
  accessLogger, 
  errorLogger, 
  accessLogStream,
  errorLogStream
};
