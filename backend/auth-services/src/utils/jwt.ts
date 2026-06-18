import jwt, { type SignOptions } from "jsonwebtoken";

// Read the secret LAZILY (at call time), not at module load. Top-level reads run
// before dotenv has populated process.env (ES imports evaluate before the
// importing module's body), which would make a boot-time guard throw spuriously.
const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add it to the environment before issuing tokens.");
  }
  return secret;
};

// Configurable token lifetime (default 7 days so users aren't logged out hourly).
const getExpiresIn = (): SignOptions["expiresIn"] =>
  (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

export const signToken = (payload: object) =>
  jwt.sign(payload, getSecret(), { expiresIn: getExpiresIn() });

export const verifyToken = (token: string) => jwt.verify(token, getSecret());
