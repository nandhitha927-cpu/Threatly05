import type { SupportedLang } from "./languages";

/**
 * UI translations. English is the fallback for any missing key, so new
 * languages can be added incrementally.
 */
export type UIStrings = {
  appName: string;
  tagline: string;
  console: string;
  analytics: string;
  settings: string;
  signOut: string;
  analyzedCount: string;
  threats: string;
  settingsTitle: string;
  settingsDesc: string;
  languageSection: string;
  languageDesc: string;
  autoDetect: string;
  autoDetectDesc: string;
  currentPref: string;
  prefApplied: string;
  engineSection: string;
  engineTitle: string;
  engineDesc: string;
  engineOn: string;
  heroSubtitle: string;
  analyzeTitle: string;
  analyzeDesc: string;
  inputPlaceholder: string;
  domainPlaceholder: string;
  analyzeMessage: string;
  reset: string;
};

const en: UIStrings = {
  appName: "Threatly Console",
  tagline: "Customer Support Intelligence & Phishing Threat Detection",
  console: "Console",
  analytics: "Analytics",
  settings: "Settings",
  signOut: "Sign out",
  analyzedCount: "analyzed",
  threats: "threats",
  settingsTitle: "Settings",
  settingsDesc: "Tune how Threatly analyzes and presents your conversations.",
  languageSection: "Analysis language",
  languageDesc:
    "Choose Auto-detect to identify each message's language automatically, or pin a language so every message is analyzed with that lexicon.",
  autoDetect: "Auto-detect",
  autoDetectDesc: "Identify the language of every message automatically (English fallback).",
  currentPref: "Current preference",
  prefApplied:
    "This preference is saved on this device and applies to every new analysis.",
  engineSection: "Analysis engine",
  engineTitle: "Rule-based intelligence engine",
  engineDesc:
    "Classification, sentiment, summarization, URL/sender forensics, and social-engineering detection run fully in your browser — no data leaves this device.",
  engineOn: "Active",
  analyzeTitle: "Analyze a conversation",
  analyzeDesc:
    "Paste a customer email, chat or ticket — get support intelligence and a phishing verdict in one pass.",
  inputPlaceholder: "Paste the customer message here…",
  domainPlaceholder: "Your org domain (e.g. acme.com) — improves sender checks",
  analyzeMessage: "Analyze message",
  reset: "Reset",
  heroSubtitle:
    "Threatly analyzes customer emails, chats and tickets to extract complaint categories, sentiment and recurring issues — while scanning the same conversation for phishing URLs, lookalike senders and social-engineering attacks aimed at your support team.",
};

const es: UIStrings = {
  ...en,
  tagline: "Inteligencia de soporte al cliente y detección de amenazas de phishing",
  console: "Consola",
  analytics: "Analítica",
  settings: "Ajustes",
  signOut: "Cerrar sesión",
  analyzedCount: "analizados",
  threats: "amenazas",
  settingsTitle: "Ajustes",
  settingsDesc: "Configura cómo Threatly analiza y presenta tus conversaciones.",
  languageSection: "Idioma de análisis",
  languageDesc:
    "Elige Detección automática para identificar el idioma de cada mensaje, o fija un idioma para que todos los mensajes se analicen con ese léxico.",
  autoDetectDesc:
    "Identifica automáticamente el idioma de cada mensaje (con inglés como alternativa).",
  currentPref: "Preferencia actual",
  prefApplied:
    "Esta preferencia se guarda en este dispositivo y se aplica a cada análisis nuevo.",
  engineTitle: "Motor de inteligencia basado en reglas",
  engineDesc:
    "Clasificación, sentimiento, resúmenes, análisis de URL/remitente y detección de ingeniería social se ejecutan en tu navegador — los datos nunca salen de este dispositivo.",
  engineOn: "Activo",
  analyzeTitle: "Analizar una conversación",
  analyzeDesc:
    "Pega un correo, chat o ticket de cliente: obtén inteligencia de soporte y un veredicto de phishing en una sola pasada.",
  inputPlaceholder: "Pega aquí el mensaje del cliente…",
  domainPlaceholder: "Dominio de tu organización (p. ej. acme.com) — mejora las comprobaciones de remitente",
  analyzeMessage: "Analizar mensaje",
  reset: "Reiniciar",
  heroSubtitle:
    "Threatly analiza correos, chats y tickets de clientes para extraer inteligencia de soporte y detectar amenazas de phishing — en seis idiomas.",
};

