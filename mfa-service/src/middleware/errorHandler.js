// src/middleware/errorHandler.js
export function errorHandler(err, req, res, next) {
  console.error("Error:", err);
  if (err.response && err.response.data) {
    // axios error from auth-service etc
    console.error("Upstream error data:", err.response.data);
  }
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Internal server error (mfa-service)" });
}
