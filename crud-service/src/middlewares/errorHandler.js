export function errorHandler(err, req, res, next) {
  console.error("Error (crud-service):", err);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: "Internal server error (crud-service)" });
}