const fr: UIStrings = {
  ...en,
  tagline: "Intelligence support client et détection des menaces de phishing",
  console: "Console",
  analytics: "Analytique",
  settings: "Paramètres",
  signOut: "Se déconnecter",
  analyzedCount: "analysés",
  threats: "menaces",
  settingsTitle: "Paramètres",
  settingsDesc: "Configurez comment Threatly analyse et présente vos conversations.",
  languageSection: "Langue d'analyse",
  languageDesc:
    "Choisissez Détection automatique pour identifier la langue de chaque message, ou fixez une langue pour que chaque message soit analysé avec ce lexique.",
  autoDetectDesc:
    "Identifie automatiquement la langue de chaque message (repli sur l'anglais).",
  currentPref: "Préférence actuelle",
  prefApplied:
    "Cette préférence est enregistrée sur cet appareil et s'applique à chaque nouvelle analyse.",
  engineTitle: "Moteur d'intelligence à base de règles",
  engineDesc:
    "Classification, sentiment, résumés, analyse URL/expéditeur et détection d'ingénierie sociale s'exécutent dans votre navigateur — aucune donnée ne quitte cet appareil.",
  engineOn: "Actif",
  analyzeTitle: "Analyser une conversation",
  analyzeDesc:
    "Collez un e-mail, chat ou ticket client — obtenez l'intelligence support et un verdict de phishing en une seule passe.",
  inputPlaceholder: "Collez ici le message du client…",
  domainPlaceholder: "Domaine de votre organisation (ex. acme.com) — améliore les vérifications d'expéditeur",
  analyzeMessage: "Analyser le message",
  reset: "Réinitialiser",
  heroSubtitle:
    "Threatly analyse les e-mails, chats et tickets clients pour extraire l'intelligence support et détecter le phishing — en six langues.",
};

const de: UIStrings = {
  ...en,
  tagline: "Kundensupport-Intelligenz und Phishing-Erkennung",
  console: "Konsole",
  analytics: "Analytik",
  settings: "Einstellungen",
  signOut: "Abmelden",
  analyzedCount: "analysiert",
  threats: "Bedrohungen",
  settingsTitle: "Einstellungen",
  settingsDesc:
    "Legen Sie fest, wie Threatly Ihre Konversationen analysiert und darstellt.",
  languageSection: "Analysesprache",
  languageDesc:
    "Wählen Sie Automatische Erkennung, um die Sprache jeder Nachricht zu ermitteln, oder legen Sie eine Sprache fest, damit jede Nachricht mit diesem Lexikon analysiert wird.",
  autoDetectDesc:
    "Erkennt die Sprache jeder Nachricht automatisch (Englisch als Rückfallebene).",
  currentPref: "Aktuelle Einstellung",
  prefApplied:
    "Diese Einstellung wird auf diesem Gerät gespeichert und gilt für jede neue Analyse.",
  engineTitle: "Regelbasierter Intelligenz-Engine",
  engineDesc:
    "Klassifikation, Stimmung, Zusammenfassungen, URL-/Absender-Analyse und Social-Engineering-Erkennung laufen vollständig in Ihrem Browser — keine Daten verlassen dieses Gerät.",
  engineOn: "Aktiv",
  analyzeTitle: "Eine Konversation analysieren",
  analyzeDesc:
    "Fügen Sie eine Kunden-E-Mail, einen Chat oder ein Ticket ein — erhalten Sie Support-Intelligenz und ein Phishing-Urteil in einem Durchgang.",
  inputPlaceholder: "Kundennachricht hier einfügen…",
  domainPlaceholder: "Domäne Ihrer Organisation (z. B. acme.com) — verbessert die Absenderprüfung",
  analyzeMessage: "Nachricht analysieren",
  reset: "Zurücksetzen",
  heroSubtitle:
    "Threatly analysiert Kunden-E-Mails, Chats und Tickets, um Support-Intelligenz zu gewinnen und Phishing-Bedrohungen zu erkennen — in sechs Sprachen.",
};

