import { theme } from "../styles";

export default function StravaAttribution() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        margin: "12px 0 0",
      }}
    >
      <img
        src="/api_logo_pwrdBy_strava_horiz_orange.png"
        alt="Powered by Strava"
        style={{ height: 20 }}
      />
      <span style={{ color: theme.muted, fontSize: 11 }}>
        Activity data may include data sourced from Garmin
      </span>
    </div>
  );
}
