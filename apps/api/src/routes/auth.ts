import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { encrypt } from "../encryption.js";
import { signSession } from "../session.js";
import { exchangeCode, revokeToken } from "../strava.js";
import { requireAuth } from "../middleware/requireAuth.js";

export async function authRoutes(app: FastifyInstance) {
  // Redirect to Strava OAuth
  app.get("/auth/strava", async (req, reply) => {
    console.log("Initiating Strava OAuth flow");
    const params = new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID ?? "",
      redirect_uri: process.env.STRAVA_REDIRECT_URI ?? "",
      response_type: "code",
      scope: "activity:read_all",
      approval_prompt: "auto",
    });
    return reply.redirect(`https://www.strava.com/oauth/authorize?${params}`);
  });

  // OAuth callback
  app.get<{ Querystring: { code?: string; error?: string } }>(
    "/auth/strava/callback",
    async (req, reply) => {
      const { code, error } = req.query;
      const webBase = process.env.CORS_ORIGIN ?? "http://localhost:6000";

      if (error || !code) {
        return reply.redirect(`${webBase}/?error=strava_denied`);
      }

      try {
        const { accessToken, refreshToken, expiresAt, athlete } =
          await exchangeCode(code);

        const user = await prisma.user.upsert({
          where: { stravaAthleteId: BigInt(athlete.id) },
          create: {
            stravaAthleteId: BigInt(athlete.id),
            displayName: `${athlete.firstname} ${athlete.lastname}`,
            profileImageUrl: athlete.profile,
          },
          update: {
            displayName: `${athlete.firstname} ${athlete.lastname}`,
            profileImageUrl: athlete.profile,
          },
        });

        await prisma.stravaToken.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            accessTokenEnc: encrypt(accessToken),
            refreshTokenEnc: encrypt(refreshToken),
            expiresAt,
          },
          update: {
            accessTokenEnc: encrypt(accessToken),
            refreshTokenEnc: encrypt(refreshToken),
            expiresAt,
          },
        });

        const sessionToken = await signSession({
          userId: user.id,
          stravaAthleteId: athlete.id,
        });

        // Deliver the session as an httpOnly cookie rather than a URL query
        // param, so the token never lands in logs, browser history, or Referer
        // headers. Same-origin (nginx proxies /api + /auth), so SameSite=Lax is
        // sufficient and covers the top-level OAuth redirect.
        reply.setCookie("session", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 24 * 60 * 60, // 30 days, matches the JWT TTL
        });

        return reply.redirect(`${webBase}/callback`);
      } catch (e) {
        console.error("[auth] callback error:", e);
        return reply.redirect(`${webBase}/?error=auth_failed`);
      }
    },
  );

  // Get current user
  app.get("/auth/me", { preHandler: requireAuth }, async (req, reply) => {
    const session = (req as any).session;
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) return reply.status(404).send({ error: "User not found" });
    return {
      id: user.id,
      stravaAthleteId: user.stravaAthleteId.toString(),
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      stravaConnected: true,
    };
  });

  // Disconnect Strava + delete all user data (GDPR / Strava compliance)
  app.post(
    "/auth/disconnect",
    { preHandler: requireAuth },
    async (req, reply) => {
      const session = (req as any).session;
      await revokeToken(session.userId).catch(() => {}); // best-effort; delete proceeds regardless
      await prisma.user.delete({ where: { id: session.userId } });
      reply.clearCookie("session", { path: "/" });
      return { success: true };
    },
  );
}
