require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const logger = require("./utils/logger");
const cron = require("node-cron");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests, please try again later.",
});
app.use("/api/", limiter);

// Routes
const analysisRoutes = require("./routes/analysis");
const quoteRoutes = require("./routes/quote");
const watchlistRoutes = require("./routes/watchlist");
const authRoutes = require("./routes/auth");
const symbolsRoutes = require("./routes/symbols");

app.use("/api/analysis", analysisRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/symbols", symbolsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Scheduler - Daily market close analysis
const { runDailyAnalysis } = require("./services/scheduler");

// Run at 15:45 IST (10:15 UTC)
cron.schedule(
  "15 10 * * 1-5",
  async () => {
    logger.info("Starting end-of-day data fetch...");
    await runDailyAnalysis();
  },
  { timezone: "Asia/Kolkata" },
);

// Error handling
app.use((err, req, res, next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Stock analysis backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
