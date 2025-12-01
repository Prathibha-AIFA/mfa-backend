// src/server.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT,"0.0.0.0",  () => {
    console.log(`mfa-service running on http://localhost:${PORT}`);
  });
});
