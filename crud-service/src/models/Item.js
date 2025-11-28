import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: String, // store userId from token as string
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Item", itemSchema);
