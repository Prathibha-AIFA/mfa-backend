import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 4001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`auth-service running at http://localhost:${PORT}`));
});
