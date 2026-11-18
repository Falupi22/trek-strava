import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useI18n } from "../i18n";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function TermsHe() {
  return (
    <>
      <h1>תנאי שימוש</h1>
      <p className="updated">עודכן לאחרונה: נובמבר 2026</p>

      <h2>קבלת התנאים</h2>
      <p>
        בגישה ל-CTC Bike Health ובשימוש בה, אתם מקבלים את תנאי ההסכם הזה
        ומסכימים להיות כפופים להם.
      </p>

      <h2>נתוני Strava</h2>
      <p>
        CTC Bike Health משתמשת ב-Strava API, אך אינה מאושרת או מוסמכת על ידי
        Strava. השימוש שלכם בנתוני Strava באפליקציה כפוף ל
        <a href="https://www.strava.com/legal/api" {...ext}>
          הסכם ה-API של Strava
        </a>{" "}
        ול
        <a href="https://www.strava.com/legal/privacy" {...ext}>
          מדיניות הפרטיות של Strava
        </a>
        .
      </p>

      <h2>רישיון שימוש</h2>
      <p>
        ניתנת הרשאה לגישה זמנית לחומרים (מידע או תוכנה) באתר CTC Bike Health
        לצורך צפייה אישית, לא מסחרית וזמנית בלבד.
      </p>

      <h2>הסתייגות</h2>
      <p>
        החומרים באתר CTC Bike Health מסופקים „כמות שהם” (AS IS). CTC Bike
        Health אינה נותנת כל אחריות, מפורשת או משתמעת, ומתנערת בזאת מכל אחריות
        אחרת, לרבות, ללא הגבלה, אחריות או תנאים משתמעים של סחירות, התאמה
        למטרה מסוימת, או אי-הפרה של קניין רוחני או הפרה אחרת של זכויות.
      </p>

      <h2>הגבלת אחריות</h2>
      <p>
        בשום מקרה לא יהיו CTC Bike Health או ספקיה אחראים לכל נזק (לרבות, ללא
        הגבלה, נזק בגין אובדן נתונים או רווחים, או עקב הפרעה לפעילות עסקית)
        הנובע מהשימוש או מחוסר היכולת להשתמש בחומרים באתר CTC Bike Health, גם
        אם CTC Bike Health או נציג מורשה מטעמה קיבלו הודעה בעל-פה או בכתב על
        האפשרות לנזק כזה.
      </p>

      <h2>דיוק החומרים</h2>
      <p>
        החומרים המופיעים באתר CTC Bike Health עשויים לכלול שגיאות טכניות,
        טיפוגרפיות או צילומיות. CTC Bike Health אינה מתחייבת שהחומרים באתר
        מדויקים, שלמים או עדכניים.
      </p>

      <h2>קישורים</h2>
      <p>
        CTC Bike Health לא בדקה את כל האתרים המקושרים מהאתר שלה ואינה אחראית
        לתוכנו של אתר מקושר כלשהו. הכללת קישור אינה מעידה על המלצה של CTC Bike
        Health על אותו אתר.
      </p>

      <h2>שינויים</h2>
      <p>
        CTC Bike Health רשאית לעדכן את תנאי השימוש באתר בכל עת וללא הודעה
        מוקדמת. בשימוש באתר אתם מסכימים להיות כפופים לגרסה העדכנית של תנאי
        השימוש באותה עת.
      </p>

      <h2>הדין החל</h2>
      <p>
        תנאים אלה כפופים לדין החל במקום מושבכם ויפורשו בהתאם לו, ואתם מקבלים
        באופן בלתי חוזר את הסמכות הבלעדית של בתי המשפט באותה מדינה או באותו
        מקום.
      </p>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="updated">Last updated: November 2026</p>

      <h2>Acceptance of Terms</h2>
      <p>
        By accessing and using CTC Bike Health, you accept and agree to be
        bound by the terms and provision of this agreement.
      </p>

      <h2>Strava Data</h2>
      <p>
        CTC Bike Health uses the Strava API but is not endorsed or certified
        by Strava. Your use of Strava data within this app is subject to
        the{" "}
        <a href="https://www.strava.com/legal/api" {...ext}>
          Strava API Agreement
        </a>{" "}
        and the{" "}
        <a href="https://www.strava.com/legal/privacy" {...ext}>
          Strava Privacy Policy
        </a>
        .
      </p>

      <h2>Use License</h2>
      <p>
        Permission is granted to temporarily access the materials
        (information or software) on CTC Bike Health's website for personal,
        non-commercial transitory viewing only.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The materials on CTC Bike Health's website are provided on an 'as
        is' basis. CTC Bike Health makes no warranties, expressed or
        implied, and hereby disclaims and negates all other warranties
        including without limitation, implied warranties or conditions of
        merchantability, fitness for a particular purpose, or
        non-infringement of intellectual property or other violation of
        rights.
      </p>

      <h2>Limitations</h2>
      <p>
        In no event shall CTC Bike Health or its suppliers be liable for any
        damages (including, without limitation, damages for loss of data or
        profit, or due to business interruption) arising out of the use or
        inability to use the materials on CTC Bike Health's website, even if
        CTC Bike Health or a CTC Bike Health authorized representative has
        been notified orally or in writing of the possibility of such
        damage.
      </p>

      <h2>Accuracy of Materials</h2>
      <p>
        The materials appearing on CTC Bike Health's website could include
        technical, typographical, or photographic errors. CTC Bike Health
        does not warrant that any of the materials on its website are
        accurate, complete, or current.
      </p>

      <h2>Links</h2>
      <p>
        CTC Bike Health has not reviewed all of the sites linked to its
        website and is not responsible for the contents of any such linked
        site. The inclusion of any link does not imply endorsement by CTC
        Bike Health of the site.
      </p>

      <h2>Modifications</h2>
      <p>
        CTC Bike Health may revise these terms of service for its website at
        any time without notice. By using this website you are agreeing to
        be bound by the then current version of these terms of service.
      </p>

      <h2>Governing Law</h2>
      <p>
        These terms and conditions are governed by and construed in
        accordance with the laws of your jurisdiction and you irrevocably
        submit to the exclusive jurisdiction of the courts in that state or
        location.
      </p>
    </>
  );
}

export default function TermsPage() {
  const navigate = useNavigate();
  const { t, lang } = useI18n();

  return (
    <Layout narrow>
      <button
        className="btn btn-link"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        {t.common.back}
      </button>
      <article className="card prose fade-in">
        {lang === "he" ? <TermsHe /> : <TermsEn />}
      </article>
    </Layout>
  );
}
