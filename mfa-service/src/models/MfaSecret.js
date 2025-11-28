import mongoose from "mongoose";

const mfaDeviceSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    readableKey: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("MfaDevice", mfaDeviceSchema);
