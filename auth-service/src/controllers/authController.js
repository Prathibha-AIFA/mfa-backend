import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET;
const MFA_SERVICE_URL = process.env.MFA_SERVICE_URL || "http://localhost:4002";
console.log("MFA_SERVICE_URL in auth-service:", MFA_SERVICE_URL);

// REGISTER (no MFA key here now)
export async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email,
      passwordHash,
      isMfaRegistered: false,
      mfaKey: null,
    });

    return res.status(201).json({
      id: user._id,
      email: user.email,
      isMfaRegistered: user.isMfaRegistered,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

// MFA status check (used on Login page)
export async function getMfaStatus(req, res, next) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "email required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ exists: false });

    return res.json({
      exists: true,
      isMfaRegistered: user.isMfaRegistered,
    });
  } catch (err) {
    next(err);
  }
}

// LOGIN WITH PASSWORD
export async function loginWithPassword(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mfaVerified: false, // login time lo verify kaadu
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      email: user.email,
      isMfaRegistered: user.isMfaRegistered,
    });
  } catch (err) {
    next(err);
  }
}

// (OLD) Update MFA Flag (internal) – still there if something else uses it
export async function internalSetMfaRegistered(req, res, next) {
  try {
    const { email, isMfaRegistered } = req.body;

    const user = await User.findOneAndUpdate(
      { email },
      { isMfaRegistered },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User Not Found" });

    return res.json({
      email: user.email,
      isMfaRegistered: user.isMfaRegistered,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * NEW: Register MFA key for user
 * Called from Dashboard when we show 16-digit key modal.
 * Route: POST /auth/mfa/register-key
 * Body: { email, readableKey }
 */
export async function registerMfaKey(req, res, next) {
  try {
    const { email, readableKey } = req.body;

    if (!email || !readableKey) {
      return res
        .status(400)
        .json({ message: "email and readableKey are required" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      {
        mfaKey: readableKey,
        isMfaRegistered: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      email: user.email,
      isMfaRegistered: user.isMfaRegistered,
      hasMfaKey: !!user.mfaKey,
    });
  } catch (err) {
    next(err);
  }
}

// LOGIN WITH OTP (for Login page – now uses user's mfaKey)
export async function loginWithOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🚩 MAIN CHANGE: trust mfaKey as indicator
    if (!user.mfaKey) {
      return res.status(400).json({
        message:
          "MFA key not set for this account. Please go to Dashboard and register MFA first.",
      });
    }

    let verifyResp;
    try {
      const url = `${MFA_SERVICE_URL}/mfa/internal/verify-otp`;
      console.log("Calling MFA verify URL (loginWithOtp):", url);

      verifyResp = await axios.post(url, {
        key: user.mfaKey,
        otp,
      });

      console.log("MFA verify response data:", verifyResp.data);
    } catch (err) {
      console.error(
        "Error calling mfa-service /mfa/internal/verify-otp:",
        err.response?.status,
        err.response?.data || err.message
      );
      return res
        .status(502)
        .json({ message: "Failed to verify OTP. MFA service error." });
    }

    const { valid } = verifyResp.data;
    if (!valid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        mfaVerified: true,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      email: user.email,
      isMfaRegistered: true, // since mfaKey exists
      mfaVerified: true,
    });
  } catch (err) {
    next(err);
  }
}


/**
 * NEW: Verify OTP for protected actions (add/delete item)
 * Route: POST /auth/verify-otp-action
 * Body: { email, otp }
 * Frontend: Dashboard lo OTP modal open chesi, idhi hit chesi
 *           success aina tarvata /items create/delete call cheyyali.
 */
export async function verifyOtpAction(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ message: "Email and otp are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }

    // 🚩 MAIN CHANGE: only check mfaKey, not isMfaRegistered
    if (!user.mfaKey) {
      return res.status(400).json({
        message:
          "MFA key not set. Please open Dashboard, generate a 16-digit key and register it in Auth App.",
      });
    }

    let verifyResp;
    try {
      const url = `${MFA_SERVICE_URL}/mfa/internal/verify-otp`;
      console.log("Calling MFA verify URL (verifyOtpAction):", url);

      verifyResp = await axios.post(url, {
        key: user.mfaKey,
        otp,
      });

      console.log("MFA verify response data (action):", verifyResp.data);
    } catch (err) {
      console.error(
        "Error calling mfa-service /mfa/internal/verify-otp:",
        err.response?.status,
        err.response?.data || err.message
      );
      return res
        .status(502)
        .json({ message: "Failed to verify OTP. MFA service error." });
    }

    const { valid } = verifyResp.data;

    if (!valid) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    return res.json({ allowed: true });
  } catch (err) {
    next(err);
  }
}

