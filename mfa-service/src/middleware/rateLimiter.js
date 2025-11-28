const rateLimit = require("express-rate-limit");


const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: "Too many OTP attempts. Please try again after 15 minutes."
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

module.exports = { otpRateLimiter };