// src/app.js
import express from "express";
import cors from "cors";
import mfaRoutes from "./routes/mfaRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "mfa-service" });
});

app.use("/mfa", mfaRoutes);

app.use(errorHandler);

export default app;
