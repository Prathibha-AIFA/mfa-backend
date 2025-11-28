const express = require("express");
const axios = require("axios");

const router = express.Router();

const MFA_BASE = process.env.MFA_SERVICE_URL || "http://localhost:4002";

const forward = async (res, fn) => {
  try {
    const resp = await fn();
    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error(
      "[gateway-mfa] error:",
      err?.response?.data || err.message
    );
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "MFA gateway error" });
  }
};

// POST /mfa/register → MFA_SERVICE /mfa/register
router.post("/register", async (req, res) => {
  await forward(res, () =>
    axios.post(`${MFA_BASE}/mfa/register`, req.body, {
      timeout: 5000,
    })
  );
});

// POST /mfa/verify → MFA_SERVICE /mfa/verify
router.post("/verify", async (req, res) => {
  await forward(res, () =>
    axios.post(`${MFA_BASE}/mfa/verify`, req.body, {
      timeout: 5000,
    })
  );
});

// // GET /mfa/current-otp?userId=... → MFA_SERVICE /mfa/current-otp
// router.get("/current-otp", async (req, res) => {
//   await forward(res, () =>
//     axios.get(`${MFA_BASE}/mfa/current-otp`, {
//       params: req.query,
//       timeout: 5000,
//     })
//   );
// });

// // POST /mfa/get-user-by-key → MFA_SERVICE /mfa/get-user-by-key
// router.post("/get-user-by-key", async (req, res) => {
//   await forward(res, () =>
//     axios.post(`${MFA_BASE}/mfa/get-user-by-key`, req.body, {
//       timeout: 5000,
//     })
//   );
// });

module.exports = router;