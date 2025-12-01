import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET;

export function authMiddleware(req, res, next) {
  if (
    req.path.startsWith("/auth/login") ||
    req.path.startsWith("/auth/register")||
     req. path.startsWith("/auth/mfa-status")||
      req.path.startsWith("/mfa/register") ||
     req.path.startsWith("/mfa/internal/verify-otp")
  ) {
    return next(); // public routes
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // attach to request

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
