import { Router } from "express";
import {
  getItems,
  createItem,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// All routes require JWT
router.use(authMiddleware);

router.get("/", getItems);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

export default router;
