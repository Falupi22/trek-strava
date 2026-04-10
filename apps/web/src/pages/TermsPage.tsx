import { useNavigate } from "react-router-dom";
import StravaAttribution from "../components/StravaAttribution";
import { s, theme } from "../styles";

export default function TermsPage() {
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
            Terms of Service
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
            Acceptance of Terms
          </h2>
          <p>
            By accessing and using CTC Bike Health, you accept and agree to be
            bound by the terms and provision of this agreement.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Strava Data
          </h2>
          <p>
            CTC Bike Health uses the Strava API but is not endorsed or certified
            by Strava. Your use of Strava data within this app is subject to
            the{" "}
            <a
              href="https://www.strava.com/legal/api"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.dark, textDecoration: "underline" }}
            >
              Strava API Agreement
            </a>{" "}
            and the{" "}
            <a
              href="https://www.strava.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: theme.dark, textDecoration: "underline" }}
            >
              Strava Privacy Policy
            </a>
            .
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Use License
          </h2>
          <p>
            Permission is granted to temporarily access the materials
            (information or software) on CTC Bike Health's website for personal,
            non-commercial transitory viewing only.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Disclaimer
          </h2>
          <p>
            The materials on CTC Bike Health's website are provided on an 'as
            is' basis. CTC Bike Health makes no warranties, expressed or
            implied, and hereby disclaims and negates all other warranties
            including without limitation, implied warranties or conditions of
            merchantability, fitness for a particular purpose, or
            non-infringement of intellectual property or other violation of
            rights.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Limitations
          </h2>
          <p>
            In no event shall CTC Bike Health or its suppliers be liable for any
            damages (including, without limitation, damages for loss of data or
            profit, or due to business interruption) arising out of the use or
            inability to use the materials on CTC Bike Health's website, even if
            CTC Bike Health or a CTC Bike Health authorized representative has
            been notified orally or in writing of the possibility of such
            damage.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Accuracy of Materials
          </h2>
          <p>
            The materials appearing on CTC Bike Health's website could include
            technical, typographical, or photographic errors. CTC Bike Health
            does not warrant that any of the materials on its website are
            accurate, complete, or current.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Links
          </h2>
          <p>
            CTC Bike Health has not reviewed all of the sites linked to its
            website and is not responsible for the contents of any such linked
            site. The inclusion of any link does not imply endorsement by CTC
            Bike Health of the site.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Modifications
          </h2>
          <p>
            CTC Bike Health may revise these terms of service for its website at
            any time without notice. By using this website you are agreeing to
            be bound by the then current version of these terms of service.
          </p>

          <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
            Governing Law
          </h2>
          <p>
            These terms and conditions are governed by and construed in
            accordance with the laws of your jurisdiction and you irrevocably
            submit to the exclusive jurisdiction of the courts in that state or
            location.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <StravaAttribution />
        </div>
      </div>
    </>
  );
}
