const ErrorResponse = require("../utils/errorResponse");
const formatErrorKeyValueJSON = require("../utils/formatErrorKeyValueJSON");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // missing id, malformed id, id not in DB
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // email already in DB, for creation
  if (err.code === 11000) {
		const dup = formatErrorKeyValueJSON(err.keyValue);
    const message = `Duplicate field value entered: ${dup}`;
    error = new ErrorResponse(message, 400);
  }

  // when required fields are missing, for creation
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || "Server Error" });
};

module.exports = errorHandler;
