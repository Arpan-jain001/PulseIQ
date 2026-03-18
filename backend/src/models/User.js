import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ORGANIZER", "USER"],
      default: "USER",
    },

    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED", "BANNED"],
      default: "ACTIVE",
    },

    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    refreshToken: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ================= PASSWORD HASH (Mongoose v7 SAFE) ================= */

userSchema.pre("save", async function () {
  // password change nahi hua to skip
  if (!this.isModified("password")) return;

  // hash password
  this.password = await bcrypt.hash(this.password, 12);
});

/* ================= PASSWORD MATCH ================= */

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/* ================= EXPORT ================= */

export default mongoose.model("User", userSchema);