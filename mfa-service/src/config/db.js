
import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected (mfa-service)");
  } catch (err) {
    console.error("MongoDB connection error (mfa-service):", err);
    process.exit(1);
  }
}
