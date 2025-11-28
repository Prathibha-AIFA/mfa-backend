const express = require("express");
const axios = require("axios");

const router = express.Router();

const AUTH_BASE = process.env.AUTH_SERVICE_URL || "http://localhost:4001";

const forward = async (res, fn) => {
  try {
    const resp = await fn();
    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error("[gateway-auth] error:", err?.response?.data || err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "Auth gateway error" });
  }
};

// POST /auth/register
router.post("/register", async (req, res) => {
  await forward(res, () =>
    axios.post(`${AUTH_BASE}/auth/register`, req.body, { timeout: 5000 })
  );
});

// ❌ REMOVE THIS: MFA registration should go to MFA service, not auth service
// router.post("/register-mfa", async (req, res) => {
//   await forward(res, () =>
//     axios.post(`${AUTH_BASE}/auth/register-mfa`, req.body, { timeout: 5000 })
//   );
// });

// POST /auth/login-password
router.post("/login-password", async (req, res) => {
  await forward(res, () =>
    axios.post(`${AUTH_BASE}/auth/login-password`, req.body, { timeout: 5000 })
  );
});

// POST /auth/login-otp
router.post("/login-otp", async (req, res) => {
  await forward(res, () =>
    axios.post(`${AUTH_BASE}/auth/login-otp`, req.body, { timeout: 5000 })
  );
});

// GET /auth/check-login-mode
router.get("/check-login-mode", async (req, res) => {
  await forward(res, () =>
    axios.get(`${AUTH_BASE}/auth/check-login-mode`, {
      params: req.query,
      timeout: 5000,
    })
  );
});

// GET /auth/user-by-email
router.get("/user-by-email", async (req, res) => {
  await forward(res, () =>
    axios.get(`${AUTH_BASE}/auth/user-by-email`, {
      params: req.query,
      timeout: 5000,
    })
  );
});

// PATCH /auth/enable-mfa
router.patch("/enable-mfa", async (req, res) => {
  await forward(res, () =>
    axios.patch(`${AUTH_BASE}/auth/enable-mfa`, req.body, { timeout: 5000 })
  );
});

// // ✅ ADD: Debug endpoint to check MFA keys
// router.get("/debug-mfa-keys", async (req, res) => {
//   await forward(res, () =>
//     axios.get(`${AUTH_BASE}/auth/debug-mfa-keys`, { timeout: 5000 })
//   );
// });

module.exports = router;