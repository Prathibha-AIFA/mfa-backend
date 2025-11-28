const express = require("express");
const axios = require("axios");

const router = express.Router();

const CRUD_BASE = process.env.CRUD_SERVICE_URL || "http://localhost:4003";


const getAuthHeaders = (req) => {
  const headers = {};
  if (req.headers.authorization) {
    headers.Authorization = req.headers.authorization;
  }
  return headers;
};

const forward = async (req, res, fn) => {
  try {
    const resp = await fn();
    return res.status(resp.status).json(resp.data);
  } catch (err) {
    console.error("[gateway-crud] error:", err?.response?.data || err.message);
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return res.status(500).json({ message: "CRUD gateway error" });
  }
};


router.get("/", async (req, res) => {
  await forward(req, res, () =>
    axios.get(`${CRUD_BASE}/items`, {
      params: req.query,
      headers: getAuthHeaders(req),
      timeout: 5000,
    })
  );
});


router.post("/", async (req, res) => {
  await forward(req, res, () =>
    axios.post(`${CRUD_BASE}/items`, req.body, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    })
  );
});


router.put("/:id", async (req, res) => {
  const { id } = req.params;
  await forward(req, res, () =>
    axios.put(`${CRUD_BASE}/items/${id}`, req.body, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    })
  );
});


router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await forward(req, res, () =>
    axios.delete(`${CRUD_BASE}/items/${id}`, {
      headers: getAuthHeaders(req),
      timeout: 5000,
    })
  );
});

module.exports = router;
