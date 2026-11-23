import type { Dict } from "./en";

// Hebrew UI strings (default language). Product and brand names (Strava, Trek,
// Garmin, CTC Bike Health) stay in Latin letters, as is standard in Hebrew UIs.
export const he: Dict = {
  locale: "he-IL",
  dir: "rtl",

  common: {
    beta: "בטא",
    betaTitle: "האפליקציה בגרסת בטא — תכונות עשויות להשתנות וייתכנו תקלות.",
    privacy: "מדיניות פרטיות",
    terms: "תנאי שימוש",
    support: "תמיכה",
    garminNote: "נתוני הפעילות עשויים לכלול נתונים שמקורם ב-Garmin",
    switchLang: "English",
    switchLangAria: "Switch to English",
    back: "→ חזרה",
    loading: "זה עשוי לקחת כמה רגעים…",
    connecting: "מתחברים…",
    yes: "כן",
    no: "לא",
    cancel: "ביטול",
    saving: "שומרים…",
    year: "שנה",
    month: "חודש",
    km: "ק״מ",
    m: "מ׳",
    genericError: "משהו השתבש. נסו שוב.",
    yourBike: "האופניים שלי",
  },

  months: [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
  ],

  components: {
    chain: "שרשרת",
    crank: "קראנק",
    rear_derailleur: "מעביר אחורי",
    front_brake: "רפידות בלם קדמי",
    rear_brake: "רפידות בלם אחורי",
    bearings: "מיסבים",
  },

  health: {
    Good: "תקין",
    Fair: "בינוני",
    Replace: "להחלפה",
  },
  healthAria: (pct: number) => `מצב ${pct}%`,

  connect: {
    features: [
      { icon: "🚵", title: "מבוסס על הרכיבות האמיתיות שלכם", text: "המרחק והטיפוס מפעילויות ה-Strava שלכם עומדים מאחורי כל הערכה." },
      { icon: "⚙️", title: "שישה רכיבים מרכזיים", text: "שרשרת, קראנק, מעביר אחורי, רפידות בלמים ומיסבים." },
      { icon: "🔒", title: "פרטיות כברירת מחדל", text: "נשמרים רק סיכומים מצטברים. אפשר להתנתק בכל עת ולמחוק הכול." },
    ],
    heroBefore: "דעו מתי האופניים שלכם ",
    heroEm: "צריכים טיפול",
    heroLead:
      "CTC Bike Health הופכת את היסטוריית הרכיבות שלכם לדוח בלאי ברור לכל רכיב — כדי שתוכלו לטפל לפני שמשהו נשבר.",
    getStarted: "בואו נתחיל",
    connectSub: "חברו את חשבון ה-Strava שלכם כדי לבנות את הדוח הראשון.",
    connectError: "ההתחברות נכשלה. נסו שוב.",
    scopeError:
      "כדי לחשב את בלאי הרכיבים אנו צריכים הרשאה לקרוא את הפעילויות שלכם. התחברו שוב והשאירו מסומנת את האפשרות לצפייה בנתוני הפעילויות במסך של Strava.",
    consentBefore: "הנתונים שיתקבלו מ-Strava ישמשו ל",
    consentStrong: "ניתוח אישי בלבד",
    consentAfter:
      ". המידע שלכם לא ישותף עם אחרים, לא ישמש לאימון מודלים ולא יישמר מעבר לנדרש לשירות זה.",
    agreeBefore: "קראתי ואני מסכים/ה ל",
    agreePrivacy: "מדיניות הפרטיות",
    agreeAnd: " ול",
    agreeTerms: "תנאי השימוש",
    consentHint: "יש לאשר את מדיניות הפרטיות ותנאי השימוש כדי להמשיך.",
  },

  processing: {
    title: "רגע אחד — המכונאי בודק את המטופל שלכם",
    messages: [
      "מנתחים את נתוני הרכיבה…",
      "בודקים את בלאי הרכיבים…",
      "מחשבים את מצב הרכיבים…",
      "מכינים את הדוח שלכם…",
    ],
  },

  setup: {
    eyebrowSetup: "הגדרת אופניים",
    eyebrowAdd: "הוספת אופניים",
    titleSetup: "הגדירו את האופניים שלכם",
    titleAdd: "הוספת אופניים",
    subtitle:
      "כמה פרטים על כל זוג אופניים, כדי שנוכל להעריך את הבלאי לפי הרכיבות שתתעדו עליהם. אפשר להוסיף כמה אופניים שתרצו.",
    backToDashboard: "חזרה ללוח הבקרה",
    savedListAria: "אופניים שנוספו עד כה",
    bought: (month: string, year: string) => `נקנו ב${month} ${year}`,
    linked: "מקושרים",
    remove: "הסרה",
    removeAria: (name: string) => `הסרת ${name}`,
    bikeN: (n: number) => `אופניים ${n}`,
    addAnother: "+ שמירה והוספת אופניים נוספים",
    defaultQ: "באילו אופניים לוח הבקרה ייפתח?",
    defaultHint: "אפשר להחליף אופניים או לשנות זאת בכל עת.",
    pickDefault: "יש לבחור אופניים כדי להמשיך.",
    finishOrClear: (n: number) => `השלימו או נקו את אופניים ${n} כדי להמשיך.`,
    clearIt: "ניקוי",
    addOne: "הוספת האופניים",
    addMany: (n: number) => `הוספת ${n} זוגות אופניים`,
    checkOne: "בדיקת מצב האופניים",
    checkMany: (n: number) => `בדיקת מצב של ${n} זוגות אופניים`,
  },

  bikeForm: {
    whatBike: "אילו אופניים אלה?",
    trekHint: "בחירת דגם",
    otherBrand: "מותג אחר",
    otherHint: "הערכות כלליות",
    model: "דגם",
    selectModel: "בחירת דגם",
    brandModelOptional: "מותג ודגם (לא חובה)",
    brandPh: "מותג",
    modelPh: "דגם",
    purchaseDate: "תאריך רכישה",
    yearAria: "שנת רכישה",
    monthAria: "חודש רכישה",
    whichStrava: "אילו מהאופניים שלכם ב-Strava אלה?",
    reconnectText: "כדי לשייך רכיבות לאופניים האלה, אשרו לנו גישה לרשימת האופניים שלכם ב-Strava.",
    reconnect: "חיבור מחדש ל-Strava",
    gearError: "לא הצלחנו לטעון כרגע את האופניים שלכם מ-Strava. אפשר לקשר אותם מאוחר יותר מלוח הבקרה.",
    gearLoading: "טוענים את האופניים שלכם מ-Strava…",
    notLinked: "לא מקושרים",
    primary: " (ראשיים)",
    mostRidden: " (הכי בשימוש)",
    retired: " (הוצאו משימוש)",
    taken: " (כבר נוספו)",
    hintLinked: "הבלאי מחושב רק לפי רכיבות שתועדו על האופניים האלה ב-Strava.",
    hintNoGear: "אין לכם אופניים ב-Strava, ולכן כל הרכיבות שלכם נספרות לאופניים האלה.",
    hintUnlinked: "לאופניים לא מקושרים נספרות כל הרכיבות שלא תועדו על אופניים מקושרים.",
    replacedQ: "האם הוחלפו רכיבים מאז הרכישה?",
    whichReplaced: "אילו רכיבים הוחלפו?",
    replDateMissing: "יש לבחור חודש ושנה לכל רכיב מסומן.",
    replMonthAria: (name: string) => `חודש ההחלפה של ${name}`,
    replYearAria: (name: string) => `שנת ההחלפה של ${name}`,
  },

  editBike: {
    eyebrow: "עריכת אופניים",
    confirmBefore: "למחוק את ",
    confirmAfter: " ואת היסטוריית הרכיבים שלהם? הרכיבות שלכם ב-Strava לא יושפעו.",
    keep: "השארת האופניים",
    delete: "מחיקת האופניים",
    deleting: "מוחקים…",
    replacedHint: "כדי לתעד חלק שהוחלף, השתמשו ב״עדכון רכיב״ בכרטיס שלו.",
    save: "שמירת השינויים",
  },

  updateComp: {
    eyebrow: "עדכון רכיב",
    trekStoreQ: "האם הרכיב הוחלף בחנות Trek?",
    sameQ: "האם הוחלף ברכיב זהה?",
    different: "לא — דגם אחר",
    newModel: "דגם חדש",
    selectBrand: "בחירת מותג / דגם",
    replacementDate: "תאריך ההחלפה",
    save: "שמירת העדכון",
  },

  dash: {
    greetings: {
      midnight: "עובדים עד השעות הקטנות",
      morning: "בוקר טוב",
      afternoon: "צהריים טובים",
      evening: "ערב טוב",
      night: "לילה טוב",
    },
    motivation: {
      km: "חשבנו שהמערכת קרסה מכל הקילומטרים שגמעתם. יש סינגל באופק? 🚵",
      climb: "מה דעתכם על קצת מישור? האופניים שלכם רק מטפסים כל היום — זה לא שיש לנו פה את האוורסט ⛰️",
      default: "האופניים שלכם עושים עבודה מדהימה בשטח! המכונאי גאה בכם 🤘",
    },
    advice: {
      bad: "מומלץ לקפוץ בקרוב לחנות.",
      fair: "עדיין בסדר — שימו עין ורכבו בבטחה.",
      good: "נראה מצוין. אין צורך בפעולה.",
    },
    distance: "מרחק",
    climbing: "טיפוס",
    rides: "רכיבות",
    needsAttention: "דורשים תשומת לב",
    ofN: (n: number) => `מתוך ${n}`,
    disconnect: "התנתקות",
    tabsAria: "האופניים שלכם",
    allBikes: "כל האופניים",
    defaultTitle: "נפתחים כברירת מחדל",
    defaultAria: "(ברירת מחדל)",
    addBike: "+ הוספת אופניים",
    allSubtitle: (n: number) =>
      `${n === 1 ? "זוג אופניים אחד" : `${n} זוגות אופניים`} · סיכום כל הרכיבות שלכם`,
    ridesOn: (name: string) => `רכיבות שתועדו על ״${name}״`,
    yourStravaBike: "האופניים שלכם ב-Strava",
    report: "דוח מצב רכיבים",
    defaultPill: "★ ברירת מחדל",
    makeDefault: "☆ הגדרה כברירת מחדל",
    editBike: "עריכת אופניים",
    // Strava's brand guidelines require this exact link text in every language.
    viewOnStrava: "View on Strava",
    yourBikes: "האופניים שלכם",
    wearMeta: "הבלאי מחושב לפי הרכיבות של כל זוג אופניים מאז הרכישה",
    beforePurchase: (n: number, count: string, km: string, gear: string, since: string) =>
      n === 1
        ? `רכיבה אחת (${km} ק״מ) שתועדה על ״${gear}״ ב-Strava לפני שרכשתם את האופניים (${since}) אינה נספרת בחישוב הבלאי.`
        : `${count} רכיבות (${km} ק״מ) שתועדו על ״${gear}״ ב-Strava לפני שרכשתם את האופניים (${since}) אינן נספרות בחישוב הבלאי.`,
    beforePurchaseShort: (n: number, count: string, km: string) =>
      n === 1
        ? `רכיבה אחת (${km} ק״מ) מלפני הרכישה אינה נספרת`
        : `${count} רכיבות (${km} ק״מ) מלפני הרכישה אינן נספרות`,
    countedSince: (km: string, since: string) => `${km} ק״מ מאז ${since}`,
    stravaGear: (name: string) => `Strava: ${name}`,
    notLinkedCard: "לא מקושרים לאופניים ב-Strava",
    viewComponents: "צפייה ברכיבים",
    untracked: (km: string) =>
      `${km} ק״מ מהרכיבות שלכם היו על אופניים ב-Strava שלא הוספתם כאן, או בלי אופניים מוגדרים.`,
    unlinkedBefore:
      "האופניים האלה לא מקושרים לאופניים ב-Strava, ולכן נספרות להם כל הרכיבות שלא תועדו על אופניים מקושרים. ",
    unlinkedLink: "קשרו אותם",
    unlinkedAfter: " לחישוב בלאי מדויק.",
    componentsTitle: "רכיבים",
    sortedByWear: "ממוינים לפי בלאי",
    updateComponent: "עדכון רכיב",
    disclaimer:
      "התוצאות הן הערכה בלבד. רכיבים עלולים להיכשל ללא קשר לחישובי הבלאי. במקרה של ספק, פנו לחנות האופניים הקרובה לבדיקה מקצועית.",
    disconnectTitle: "להתנתק מ-Strava?",
    disconnectBefore: "בהתאם ל",
    disconnectLink: "הסכם ה-API של Strava",
    disconnectAfter:
      ", ההתנתקות תמחק לצמיתות את כל הנתונים שלכם מהמערכות שלנו תוך 48 שעות — כולל הפרופיל, סטטיסטיקות הפעילות והגדרות האופניים. לא ניתן לבטל פעולה זו.",
    disconnectConfirm: "כן, להתנתק ולמחוק את הנתונים שלי",
  },
  notFound: {
    code: "404",
    title: "הדף לא נמצא",
    text: "הדף שחיפשתם לא קיים או שהועבר.",
    home: "חזרה לדף הבית",
  },
};
