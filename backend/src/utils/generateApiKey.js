import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export const generateApiKey = () => {
  const raw = `pk_${uuidv4().replaceAll("-", "")}`;
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
};

export const hashApiKey = (raw) =>
  crypto.createHash("sha256").update(raw).digest("hex");
