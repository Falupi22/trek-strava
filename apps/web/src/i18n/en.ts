// English UI strings. This object defines the dictionary's shape: every other
// language must provide exactly the same keys (enforced by the Dict type).
// Keys and stored values (component ids, "Trek", "Good", …) stay in English;
// only what is displayed is translated.
export const en = {
  locale: "en-US",
  dir: "ltr" as "ltr" | "rtl",

  common: {
    beta: "Beta",
    betaTitle: "This app is in beta — features may change and bugs may occur.",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    support: "Support",
    garminNote: "Activity data may include data sourced from Garmin",
    switchLang: "עברית",
    switchLangAria: "החלפה לעברית",
    back: "← Back",
    loading: "This might take a few moments…",
    connecting: "Connecting…",
    yes: "Yes",
    no: "No",
    cancel: "Cancel",
    saving: "Saving…",
    year: "Year",
    month: "Month",
    km: "km",
    m: "m",
    genericError: "Something went wrong. Please try again.",
    yourBike: "Your bike",
  },

  months: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],

  // Display names for the component ids in @bikehealth/shared.
  components: {
    chain: "Chain",
    crank: "Crankset",
    rear_derailleur: "Rear Derailleur",
    front_brake: "Front Brake Pads",
    rear_brake: "Rear Brake Pads",
    bearings: "Bearings",
  } as Record<string, string>,

  // Display names for the HealthLabel values.
  health: {
    Good: "Good",
    Fair: "Fair",
    Replace: "Replace",
  } as Record<string, string>,
  healthAria: (pct: number) => `${pct}% health`,

  connect: {
    features: [
      { icon: "🚵", title: "Built on your real rides", text: "Distance and climbing from your Strava activities drive every estimate." },
      { icon: "⚙️", title: "Six key components", text: "Chain, crankset, rear derailleur, brake pads and bearings." },
      { icon: "🔒", title: "Private by design", text: "Only aggregated totals are kept. Disconnect anytime to delete everything." },
    ],
    heroBefore: "Know when your bike ",
    heroEm: "needs attention",
    heroLead:
      "CTC Bike Health turns your ride history into a clear wear report for each component — so you can service before something fails.",
    getStarted: "Get started",
    connectSub: "Connect your Strava account to build your first report.",
    connectError: "Connection failed. Please try again.",
    scopeError:
      "We need permission to read your activities to calculate component wear. Please connect again and keep “View data about your activities” ticked on Strava's screen.",
    consentBefore: "Data received from Strava will be used for ",
    consentStrong: "personal analysis only",
    consentAfter:
      ". Your information will not be shared with others, used to train models, or stored beyond what is needed for this service.",
    agreeBefore: "I understand and agree to the ",
    agreePrivacy: "privacy policy",
    agreeAnd: " and ",
    agreeTerms: "terms of service",
    consentHint: "Please accept the privacy policy and terms to continue.",
  },

  processing: {
    title: "Hold tight — the wrench is diagnosing your patient",
    messages: [
      "Analyzing ride data…",
      "Checking component wear…",
      "Calculating health scores…",
      "Preparing your report…",
    ],
  },

  setup: {
    eyebrowSetup: "Bike setup",
    eyebrowAdd: "Add bikes",
    titleSetup: "Set up your bikes",
    titleAdd: "Add a bike",
    subtitle:
      "A few details per bike so we can estimate wear from the rides you record on it. You can add as many bikes as you ride.",
    backToDashboard: "Back to dashboard",
    savedListAria: "Bikes added so far",
    bought: (month: string, year: string) => `Bought ${month} ${year}`,
    linked: "linked",
    remove: "Remove",
    removeAria: (name: string) => `Remove ${name}`,
    bikeN: (n: number) => `Bike ${n}`,
    addAnother: "+ Save and add another bike",
    defaultQ: "Which bike should the dashboard open on?",
    defaultHint: "You can switch bikes or change this anytime.",
    finishOrClear: (n: number) => `Finish or clear bike ${n} to continue.`,
    clearIt: "Clear it",
    addOne: "Add bike",
    addMany: (n: number) => `Add ${n} bikes`,
    checkOne: "Check my bike health",
    checkMany: (n: number) => `Check health of ${n} bikes`,
  },

  bikeForm: {
    whatBike: "What bike is it?",
    trekHint: "Pick your model",
    otherBrand: "Other brand",
    otherHint: "Generic estimates",
    model: "Model",
    selectModel: "Select model",
    brandModelOptional: "Brand and model (optional)",
    brandPh: "Brand",
    modelPh: "Model",
    purchaseDate: "Purchase date",
    yearAria: "Year of purchase",
    monthAria: "Month of purchase",
    whichStrava: "Which of your Strava bikes is this?",
    reconnectText: "To match rides to this bike, give us access to your Strava bike list.",
    reconnect: "Reconnect Strava",
    gearError: "Couldn't load your Strava bikes right now. You can link this bike later from the dashboard.",
    gearLoading: "Loading your Strava bikes…",
    notLinked: "Not linked",
    primary: " (primary)",
    retired: " (retired)",
    taken: " (already added)",
    hintLinked: "Wear is calculated only from rides recorded on this Strava bike.",
    hintNoGear: "You have no bikes in Strava, so all your rides count toward this bike.",
    hintUnlinked: "Unlinked bikes count all rides that aren't on a linked Strava bike.",
    replacedQ: "Have any components been replaced since purchase?",
    whichReplaced: "Which components were replaced?",
    replMonthAria: (name: string) => `${name} replacement month`,
    replYearAria: (name: string) => `${name} replacement year`,
  },

  editBike: {
    eyebrow: "Edit bike",
    confirmBefore: "Delete ",
    confirmAfter: " and its component history? Your Strava rides aren't affected.",
    keep: "Keep bike",
    delete: "Delete bike",
    deleting: "Deleting…",
    replacedHint: "To record a replaced part, use “Update component” on its card.",
    save: "Save changes",
  },

  updateComp: {
    eyebrow: "Update component",
    trekStoreQ: "Was this component replaced at a Trek store?",
    sameQ: "Was it replaced with the same component?",
    different: "No — different model",
    newModel: "New model",
    selectBrand: "Select brand / model",
    replacementDate: "Replacement date",
    save: "Save update",
  },

  dash: {
    greetings: {
      midnight: "Burning the midnight oil",
      morning: "Good morning",
      afternoon: "Good afternoon",
      evening: "Good evening",
      night: "Good night",
    },
    motivation: {
      km: "We thought our system crashed from all those kilometers you've been grinding. Got a trail coming up soon? 🚵",
      climb: "How about some flat ground? Your bike does nothing but climb all day — it's not like we've got Everest around here ⛰️",
      default: "Your bike is doing incredible work out there! The wrench is proud of you 🤘",
    },
    advice: {
      bad: "We recommend a shop visit soon.",
      fair: "Still OK — keep an eye on it and ride safe.",
      good: "Looking good. No action needed.",
    },
    distance: "Distance",
    climbing: "Climbing",
    rides: "Rides",
    needsAttention: "Needs attention",
    ofN: (n: number) => `of ${n}`,
    disconnect: "Disconnect",
    tabsAria: "Your bikes",
    allBikes: "All bikes",
    defaultTitle: "Opens by default",
    defaultAria: "(default)",
    addBike: "+ Add bike",
    allSubtitle: (n: number) => `${n} ${n === 1 ? "bike" : "bikes"} · totals across all your rides`,
    ridesOn: (name: string) => `Rides recorded on “${name}”`,
    yourStravaBike: "your Strava bike",
    report: "Component health report",
    defaultPill: "★ Default",
    makeDefault: "☆ Make default",
    editBike: "Edit bike",
    // Strava's brand guidelines require this exact link text in every language.
    viewOnStrava: "View on Strava",
    yourBikes: "Your bikes",
    wearMeta: "Wear counts each bike's rides since purchase",
    beforePurchase: (n: number, count: string, km: string, gear: string, since: string) =>
      `${count} ${n === 1 ? "ride" : "rides"} (${km} km) recorded on “${gear}” in Strava before you bought this bike (${since}) ${n === 1 ? "isn't" : "aren't"} counted toward its wear.`,
    beforePurchaseShort: (n: number, count: string, km: string) =>
      `${count} ${n === 1 ? "ride" : "rides"} (${km} km) from before purchase not counted`,
    countedSince: (km: string, since: string) => `${km} km since ${since}`,
    stravaGear: (name: string) => `Strava: ${name}`,
    notLinkedCard: "Not linked to a Strava bike",
    viewComponents: "View components",
    untracked: (km: string) =>
      `${km} km of your rides were on Strava bikes you haven't added here, or had no bike set.`,
    unlinkedBefore:
      "This bike isn't linked to a Strava bike, so it counts every ride not recorded on one of your linked bikes. ",
    unlinkedLink: "Link it",
    unlinkedAfter: " for accurate wear.",
    componentsTitle: "Components",
    sortedByWear: "Sorted by wear",
    updateComponent: "Update component",
    disclaimer:
      "These results are estimates only. Component failures can occur independently of wear calculations. If in doubt, visit your local shop for a professional inspection.",
    disconnectTitle: "Disconnect Strava?",
    disconnectBefore: "As required by the ",
    disconnectLink: "Strava API Agreement",
    disconnectAfter:
      ", disconnecting will permanently delete all your data from our systems within 48 hours — including your profile, activity statistics, and bike configurations. This cannot be undone.",
    disconnectConfirm: "Yes, disconnect & delete my data",
  },
  notFound: {
    code: "404",
    title: "Page not found",
    text: "The page you're looking for doesn't exist or has moved.",
    home: "Go to the home page",
  },
};

export type Dict = typeof en;
