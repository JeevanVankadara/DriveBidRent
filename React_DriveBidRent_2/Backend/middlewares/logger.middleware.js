import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDirectory = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, { recursive: true });
}

const pad = (num) => (num > 9 ? num : `0${num}`);

const accessGenerator = (time) => {
  if (!time) return "access.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `access-${year}${month}${day}.log`;
};

const errorGenerator = (time) => {
  if (!time) return "error.log";
  const year = time.getFullYear();
  const month = pad(time.getMonth() + 1);
  const day = pad(time.getDate());
  return `error-${year}${month}${day}.log`;
};

const accessLogStream = createStream(accessGenerator, {
  interval: "1d",
  path: logsDirectory,
  maxFiles: 14,
  compress: "gzip",
});

const errorLogStream = createStream(errorGenerator, {
  interval: "1d",
  path: logsDirectory,
  maxFiles: 30,
  compress: "gzip",
});

const devLogger = morgan("dev", {
  skip: (req) => (
    req.url.includes('/notifications') ||
    req.url.includes('/auction/') ||
    req.url.includes('/buyer/dashboard') ||
    req.url.includes('/wishlist')
  )
});

const accessLogger = morgan("combined", { stream: accessLogStream });

const errorLogger = morgan("combined", {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400
});

export { devLogger, accessLogger, errorLogger };
