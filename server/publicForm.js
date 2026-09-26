/**
 * Helpers for the public (no login) forms: contact, newsletter, comments,
 * event signups and story submissions.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_RE.test(value.trim());
}

/** Trims a value to a string and caps its length. Returns '' for non-strings. */
export function clean(value, max = 500) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * Simple in-memory limiter keyed by IP + route, to slow down spam bots.
 * `max` requests are allowed per `windowMs`.
 */
export function rateLimit({ windowMs = 10 * 60 * 1000, max = 10 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
    } else if (++entry.count > max) {
      return res.status(429).json({ message: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    }
    return next();
  };
}

/**
 * Hidden "website" field that people never see. Bots fill it in, so a filled
 * value means the request is silently accepted and discarded.
 */
export function isBot(body) {
  return Boolean(body && typeof body.website === 'string' && body.website.trim());
}
