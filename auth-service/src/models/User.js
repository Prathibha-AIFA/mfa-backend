import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },

    // is user onboarded to MFA?
    isMfaRegistered: { type: Boolean, default: false },

    // NEW: 16-digit key stored per user
    mfaKey: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
