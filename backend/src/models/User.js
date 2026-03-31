import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, minlength: 6 },

    googleId: String,
    avatar: String,

    // ✅ Added companyName — used by Signup form for ORGANIZER role
    companyName: { type: String, trim: true, default: null },

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

    emailVerified: { type: Boolean, default: false },

    emailVerificationToken: String,
    emailVerificationOTP: String,
    emailVerificationExpire: Date,

     // Reset password
resetPasswordToken: String,
resetPasswordOTP: String,
resetPasswordExpire: Date,

// 🔐 Login alert security
loginAlertToken: String,
loginAlertExpire: Date,

    // ✅ select: false — must use .select("+refreshToken") explicitly
    refreshToken: { type: String, default: "", select: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

/* 🔐 HASH PASSWORD before save */
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

/* 🔑 COMPARE PASSWORD */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);