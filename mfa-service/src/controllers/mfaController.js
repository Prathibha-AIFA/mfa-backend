import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { verifyTotp } from "../utils/totp.js";
import MfaDevice from "../models/MfaSecret.js"; // still used only in registerMfa (optional)

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

// helper to mask email "pra****@***.com"
function maskEmail(email) {
  const [user, domain] = email.split("@");
  const maskedUser =
    user.length <= 2
      ? user[0] + "*"
      : user.slice(0, 2) + "*".repeat(Math.max(user.length - 2, 1));

  const domainParts = domain.split(".");
  const maskedDomain = "***." + domainParts[domainParts.length - 1];

  return maskedUser + "@" + maskedDomain;
}

/**
 * POST /mfa/register
 *
 * ⚠ NOTE:
 *  TL requirement prakaaram, Auth App ki backend avasaram ledu.
 *  So ideally, this endpoint won't be called from Auth App anymore.
 *
 *  But we keep it for now (if you still want to register MFA from Auth App or
 *  for any internal tools). It still uses email + readableKey and marks
 *  isMfaRegistered = true in auth-service.
 */
export async function registerMfa(req, res, next) {
  try {
    const { email, readableKey } = req.body;

    if (!email || !readableKey) {
      return res
        .status(400)
        .json({ message: "email and readableKey are required" });
    }

    // 1) confirm user exists in auth-service
    const statusResp = await axios.get(`${AUTH_SERVICE_URL}/auth/mfa-status`, {
      params: { email },
    });

    if (!statusResp.data.exists) {
      return res
        .status(404)
        .json({ message: "User not found in auth-service" });
    }

    // 2) save/update device (upsert)
    let device = await MfaDevice.findOne({ email });

    if (!device) {
      device = await MfaDevice.create({ email, readableKey });
    } else {
      device.readableKey = readableKey;
      await device.save();
    }

    // 3) mark isMfaRegistered = true in auth-service
    await axios.patch(`${AUTH_SERVICE_URL}/auth/internal/set-mfa-registered`, {
      email,
      isMfaRegistered: true,
    });

    return res.status(201).json({
      email,
      maskedEmail: maskEmail(email),
      message: "MFA registered successfully",
    });
  } catch (err) {
    console.error("Error in registerMfa:", err?.response?.data || err.message);
    next(err);
  }
}

/**
 * POST /mfa/internal/verify-otp
 *
 * OLD: { email, otp }  → DB nundi key find chesi verify cheyyadam
 * NEW: { key, otp }    → directly provided key + time tho OTP verify
 *
 * Reason:
 *  - Auth App completely frontend, user arbitrary key trace chesthadu.
 *  - Main app / auth-service daggara authenticated user daggara
 *    original key store untundi (mfaKey).
 *  - auth-service → mfa-service ki **stored key** + **user OTP** pampistundi.
 *  - mfa-service just math chesi verify chestundi.
 */
export async function verifyOtp(req, res, next) {
  try {
    const { key, otp } = req.body;

    if (!key || !otp) {
      return res
        .status(400)
        .json({ message: "key and otp are required" });
    }

    // Main logic: verify TOTP using provided key (16-digit secret)
    const isValid = verifyTotp(key, otp);

    return res.json({ valid: isValid });
  } catch (err) {
    next(err);
  }
}
