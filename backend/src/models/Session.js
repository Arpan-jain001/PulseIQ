import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);