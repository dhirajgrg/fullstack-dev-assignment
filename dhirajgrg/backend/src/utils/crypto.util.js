import crypto from "crypto";

export const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const masterKey =process.env.KEY;
 
const ALGORITHM = "aes-256-cbc";
const key = Buffer.from(masterKey, "hex");

export const encryption = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};



export const decryption = (encryptedText) => {
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

