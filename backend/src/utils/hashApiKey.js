import crypto from "crypto";

export const hashApiKey = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");