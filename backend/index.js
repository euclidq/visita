for (const level of ['log', 'warn', 'error']) {
  const original = console[level].bind(console);

  console[level] = (...args) => {
    const timestamp = new Date().toLocaleString('en-PH', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    original(`[${timestamp}]`, ...args);
  };
}

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectMongoDb = require("./config/mongoDb");

const app = express();

// Connect Database
connectMongoDb();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/visit", require("./routes/visit.route"));
app.use("/api/v1/otp", require("./routes/otp.route"));
app.use("/api/v1/auth", require("./routes/auth.route"));

app.get("/", (req, res) => {
  res.send("Visitor Management API");
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
