import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useI18n } from "../i18n";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

function PrivacyHe() {
  return (
    <>
      <h1>מדיניות פרטיות</h1>
      <p className="updated">עודכן לאחרונה: נובמבר 2026</p>

      <h2>הסכמה והרשאה</h2>
      <p>
        לפני שאנו ניגשים לנתוני ה-Strava שלכם, אנו מקבלים את הסכמתכם המפורשת
        באמצעות אימות OAuth 2.0. יוצג לכם מסך הרשאות של Strava המבקש גישה
        לנתוני הפעילות שלכם. ניתן לבטל את ההסכמה בכל עת על ידי ניתוק חשבון
        ה-Strava מלוח הבקרה.
      </p>

      <h2>אילו נתונים אנו אוספים</h2>
      <p>
        CTC Bike Health ניגשת לנתוני חשבון ה-Strava שלכם בהסכמתכם המפורשת.
        באופן ספציפי, אנו אוספים:
      </p>
      <ul>
        <li>את פרופיל הספורטאי שלכם ב-Strava (שם, תמונת פרופיל)</li>
        <li>
          את נתוני פעילות הרכיבה שלכם (מרחק, גובה, ועל אילו אופניים תועדה כל
          רכיבה) לצורך חישוב בלאי רכיבי האופניים
        </li>
        <li>
          את רשימת האופניים בפרופיל ה-Strava שלכם, כדי שתוכלו לקשר כל זוג
          אופניים שאתם עוקבים אחריו כאן לאופניים המתאימים ב-Strava
        </li>
        <li>מידע על רכיבי האופניים שאתם מזינים ידנית</li>
      </ul>

      <h2>כיצד אנו משתמשים בנתונים</h2>
      <p>
        הנתונים שלכם משמשים אך ורק לחישוב ולהצגה של הערכות מצב הרכיבים של
        האופניים שלכם. איננו:
      </p>
      <ul>
        <li>משתפים את הנתונים שלכם עם צדדים שלישיים</li>
        <li>משתמשים בנתונים שלכם לאימון מודלים של למידת מכונה</li>
        <li>משתמשים בנתונים שלכם לפרסום או לניתוח שיווקי</li>
        <li>מוכרים את הנתונים שלכם או מעניקים עליהם רישיון לאיש</li>
      </ul>

      <h2>שמירת נתונים ומטמון</h2>
      <p>
        בעת סנכרון, אנו מושכים את פעילויות ה-Strava שלכם, מסכמים אותן לסיכומים
        מצטברים (מרחק, גובה, מספר פעילויות) — באופן כללי ולכל זוג אופניים
        ב-Strava — ומוחקים מיד את הרשומות הגולמיות. פעילויות בודדות לעולם אינן
        נשמרות במסד הנתונים שלנו. הסיכומים המצטברים מתעדכנים מ-Strava באופן
        שוטף, ואינם נשמרים יותר מ-7 ימים ללא עדכון. עם ניתוק או בקשה למחיקת
        נתונים, כל הנתונים נמחקים לצמיתות מהמערכות שלנו תוך 48 שעות.
      </p>

      <h2>חשבונות לא פעילים</h2>
      <p>
        אם לא תשתמשו באפליקציה במשך 30 יום, נפסיק לסנכרן את נתוני ה-Strava
        שלכם. כעבור 7 ימים נוספים יימחקו סיכומי הפעילות שלכם, וכן השם ותמונת
        הפרופיל שלכם מ-Strava. אנו שומרים את החשבון שלכם, את מזהה הספורטאי
        ב-Strava שמשמש לזיהויו, ואת פרטי האופניים והרכיבים שהזנתם, כך שלא
        תצטרכו להגדיר דבר מחדש: כשתחזרו ותתחברו שוב, נתוני ה-Strava שלכם ייבנו
        מחדש באופן אוטומטי. כדי למחוק את כל הנתונים, נתקו את החשבון.
      </p>

      <h2>אבטחה והצפנה</h2>
      <p>
        כל הנתונים המועברים בין המכשיר שלכם לשרתים שלנו מוצפנים באמצעות HTTPS.
        אנו מקיימים אמצעי אבטחה מקובלים בתעשייה כדי להגן על המידע האישי שלכם
        מפני גישה, שינוי או חשיפה בלתי מורשים. כל חשד לפרצת אבטחה מדווח
        ל-Strava תוך 24 שעות, כנדרש בהסכם ה-API של Strava.
      </p>

      <h2>Strava API</h2>
      <p>
        אפליקציה זו משתמשת ב-Strava API, אך אינה מאושרת או מוסמכת על ידי
        Strava. השימוש שלכם בנתוני Strava באפליקציה כפוף גם ל
        <a href="https://www.strava.com/legal/privacy" {...ext}>
          מדיניות הפרטיות של Strava
        </a>
        . אנו פועלים בהתאם להסכם ה-API של Strava, כולל כל דרישות הגנת המידע
        והפרטיות.
      </p>
      <p>
        שימו לב ש-Strava עשויה לאסוף באופן עצמאי נתוני שימוש הנוגעים לאופן
        שבו אתם משתמשים באפליקציה זו דרך ה-Strava API, בהתאם למדיניות הפרטיות
        שלה.
      </p>
      <p>
        חלק מנתוני הפעילות עשויים להגיע ממכשירי Garmin. במקרים כאלה, הנתונים
        מסופקים על ידי Garmin וכפופים ל
        <a href="https://www.garmin.com/en-US/privacy/global/" {...ext}>
          מדיניות הפרטיות של Garmin
        </a>
        .
      </p>

      <h2>אחסון נתונים</h2>
      <p>
        אנו שומרים סטטיסטיקות פעילות מצטברות (סך המרחק וסך הגובה, באופן כללי
        ולכל זוג אופניים ב-Strava), את האופניים ב-Strava שאליהם מקושר כל זוג
        אופניים שלכם, ואת נתוני האופניים והרכיבים שהזנתם ידנית. רשומות פעילות
        גולמיות מ-Strava אינן נשמרות. נתונים שמקורם ב-Strava נשמרים כמתואר
        בסעיפים "שמירת נתונים ומטמון" ו"חשבונות לא פעילים"; פרטי האופניים
        והרכיבים שהזנתם נשמרים עד שתנתקו את החשבון.
      </p>

      <h2>הזכויות שלכם ומחיקת נתונים</h2>
      <p>
        ניתן לנתק את חשבון ה-Strava בכל עת מלוח הבקרה. הניתוק מוחק לצמיתות את
        כל הנתונים שלכם מהמערכות שלנו תוך 48 שעות, כולל הפרופיל, סטטיסטיקות
        הפעילות והגדרות האופניים. הנתונים שלכם יימחקו גם אם תבטלו את הרשאת
        האפליקציה בהגדרות חשבון ה-Strava, או אם Strava תודיע לנו על ביטול
        ההרשאה.
      </p>
      <p>
        מדיניות פרטיות זו עומדת בדרישות התקנה הכללית להגנת מידע (GDPR) ו-UK
        GDPR. אנו עוקבים אחר מצב החיבור של חשבון ה-Strava שלכם כדי לעמוד
        בדרישות ביטול ההרשאה שבהסכם ה-API של Strava.
      </p>
      <p>
        לבקשת מחיקת נתונים או לכל שאלה בנושא פרטיות, צרו איתנו קשר בכתובת:{" "}
        <a href="https://ctc.co.il" {...ext}>
          ctc.co.il
        </a>
      </p>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="updated">Last updated: November 2026</p>

      <h2>Consent & Authorization</h2>
      <p>
        Before accessing any of your Strava data, we obtain your explicit
        consent through OAuth 2.0 authentication. You will see a permission
        screen from Strava requesting access to your activity data. You can
        withdraw consent at any time by disconnecting your Strava account
        from the dashboard.
      </p>

      <h2>What data we collect</h2>
      <p>
        CTC Bike Health accesses your Strava account data with your explicit
        consent. Specifically, we collect:
      </p>
      <ul>
        <li>Your Strava athlete profile (name, profile photo)</li>
        <li>
          Your cycling activity data (distance, elevation, and which bike
          each ride was recorded on) to calculate bike component wear
        </li>
        <li>
          The list of bikes in your Strava profile, so you can link each
          bike you track here to the matching Strava bike
        </li>
        <li>Bike component information you enter manually</li>
      </ul>

      <h2>How we use your data</h2>
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

      <h2>Data retention & caching</h2>
      <p>
        When you sync, we fetch your Strava activities, aggregate them into
        totals (distance, elevation, activity count) overall and per
        Strava bike, and immediately
        discard the raw records — individual activities are never written to
        our database. Aggregated totals are refreshed from Strava regularly
        and are never kept for more than 7 days without being refreshed. Upon
        disconnection or data deletion requests, all data is permanently
        removed from our systems within 48 hours.
      </p>

      <h2>Inactive accounts</h2>
      <p>
        If you don't use the app for 30 days, we stop syncing your Strava
        data. Seven days later, your activity totals and your Strava name and
        profile photo are deleted. We keep your account, the Strava athlete ID
        that identifies it, and the bike and component details you entered,
        so you don't need to set anything up again: when you return and
        reconnect, your Strava data is rebuilt automatically. To delete
        everything, disconnect your account.
      </p>

      <h2>Security & encryption</h2>
      <p>
        All data transmitted between your device and our servers is
        encrypted using HTTPS. We maintain industry-standard security
        measures to protect your personal data from unauthorized access,
        alteration, or disclosure. Any suspected security breaches are
        reported to Strava within 24 hours as required by the Strava API
        Agreement.
      </p>

      <h2>Strava API</h2>
      <p>
        This application uses the Strava API but is not endorsed or
        certified by Strava. Your use of Strava data within this app is also
        subject to the{" "}
        <a href="https://www.strava.com/legal/privacy" {...ext}>
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
        <a href="https://www.garmin.com/en-US/privacy/global/" {...ext}>
          Garmin's Privacy Policy
        </a>
        .
      </p>

      <h2>Data storage</h2>
      <p>
        We store aggregated activity statistics (total distance, total
        elevation, overall and per Strava bike), the Strava bike each of
        your bikes is linked to, and your manually entered bike/component
        data. Raw Strava activity records are not stored. Data from Strava is
        kept as described under "Data retention & caching" and "Inactive
        accounts"; the bike and component details you entered are kept until
        you disconnect.
      </p>

      <h2>Your rights & data deletion</h2>
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
        <a href="https://ctc.co.il" {...ext}>
          ctc.co.il
        </a>
      </p>
    </>
  );
}

export default function PrivacyPage() {
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
        {lang === "he" ? <PrivacyHe /> : <PrivacyEn />}
      </article>
    </Layout>
  );
}
