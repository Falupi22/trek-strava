import { theme } from "../styles";

export default function StravaAttribution() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginBottom: 30,
        color: theme.muted,
        fontSize: 12,
      }}
    >
      <img
        src="/api_logo_pwrdBy_strava_horiz_orange.png"
        alt="Powered by Strava"
        style={{ height: 20, opacity: 0.9 }}
      />
    </div>
  );
}
