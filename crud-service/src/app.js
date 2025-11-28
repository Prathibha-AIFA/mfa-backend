import express from "express";
import cors from "cors";
import itemRoutes from "./routes/itemRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "crud-service" });
});

// mount under /items
app.use("/items", itemRoutes);

app.use(errorHandler);

export default app;
