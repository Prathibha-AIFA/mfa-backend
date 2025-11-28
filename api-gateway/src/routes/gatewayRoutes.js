// src/routes/gatewayRoutes.js
import { Router } from "express";
import axios from "axios";

const router = Router();

// env URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL,
  mfa: process.env.MFA_SERVICE_URL,
  items: process.env.CRUD_SERVICE_URL,
};

async function proxy(req, res) {
  try {
    const base = req.path.split("/")[1]; // "auth" | "mfa" | "items"
    const serviceUrl = services[base];

    const url = `${serviceUrl}${req.path}`;

    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      params: req.query,
      headers: { Authorization: req.headers.authorization || "" },
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Gateway Error:", err?.response?.data || err.message);

    return res.status(err?.response?.status || 500).json(
      err?.response?.data || {
        message: "Gateway Internal Error",
      }
    );
  }
}

router.use(proxy);

export default router;
