import { useNavigate } from "react-router-dom";
import StravaAttribution from "../components/StravaAttribution";
import { s, theme } from "../styles";

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <>
      <div style={s.screen}>
        <div
          style={{
            ...s.card,
            maxWidth: 640,
            textAlign: "left",
            lineHeight: 1.7,
            color: theme.mid,
            fontSize: 14,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "none",
              border: "none",
              color: theme.dark,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
              marginBottom: 24,
            }}
          >
            ← Back
          </button>

          <h1 style={{ ...s.title, textAlign: "left", marginBottom: 4 }}>
            Privacy Policy
          </h1>
          <p
            style={{
              color: theme.muted,
              fontSize: 12,
              marginTop: 0,
              marginBottom: 32,
            }}
          >
            Last updated: March 2026
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Consent & Authorization
          </h2>
          <p>
            Before accessing any of your Strava data, we obtain your explicit
            consent through OAuth 2.0 authentication. You will see a permission
            screen from Strava requesting access to your activity data. You can
            withdraw consent at any time by disconnecting your Strava account
            from the dashboard.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            What data we collect
          </h2>
          <p>
            CTC Bike Health accesses your Strava account data with your explicit
            consent. Specifically, we collect:
          </p>
          <ul>
            <li>Your Strava athlete profile (name, profile photo)</li>
            <li>
              Your cycling activity data (distance, elevation) to calculate bike
              component wear
            </li>
            <li>Bike component information you enter manually</li>
          </ul>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            How we use your data
          </h2>
          <p>
            Your data is used exclusively to calculate and display component
            health estimates for your own bikes. We do not:
          </p>
          <ul>
            <li>Share your data with third parties</li>
            <li>Use your data to train machine learning models</li>
            <li>Use your data for advertising or analytics</li>
            <li>Sell or license your data to anyone</li>
          </ul>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Data retention & caching
          </h2>
          <p>
            When you sync, we fetch your Strava activities, aggregate them into
            totals (distance, elevation, activity count), and immediately
            discard the raw records — individual activities are never written to
            our database. Aggregated totals are kept only while your account is
            active. Upon disconnection or data deletion requests, all data is
            permanently removed from our systems within 48 hours.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Security & encryption
          </h2>
          <p>
            All data transmitted between your device and our servers is
            encrypted using HTTPS. We maintain industry-standard security
            measures to protect your personal data from unauthorized access,
            alteration, or disclosure. Any suspected security breaches are
            reported to Strava within 24 hours as required by the Strava API
            Agreement.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Strava API
          </h2>
          <p>
            This application uses the Strava API but is not endorsed or
            certified by Strava. Your use of Strava data within this app is also
            subject to the{" "}
            <a
              href="https://www.strava.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.dark, textDecoration: "underline" }}
            >
              Strava Privacy Policy
            </a>
            . We comply with the Strava API Agreement, including all data
            protection and privacy requirements.
          </p>
          <p>
            Please note that Strava may independently collect usage data related
            to how you interact with this application through the Strava API, in
            accordance with their own privacy policy.
          </p>
          <p>
            Some activity data may originate from Garmin devices. Where
            applicable, such data is provided by Garmin and subject to{" "}
            <a
              href="https://www.garmin.com/en-US/privacy/app-privacy/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.dark, textDecoration: "underline" }}
            >
              Garmin's Privacy Policy
            </a>
            .
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Data storage
          </h2>
          <p>
            We store aggregated activity statistics (total distance, total
            elevation) and your manually entered bike/component data. Raw Strava
            activity records are not stored. Data is kept only as long as your
            account is active.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Your rights & data deletion
          </h2>
          <p>
            You can disconnect your Strava account at any time from the
            dashboard. Disconnecting permanently deletes all your data from our
            systems within 48 hours, including your profile, activity
            statistics, and bike configurations. Your data will also be deleted
            if you deauthorize this app through your Strava account settings or
            if Strava notifies us of deauthorization.
          </p>
          <p>
            This privacy policy complies with the General Data Protection
            Regulation (GDPR) and UK GDPR requirements. We monitor your Strava
            account connection status to ensure compliance with deauthorization
            requirements under the Strava API Agreement.
          </p>
          <p>
            To request data deletion or for any privacy questions, contact us
            at:{" "}
            <a
              href="talfru22@gmail.com"
              style={{ color: theme.dark, textDecoration: "underline" }}
            >
              talfru22@gmail.com
            </a>
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <StravaAttribution />
        </div>
      </div>
    </>
  );
}
