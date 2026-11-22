import type { FastifyRequest, FastifyReply } from "fastify";

// Per-user limits for endpoints that spend the app's shared Strava API budget
// (100 requests / 15 min across ALL users — see strava.ts). The global per-IP
// limiter can't protect that budget on its own: one logged-in user could still
// drain it for everyone. Must run after requireAuth (needs req.session).
//
// In-memory is fine: the API runs as a single replica (see docker-compose).

const hits = new Map<string, number[]>();

export function userRateLimit(name: string, max: number, windowMs: number) {
  return async function (req: FastifyRequest, reply: FastifyReply) {
    const userId: string | undefined = (req as any).session?.userId;
    if (!userId) return; // requireAuth already rejected the request

    const key = `${name}:${userId}`;
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs);

    if (recent.length >= max) {
      hits.set(key, recent);
      const retryAfter = Math.ceil((recent[0] + windowMs - now) / 1000);
      reply.header("Retry-After", String(retryAfter));
      return reply.status(429).send({
        error: "Too many requests. Please wait a few minutes and try again.",
      });
    }

    recent.push(now);
    hits.set(key, recent);
  };
}

// Drop expired entries so the map doesn't grow without bound.
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000; // longest window in use
  for (const [key, times] of hits) {
    if (times.every((t) => t < cutoff)) hits.delete(key);
  }
}, 10 * 60 * 1000).unref();
