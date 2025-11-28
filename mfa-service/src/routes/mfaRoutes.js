// src/routes/mfaRoutes.js
import { Router } from "express";
import { registerMfa, verifyOtp } from "../controllers/mfaController.js";

const router = Router();

// For Auth App frontend
router.post("/register", registerMfa);

// For auth-service only (internal)
router.post("/internal/verify-otp", verifyOtp);

export default router;
