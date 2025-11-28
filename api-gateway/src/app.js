// src/app.js
import express from "express";
import cors from "cors";
import { authMiddleware } from "./middleware/authMiddleware.js";
import gatewayRoutes from "./routes/gatewayRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

app.use(authMiddleware);      // global auth
app.use("/", gatewayRoutes);  // proxy

export default app;
