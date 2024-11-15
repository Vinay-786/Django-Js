import { decode, sign, verify } from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return Bun.password.hash(password, {
    algorithm: "argon2d",
    memoryCost: 4,
    timeCost: SALT_ROUNDS,
  });
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return Bun.password.verify(plainTextPassword, hashedPassword);
}

export type Payload = {
  sub: string,
  role: string
  exp: Date
}

const payload = {
  sub: 'user123',
  role: 'admin',
  exp: Math.floor(Date.now() / 1000) + 60 * 5, // Token expires in 5 minutes
}

export function SignToken(){
  return sign(payload, process.env.TOKEN!);
}
