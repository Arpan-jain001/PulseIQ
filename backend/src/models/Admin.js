import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permissions: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);