import { Schema, model } from "mongoose";

const secretSchema = new Schema(
  {
    token: { type: String, unique: true, required: true },
    encryptedData: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    isBurned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// TTL index (auto-delete after expiration)
secretSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Secret = model("Secret", secretSchema);

export default Secret;
