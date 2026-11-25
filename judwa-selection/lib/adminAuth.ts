import crypto from 'crypto';

export const ADMIN_COOKIE = 'judwa_admin';
export const SESSION_DAYS = 7;

function sign(value: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

/** Token format: "<expiryMs>.<hmac>" — stateless, signed with ADMIN_SECRET_KEY. */
export function createAdminToken(): string | null {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) return null;
  const expires = String(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${expires}.${sign(expires, secret)}`;
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, sign(expires, secret));
}

export function isCorrectAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string') return false;
  return safeEqual(password, expected);
}
