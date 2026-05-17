import crypto from "crypto";

export function newSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function sha256(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function sessionExpiryDate(days = 7) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}