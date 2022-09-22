const express = require("express");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");

// Route files
const entries = require("./routes/entries");

dotenv.config({ path: "./config/config.env" });

connectDB();

const PORT = process.env.PORT || 5000;

const app = express();
// Parse JSON
app.use(express.json());

// app.use(logger);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use("/api/v1/entries", entries);
app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
