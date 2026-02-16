import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';

const DEFAULT_JWT_SECRET = 'default-secret-key-change-it';

function getJwtSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET || DEFAULT_JWT_SECRET);
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

