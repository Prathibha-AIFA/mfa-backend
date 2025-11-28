// src/utils/totp.js
import crypto from "crypto";

/**
 * Convert number -> 8-byte buffer (big-endian)
 */
function intToBuffer(num) {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(num));
  return buf;
}

/**
 * Generate TOTP (6 digits) for given secret and timeStep
 * secret: string (we’ll use readableKey itself)
 */
function generateTotpForStep(secret, timeStep) {
  const key = Buffer.from(secret, "utf8");
  const msg = intToBuffer(timeStep);

  const hmac = crypto.createHmac("sha1", key).update(msg).digest();

  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

/**
 * Generate TOTP for now
 */
export function generateCurrentTotp(secret) {
  const timeStep = Math.floor(Date.now() / 1000 / 30); // 30-sec window
  return generateTotpForStep(secret, timeStep);
}

/**
 * Verify TOTP with small window (current, previous, next)
 */
export function verifyTotp(secret, otp) {
  const timeStep = Math.floor(Date.now() / 1000 / 30);

  const windows = [0, -1, 1];
  for (const w of windows) {
    const code = generateTotpForStep(secret, timeStep + w);
    if (code === otp) {
      return true;
    }
  }
  return false;
}
