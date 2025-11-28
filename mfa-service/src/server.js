// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4002;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`mfa-service running on http://localhost:${PORT}`);
  });
});