const pt: UIStrings = {
  ...en,
  tagline: "Inteligência de suporte ao cliente e detecção de ameaças de phishing",
  console: "Console",
  analytics: "Análises",
  settings: "Configurações",
  signOut: "Sair",
  analyzedCount: "analisadas",
  threats: "ameaças",
  settingsTitle: "Configurações",
  settingsDesc: "Ajuste como o Threatly analisa e apresenta suas conversas.",
  languageSection: "Idioma da análise",
  languageDesc:
    "Escolha Detecção automática para identificar o idioma de cada mensagem, ou fixe um idioma para que todas as mensagens sejam analisadas com esse léxico.",
  autoDetectDesc:
    "Identifica automaticamente o idioma de cada mensagem (inglês como alternativa).",
  currentPref: "Preferência atual",
  prefApplied:
    "Esta preferência é salva neste dispositivo e vale para cada nova análise.",
  engineTitle: "Motor de inteligência baseado em regras",
  engineDesc:
    "Classificação, sentimento, resumos, análise de URL/remetente e detecção de engenharia social rodam no seu navegador — nenhum dado sai deste dispositivo.",
  engineOn: "Ativo",
  analyzeTitle: "Analisar uma conversa",
  analyzeDesc:
    "Cole um e-mail, chat ou ticket de cliente — obtenha inteligência de suporte e um veredito de phishing em uma passagem.",
  inputPlaceholder: "Cole aqui a mensagem do cliente…",
  domainPlaceholder: "Domínio da sua organização (ex.: acme.com) — melhora as verificações de remetente",
  analyzeMessage: "Analisar mensagem",
  reset: "Redefinir",
  heroSubtitle:
    "O Threatly analisa e-mails, chats e tickets de clientes para extrair inteligência de suporte e detectar ameaças de phishing — em seis idiomas.",
};

const hi: UIStrings = {
  ...en,
  tagline: "ग्राहक सहायता बुद्धिमत्ता और फ़िशिंग ख़तरा पहचान",
  console: "कंसोल",
  analytics: "विश्लेषण",
  settings: "सेटिंग्स",
  signOut: "साइन आउट",
  analyzedCount: "विश्लेषित",
  threats: "ख़तरे",
  settingsTitle: "सेटिंग्स",
  settingsDesc: "जानें कि Threatly आपकी बातचीत का विश्लेषण कैसे करे, यह यहाँ बदलें।",
  languageSection: "विश्लेषण भाषा",
  languageDesc:
    "हर संदेश की भाषा पहचानने के लिए स्वतः पहचान चुनें, या एक भाषा निर्धारित करें जिससे हर संदेश उसी भाषा में विश्लेषित हो।",
  autoDetectDesc:
    "हर संदेश की भाषा स्वतः पहचानता है (अस्पष्ट होने पर अंग्रेज़ी)।",
  currentPref: "वर्तमान प्राथमिकता",
  prefApplied: "यह प्राथमिकता इस डिवाइस पर सहेजी जाती है और हर नए विश्लेषण पर लागू होती है।",
  engineTitle: "नियम-आधारित बुद्धिमत्ता इंजन",
  engineDesc:
    "वर्गीकरण, भावना, सारांश, URL/प्रेषक जाँच और सोशल-इंजीनियरिंग पहचान पूरी तरह आपके ब्राउज़र में चलती है — कोई डेटा इस डिवाइस से बाहर नहीं जाता।",
  engineOn: "सक्रिय",
  analyzeTitle: "बातचीत का विश्लेषण करें",
  analyzeDesc:
    "ग्राहक का ईमेल, चैट या टिकट पेस्ट करें — एक ही बार में सहायता बुद्धिमत्ता और फ़िशिंग निर्णय प्राप्त करें।",
  inputPlaceholder: "ग्राहक का संदेश यहाँ पेस्ट करें…",
  domainPlaceholder: "आपके संगठन का डोमेन (जैसे acme.com) — प्रेषक जाँच में सुधार करता है",
  analyzeMessage: "संदेश विश्लेषित करें",
  reset: "रीसेट",
  heroSubtitle:
    "Threatly ग्राहक ईमेल, चैट और टिकट का विश्लेषण करके सहायता बुद्धिमत्ता निकालता है और फ़िशिंग ख़तरे पहचानता है — छह भाषाओं में।",
};

export const UI_TRANSLATIONS: Record<SupportedLang, UIStrings> = { en, es, fr, de, pt, hi };

/** Translate a key for the given UI language (English fallback). */
export function translate(lang: SupportedLang, key: keyof UIStrings): string {
  return UI_TRANSLATIONS[lang][key] ?? en[key];
}
