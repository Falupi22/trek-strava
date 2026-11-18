import { useI18n } from "../i18n";

// Strava brand guidelines: the official "Powered by Strava" logo, unmodified,
// shown separately from (and less prominent than) the app's own branding.
export default function StravaAttribution() {
  const { t } = useI18n();
  return (
    <div className="attribution">
      <img
        src="/api_logo_pwrdBy_strava_horiz_orange.png"
        alt="Powered by Strava"
      />
      <span>{t.common.garminNote}</span>
    </div>
  );
}
