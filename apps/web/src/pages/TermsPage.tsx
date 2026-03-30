import { useNavigate } from "react-router-dom";
import { s, theme } from "../styles";

export default function TermsPage() {
  const navigate = useNavigate();

  return (
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
          By accessing and using BikeHealth, you accept and agree to be bound by
          the terms and provision of this agreement.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Use License
        </h2>
        <p>
          Permission is granted to temporarily access the materials (information
          or software) on BikeHealth's website for personal, non-commercial
          transitory viewing only.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Disclaimer
        </h2>
        <p>
          The materials on BikeHealth's website are provided on an 'as is'
          basis. BikeHealth makes no warranties, expressed or implied, and
          hereby disclaims and negates all other warranties including without
          limitation, implied warranties or conditions of merchantability,
          fitness for a particular purpose, or non-infringement of intellectual
          property or other violation of rights.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Limitations
        </h2>
        <p>
          In no event shall BikeHealth or its suppliers be liable for any
          damages (including, without limitation, damages for loss of data or
          profit, or due to business interruption) arising out of the use or
          inability to use the materials on BikeHealth's website, even if
          BikeHealth or a BikeHealth authorized representative has been notified
          orally or in writing of the possibility of such damage.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Accuracy of Materials
        </h2>
        <p>
          The materials appearing on BikeHealth's website could include
          technical, typographical, or photographic errors. BikeHealth does not
          warrant that any of the materials on its website are accurate,
          complete, or current.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Links
        </h2>
        <p>
          BikeHealth has not reviewed all of the sites linked to its website and
          is not responsible for the contents of any such linked site. The
          inclusion of any link does not imply endorsement by BikeHealth of the
          site.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Modifications
        </h2>
        <p>
          BikeHealth may revise these terms of service for its website at any
          time without notice. By using this website you are agreeing to be
          bound by the then current version of these terms of service.
        </p>

        <h2 style={{ color: theme.dark, fontSize: 16, marginBottom: 8 }}>
          Governing Law
        </h2>
        <p>
          These terms and conditions are governed by and construed in accordance
          with the laws of your jurisdiction and you irrevocably submit to the
          exclusive jurisdiction of the courts in that state or location.
        </p>
      </div>
    </div>
  );
}
