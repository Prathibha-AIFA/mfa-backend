import { Router } from "express";
import {
  register,
  getMfaStatus,
  loginWithPassword,
  internalSetMfaRegistered,
  loginWithOtp,
  registerMfaKey,      // NEW
  verifyOtpAction,     // NEW
} from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.get("/mfa-status", getMfaStatus);

router.post("/login/password", loginWithPassword);
router.post("/login/otp", loginWithOtp);

// OLD internal endpoint (optional)
router.patch("/internal/set-mfa-registered", internalSetMfaRegistered);

// NEW: Save 16-digit key for user (called from Dashboard)
router.post("/mfa/register-key", registerMfaKey);

// NEW: Verify OTP for actions like add/delete item
router.post("/verify-otp-action", verifyOtpAction);

export default router;
