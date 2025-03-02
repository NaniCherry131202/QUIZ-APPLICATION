import mongoose from "mongoose";

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Ensures only one code per email at a time
  },
  code: {
    type: String,
    required: true,
    length: 6,
  },
  userData: {
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => Date.now() + 10 * 60 * 1000, // 10 minutes expiry
    index: { expires: "10m" }, // TTL index to auto-delete after expiry
  },
});
export default mongoose.model("VerificationCode", verificationCodeSchema);