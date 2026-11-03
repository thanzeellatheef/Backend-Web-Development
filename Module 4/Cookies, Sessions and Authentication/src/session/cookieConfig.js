
const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = Object.freeze({
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction || process.env.COOKIE_SECURE === 'true',
  path: '/',
  signed: true,
  maxAge: Number(process.env.SESSION_TTL_MS || 3600000),
});

module.exports = { cookieOptions };
