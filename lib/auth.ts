import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';

const DEFAULT_JWT_SECRET = 'default-secret-key-change-it';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is not configured');
  }
  return new TextEncoder().encode(secret || DEFAULT_JWT_SECRET);
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value ?? null;
}

export async function getAuthPayload(): Promise<JWTPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getUserIdFromAuth(): Promise<number | null> {
  const payload = await getAuthPayload();
  if (!payload?.sub) return null;

  const id = parseInt(String(payload.sub), 10);
  return Number.isFinite(id) ? id : null;
}
