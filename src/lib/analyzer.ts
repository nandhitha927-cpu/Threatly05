/**
 * InsightGuard — rule-based intelligence engine (v1).
 * Extracted intelligence model shared by the UI and the Convex action.
 */

export const COMPLAINT_CATEGORIES = [
  "Payment / Transaction",
  "Billing Problem",
  "Refund Request",
  "Account / Login",
  "Product Issue",
  "Delivery / Shipping",
  "Subscription Issue",
  "Technical Problem",
  "Service Quality",
  "Security Concern",
  "Other",
] as const;
export type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

export type Priority = "Low" | "Medium" | "High" | "Critical";
export type Sentiment = "Positive" | "Neutral" | "Negative";

export const RISK_LEVELS = ["Low", "Medium", "High", "Critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const SOCIAL_ENGINEERING_TECHNIQUES: Record<string, string> = {
  "Urgency pressure": "Demands immediate action ('act now', countdown language).",
  "Authority impersonation": "Claims to be security, billing, or a bank official.",
  "Credential harvesting": "Asks for password, PIN, OTP or card numbers.",
  "Fear / threat framing": "Warns of account closure, legal action or data loss.",
  "Payment redirection": "Asks to move money or pay via gift cards / crypto / wire.",
  "Too-good-to-be-true": "Unexpected reward, refund, or prize requiring action.",
};

export const TECHNIQUE_LABELS: Record<string, string> = {
  urgency: "Urgency pressure",
  authority: "Authority impersonation",
  credentials: "Credential harvesting",
  fear: "Fear / threat framing",
  redirection: "Payment redirection",
  lure: "Too-good-to-be-true",
};

export interface UrlFinding {
  url: string;
  domain: string;
  subdomain: string;
  registrableDomain: string;
  https: boolean;
  urlLength: number;
  isIpHost: boolean;
  isShortener: boolean;
  suspiciousChars: string[];
  lookalikeBrand: string | null;
  lookalikeChars: string[];
  hasCredentialsInUrl: boolean;
  flags: string[];
  risk: "low" | "medium" | "high" | "critical";
}

export interface EmailFinding {
  email: string;
  domain: string;
  isFreeMail: boolean;
  lookalikeBrand: string | null;
  lookalikeChars: string[];
  domainMismatch: boolean;
  flags: string[];
  risk: "low" | "medium" | "high" | "critical";
}

export interface AttachmentFinding {
  name: string;
  ext: string;
  risk: "low" | "medium" | "high" | "critical";
  flags: string[];
}

export interface MessageSummary {
  issue: string;
  customerRequest: string;
  actionsTaken: string | null;
  currentStatus: string | null;
}

export interface AnalysisResult {
  id: string;
  channel: string;
  receivedAt: string;
  textLength: number;
  wordCount: number;
  language: "en";
  complaint: {
    category: ComplaintCategory;
    categoryScore: number;
    issue: string;
    issueLabel: string;
    priority: Priority;
  };
  sentiment: {
    label: Sentiment;
    score: number;
    emotion: string;
    urgency: Priority;
  };
  keywords: string[];
  resolution: {
    status: "Resolved" | "Unresolved" | "Unclear";
    signals: string[];
  };
  summary: MessageSummary;
  security: {
    hasThreat: boolean;
    riskLevel: RiskLevel;
    riskScore: number;
    threatTypes: string[];
  socialEngineering: { technique: string; reason: string }[];
  phishingSignals: { signal: string; detail: string; weight: number }[];
  urls: UrlFinding[];
    emails: EmailFinding[];
    attachments: AttachmentFinding[];
    credentialRequest: boolean;
    otpRequest: boolean;
    moneyMentioned: boolean;
    currencyAmounts: string[];
    recommendedAction: string;
  };
}

// ─── extraction helpers ─────────────────────────────────────────────────────

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+/g;
const MONEY_RE =
  /(?:[$€£₹]|USD|EUR|GBP|INR|NGN)\s?[\d,]+(?:\.\d{1,2})?(?:\s?(?:k|K|m|M|million|billion))?/g;
const ATTACHMENT_RE =
  /\b[\w.-]+\.(?:exe|scr|msi|bat|cmd|js|vbs|ps1|jar|apk|html?|htm|docm|xlsm|pptm|zip|rar|7z|iso|img|pdf|docx?|xlsx?|pptx?|txt|csv|eml|msg)\b/gi;

const BRANDS: [string, string[]][] = [
  ["paypal", ["paypa1", "paypaI", "paypal-secure", "paypal.security"]],
  ["stripe", ["str!pe", "stripe-pay", "stripe.security"]],
  ["chase", ["ch4se", "chase-verify", "chase.security"]],
  ["wells fargo", ["wellsfarg0", "wells-fargo-secure"]],
  ["amazon", ["amaz0n", "amazom", "ama2on"]],
  ["microsoft", ["micr0soft", "rnicrosoft", "micros0ft"]],
  ["apple", ["app1e", "appie", "appl3"]],
  ["google", ["g00gle", "goog1e", "go0gle"]],
  ["netflix", ["netfl1x", "netfIix"]],
  ["facebook", ["faceb00k", "facebock"]],
  ["instagram", ["inst4gram", "instagam"]],
  ["linkedin", ["linked!n", "1inkedin"]],
  ["coinbase", ["c0inbase", "coinb4se"]],
  ["binance", ["b!nance", "binanc3"]],
  ["icloud", ["1cloud", "icIoud"]],
  ["office365", ["office335", "office-365-login"]],
  ["dhl", ["dhl-express-verify", "dh1"]],
  ["fedex", ["fedex-track", "fed-ex"]],
  ["usps", ["usps-track", "uspz"]],
];

const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly",
  "cutt.ly", "rb.gy", "shorturl.at", "rebrand.ly", "tiny.cc", "s.id",
  "lnkd.in", "shorte.st", "soo.gd", "clck.ru", "v.gd",
]);

const FREE_MAIL = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "aol.com",
  "icloud.com", "protonmail.com", "mail.com", "yandex.com", "zoho.com",
  "gmx.com", "mail.ru", "qq.com", "163.com",
]);

const SUSPICIOUS_TLDS = new Set([
  "zip", "mov", "top", "gq", "tk", "ml", "cf", "work", "click", "country",
  "stream", "gdn", "mom", "xin", "kim", "men", "rest", "cam", "quest", "cfd",
  "xyz", "icu", "buzz", "cyou", "sbs", "live", "shop", "online", "site",
  "space", "fun", "monster", "lol", "baby", "promo",
]);

const HOMOGLYPHS: Record<string, string> = {
  "0": "o", "1": "l", "3": "e", "4": "a", "5": "s", "7": "t", "8": "b",
  "9": "g", "@": "a", "$": "s", "!": "i", "|": "l", "₹": "r", "¢": "c",
  "і": "i", "ѕ": "s", "а": "a", "е": "e", "о": "o", "р": "p", "с": "c",
  "у": "y", "х": "x",
};

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Small edit-distance used for fuzzy brand-impersonation matching. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

function countMatches(text: string, words: string[]): number {
  let n = 0;
  for (const w of words) {
    n += (text.match(new RegExp(`\\b${escapeRegExp(w)}\\b`, "gi")) ?? []).length;
  }
  return n;
}

/** Parse a URL string into structured findings. */
export function parseUrl(raw: string): UrlFinding {
  const url = raw.replace(/[.,;:!?)\]]+$/, "");
  let host = "";
  let path = "";
  let https = false;
  try {
    const withProto = /^https?:\/\//i.test(url) ? url : `http://${url}`;
    const u = new URL(withProto);
    host = u.hostname.toLowerCase();
    path = u.pathname + u.search;
    https = u.protocol === "https:";
  } catch {
    host = url.replace(/^https?:\/\//i, "").split("/")[0].toLowerCase();
    path = url.slice(host.length);
  }

  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":");
  const parts = host.split(".");
  const tld = parts.length > 1 ? parts[parts.length - 1] : "";
  const registrableDomain = parts.slice(-2).join(".");
  const subdomain = parts.slice(0, -2).join(".");

  const flags: string[] = [];
  let risk: UrlFinding["risk"] = "low";

  const hasUserinfo = /\/\/[^/@]*@/.test(url);
  const isPunycode = host.includes("xn--");

  if (!https) flags.push("No HTTPS — traffic is unencrypted");
  if (isIp) flags.push("Host is a raw IP address instead of a domain name");
  if (hasUserinfo) flags.push("Uses the user@host trick — real host is hidden before the @");
  if (isPunycode) flags.push("Punycode-encoded host — may visually mimic another domain");
  if (url.length > 100) flags.push(`Unusually long URL (${url.length} chars)`);
  if (SHORTENERS.has(registrableDomain)) flags.push("URL shortener hides the true destination");

  const suspChars = uniq(url.match(/[@%:~=${}[\]]/g) ?? []);
  if (suspChars.length >= 2) flags.push("Contains unusual characters");

  if (SUSPICIOUS_TLDS.has(tld)) flags.push(`High-abuse TLD ".${tld}"`);

  // lookalike brand detection
  let lookalikeBrand: string | null = null;
  let lookalikeChars: string[] = [];
  for (const [brand, variants] of BRANDS) {
    for (const variant of variants) {
      if (host.includes(variant)) {
        lookalikeBrand = brand;
        lookalikeChars = uniq(
          variant.split("").filter((ch) => !brand.replace(/\s/g, "").includes(ch)),
        );
        break;
      }
    }
    if (lookalikeBrand) break;
  }
  if (!lookalikeBrand) {
    // normalise homoglyphs and re-check the registrable domain
    const normalized = host.replace(/[0-9@!$|]/g, (m) => HOMOGLYPHS[m] ?? m);
    for (const [brand] of BRANDS) {
      const brandNoSpace = brand.replace(/\s/g, "");
      if (normalized.includes(brandNoSpace) && registrableDomain !== `${brandNoSpace}.com`) {
        lookalikeBrand = brand;
        lookalikeChars = uniq(host.split("").filter((ch) => /[0-9@!$|]/.test(ch)));
        break;
      }
    }
  }
  if (!lookalikeBrand) {
    // fuzzy edit-distance match on the registrable label (catches gooogle, paypall…)
    const label = registrableDomain.split(".")[0];
    if (label.length >= 4) {
      for (const [brand] of BRANDS) {
        const b = brand.replace(/\s/g, "");
        const maxDist = b.length >= 6 ? 2 : 1;
        if (
          Math.abs(label.length - b.length) <= maxDist &&
          levenshtein(label, b) <= maxDist
        ) {
          lookalikeBrand = brand;
          lookalikeChars = [];
          break;
        }
      }
    }
  }
  if (lookalikeBrand) {
    flags.push(`Lookalike / impersonation pattern for "${lookalikeBrand}"`);
    risk = "critical";
  }
  if (hasUserinfo && risk === "low") risk = "high";
  if (isPunycode && risk === "low") risk = "medium";
  if (isIp && risk === "low") risk = "medium";
  if (!https && risk === "low") risk = "medium";
  if (SHORTENERS.has(registrableDomain) && risk === "low") risk = "medium";
  if (SUSPICIOUS_TLDS.has(tld) && risk === "low") risk = "medium";
  if (suspChars.length >= 2 && risk === "low") risk = "medium";

  return {
    url,
    domain: host,
    subdomain,
    registrableDomain,
    https,
    urlLength: url.length,
    isIpHost: isIp,
    isShortener: SHORTENERS.has(registrableDomain),
    suspiciousChars: suspChars,
    lookalikeBrand,
    lookalikeChars,
    hasCredentialsInUrl: /\/\/[^/?#]*[?&](?:user|username|pass|password|token|otp|email)=/i.test(path),
    flags,
    risk,
  };
}

/** Parse an email address into structured findings. */
export function parseEmail(raw: string): EmailFinding {
  const email = raw.toLowerCase();
  const domain = email.split("@")[1] ?? "";
  const flags: string[] = [];
  let risk: EmailFinding["risk"] = "low";

  const isFree = FREE_MAIL.has(domain);
  if (isFree) flags.push("Free-mail domain — anyone can register it");

  let lookalikeBrand: string | null = null;
  let lookalikeChars: string[] = [];
  for (const [brand, variants] of BRANDS) {
    for (const variant of variants) {
      if (domain.includes(variant)) {
        lookalikeBrand = brand;
        lookalikeChars = uniq(
          variant.split("").filter((ch) => !brand.replace(/\s/g, "").includes(ch)),
        );
        break;
      }
    }
    if (lookalikeBrand) break;
  }

  const normalized = domain.replace(/[0-9@!$|]/g, (m) => HOMOGLYPHS[m] ?? m);
  if (!lookalikeBrand) {
    for (const [brand] of BRANDS) {
      const brandNoSpace = brand.replace(/\s/g, "");
      if (normalized.includes(brandNoSpace) && domain !== `${brandNoSpace}.com`) {
        lookalikeBrand = brand;
        lookalikeChars = uniq(domain.split("").filter((ch) => /[0-9@!$|]/.test(ch)));
        break;
      }
    }
  }
  if (lookalikeBrand) {
    flags.push(`Lookalike of "${lookalikeBrand}" — likely impersonation`);
    risk = "critical";
  }
  if (isFree && !lookalikeBrand) {
    flags.push("Domain mismatch — does not match expected corporate domain");
    risk = risk === "low" ? "medium" : risk;
  }
  if (/^[0-9]+$/.test(email.split("@")[0])) {
    flags.push("Numeric local part — common in throwaway accounts");
    risk = risk === "low" ? "medium" : risk;
  }
  if (!lookalikeBrand) {
    const label = domain.split(".")[0];
    if (label.length >= 4) {
      for (const [brand] of BRANDS) {
        const b = brand.replace(/\s/g, "");
        const maxDist = b.length >= 6 ? 2 : 1;
        if (
          Math.abs(label.length - b.length) <= maxDist &&
          levenshtein(label, b) <= maxDist
        ) {
          lookalikeBrand = brand;
          lookalikeChars = [];
          flags.push(`Name similar to "${brand}" — likely impersonation`);
          risk = "critical";
          break;
        }
      }
    }
  }

  return {
    email,
    domain,
    isFreeMail: isFree,
    lookalikeBrand,
    lookalikeChars,
    domainMismatch: isFree && !lookalikeBrand,
    flags,
    risk,
  };
}

/** Parse an attachment filename. */
export function parseAttachment(name: string): AttachmentFinding {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const flags: string[] = [];
  let risk: AttachmentFinding["risk"] = "low";

  if (["exe", "scr", "msi", "bat", "cmd", "js", "vbs", "ps1", "jar", "apk"].includes(ext)) {
    flags.push("Executable file — high risk payload type");
    risk = "critical";
  } else if (["html", "htm", "docm", "xlsm", "pptm", "iso", "img"].includes(ext)) {
    flags.push("Scriptable container — common phishing attachment type");
    risk = "high";
  } else if (["zip", "rar", "7z"].includes(ext)) {
    flags.push("Archive — can conceal executables");
    risk = "high";
  } else if (["pdf", "docx", "xlsx", "pptx"].includes(ext)) {
    flags.push("Document — verify sender before opening");
    risk = "medium";
  } else if (ext) {
    flags.push("Attachment detected");
  }

  return { name, ext, risk, flags };
}

// ─── NLP classification ─────────────────────────────────────────────────────

const CATEGORY_RULES: { category: ComplaintCategory; patterns: RegExp[]; weight: number }[] = [
  {
    category: "Refund Request",
    weight: 3,
    patterns: [
      /\brefund(s|ed|ing)?\b/i,
      /\bmoney back\b/i,
      /\breimburse/i,
      /\bchargeback/i,
      /\bget my (money|funds)\b/i,
    ],
  },
  {
    category: "Billing Problem",
    weight: 2,
    patterns: [
      /\bcharged (twice|two times|double|2x)\b/i,
      /\bduplicate (charge|payment|transaction)\b/i,
      /\bovercharged?\b/i,
      /\bwrong (amount|price)\b/i,
      /\bbill(ed|ing) (error|issue|problem)\b/i,
      /\binvoice\b/i,
      /\bbilling\b/i,
    ],
  },
  {
    category: "Payment / Transaction",
    weight: 2,
    patterns: [
      /\bpayment(s)? (failed|declined|error|not going through)\b/i,
      /\bcard (declined|rejected|failed|expired)\b/i,
      /\btransaction (failed|declined|error|pending)\b/i,
      /\bcharged but\b/i,
      /\bmoney (deducted|taken|withdrawn)\b/i,
      /\bpayment\b/i,
    ],
  },
  {
    category: "Account / Login",
    weight: 2,
    patterns: [
      /\bcannot (log|sign) ?in\b/i,
      /\bcan'?t (log|sign) ?in\b/i,
      /\blocked out\b/i,
      /\blocked (my|the) account\b/i,
      /\bpassword reset\b/i,
      /\bforgot(ten)? (my )?password\b/i,
      /\baccount (locked|suspended|disabled|compromised)\b/i,
      /\b2fa|mfa\b/i,
      /\blogin\b/i,
    ],
  },
  {
    category: "Product Issue",
    weight: 2,
    patterns: [
      /\b(product|item|unit) (is |was )?(broken|defective|damaged|faulty)\b/i,
      /\bnot working\b/i,
      /\bstopped working\b/i,
      /\bdoesn'?t (work|turn on|charge)\b/i,
      /\bdefect/i,
      /\bdamaged\b/i,
      /\bmalfunction/i,
    ],
  },
  {
    category: "Delivery / Shipping",
    weight: 2,
    patterns: [
      /\border (not (arrived|delivered)|never (arrived|delivered))\b/i,
      /\b(did|has) not (arrived|been delivered)\b/i,
      /\bdelay(ed)?\b/i,
      /\bshipping\b/i,
      /\bdelivery\b/i,
      /\btracking (number|link)?\b/i,
      /\blost (package|parcel)\b/i,
      /\bpackage\b/i,
      /\bparcel\b/i,
    ],
  },
  {
    category: "Subscription Issue",
    weight: 2,
    patterns: [
      /\bsubscription\b/i,
      /\bcancel(l?ed)? my (plan|subscription)\b/i,
      /\brenew(ed|al)\b/i,
      /\bauto-?renew\b/i,
      /\bplan\b/i,
    ],
  },
  {
    category: "Technical Problem",
    weight: 1,
    patterns: [
      /\b(app|website|site|server|api|dashboard) (is )?(down|crash)/i,
      /\berror (code|message)\b/i,
      /\bbug\b/i,
      /\bcrash(es|ed|ing)?\b/i,
      /\b(internal )?server error\b/i,
      /\b500 error\b/i,
      /\btimeout\b/i,
      /\bglitch/i,
      /\bsync\b/i,
    ],
  },
  {
    category: "Service Quality",
    weight: 1,
    patterns: [
      /\b(terrible|awful|poor|bad|worst) (service|support)\b/i,
      /\b(nobody|no one) (has )?(replied|responded|answered|solved)\b/i,
      /\bthird time\b/i,
      /\bthird ticket\b/i,
      /\bescalat/i,
      /\bunacceptable\b/i,
      /\bkeep (waiting|circular)\b/i,
      /\brunaround\b/i,
    ],
  },
  {
    category: "Security Concern",
    weight: 3,
    patterns: [
      /\b(compromised|hacked|breach(ed)?|unauthorized|fraud(ulent)?)\b/i,
      /\bsomeone (else )?(accessed|logged|used|transferred)\b/i,
      /\bstolen\b/i,
      /\bidentity theft\b/i,
      /\bscam(mer)?\b/i,
      /\bfraudulent (charge|transaction|activity)\b/i,
      /\bphish/i,
    ],
  },
];

const NEGATIVE_WORDS = [
  "angry", "annoyed", "appalling", "awful", "bad", "broken", "bug", "cancel",
  "complaint", "concerned", "defect", "delay", "delayed", "deny", "disappointed",
  "disaster", "disgusted", "frustrating", "frustrated", "furious", "horrible",
  "incompetent", "issue", "lost", "mad", "missing", "mistake", "neglect",
  "never again", "no response", "nobody", "problem", "refund", "ridiculous",
  "scam", "shocked", "slow", "stole", "stolen", "stuck", "terrible", "unacceptable",
  "unhappy", "unresolved", "upset", "useless", "waste", "worst", "wrong",
  "compromised", "hacked", "fail", "failed", "failing", "failure", "error",
  "declined", "denied", "broke", "damaged", "defective",
];
const POSITIVE_WORDS = [
  "great", "good", "excellent", "happy", "love", "perfect", "thanks", "thank you",
  "appreciate", "helpful", "resolved", "solved", "fixed", "quick", "fast",
  "awesome", "amazing", "fantastic", "pleased", "satisfied", "wonderful",
  "brilliant", "smooth", "impressed", "compliment", "praise", "kind",
];
const URGENT_WORDS = [
  "urgent", "asap", "immediately", "right now", "emergency", "critical",
  "as soon as possible", "today", "hours", "escalate",
];
const RESOLVED_MARKERS = [
  "resolved", "solved", "fixed", "closed", "completed", "all good",
  "working again", "issue was fixed",
];
const UNRESOLVED_MARKERS = [
  "still", "no response", "nobody", "have not", "not yet",
  "waiting", "again", "third time", "fourth time", "twice", "no reply",
  "not resolved", "unresolved", "nothing yet",
];
const ISSUE_LABEL_RULES: [RegExp, string][] = [
  [
    /\bcharged (twice|two times|double|2x)\b|\bduplicate (charge|payment|transaction)\b/i,
    "Duplicate Payment",
  ],
  [
    /\bunauthorized (charge|transaction)\b|\bfraudulent (charge|transaction)\b/i,
    "Unauthorized Charge",
  ],
  [
    /\brefund\b[^.!?]{0,60}\b(delay|delayed|still|waiting|pending|not received|weeks?)\b/i,
    "Refund Delay",
  ],
  [/\brefund\b|\bmoney back\b|\breimburse/i, "Refund Requested"],
  [
    /\bpayment(s)? (failed|declined|error|not going through)\b|\bcard (declined|rejected|failed|expired)\b|\btransaction (failed|declined)\b/i,
    "Payment Failure",
  ],
  [
    /\bcannot (log|sign) ?in\b|\bcan'?t (log|sign) ?in\b|\blocked out\b|\blogin (fail|issue|problem)\b/i,
    "Login Failure",
  ],
  [/\bforgot(ten)? (my )?password\b|\bpassword reset\b/i, "Password Reset"],
  [/\baccount (locked|suspended|disabled)\b/i, "Account Locked"],
  [
    /\border (not|never) (arrived|delivered)\b|\b(never|has not|hasn'?t|have not|haven'?t|still not|still hasn'?t|did not|didn'?t)\s+(been\s+)?(arrived|delivered|come|received)\b/i,
    "Order Not Received",
  ],
  [/\bdelay(ed)?\b|\blost (package|parcel)\b/i, "Delivery Delay"],
  [
    /\b(broken|defective|faulty)\b|\bstopped working\b|\bdoesn'?t (work|turn on|charge)\b|\bmalfunction/i,
    "Product Defect",
  ],
  [/\b(app|website|site|server|api|dashboard) (is )?(down|crash)/i, "Service Outage"],
  [
    /\b(compromised|hacked|breach(ed)?)\b|\bidentity theft\b/i,
    "Account Security",
  ],
  [
    /\bovercharged?\b|\bwrong (amount|price)\b|\bbilling (error|issue|problem)\b/i,
    "Billing Dispute",
  ],
];

export function analyzeText(raw: string): AnalysisResult {
  const text = raw.trim();
  const lower = text.toLowerCase();

  // URLs / emails / money / attachments
  const urls = uniq(text.match(URL_RE) ?? []).map((m) => parseUrl(m));
  const emails = uniq(text.match(EMAIL_RE) ?? []).map((m) => parseEmail(m));
  const attachments = uniq(text.match(ATTACHMENT_RE) ?? []).map((m) => parseAttachment(m));
  const amounts = uniq(text.match(MONEY_RE) ?? []);
  const moneyMentioned = amounts.length > 0;

  // 1) complaint classification (weighted keyword scoring)
  let category: ComplaintCategory = "Other";
  let categoryScore = 0;
  for (const rule of CATEGORY_RULES) {
    let score = 0;
    for (const p of rule.patterns) {
      const hits = (text.match(p) ?? []).length;
      if (hits > 0) score += rule.weight * Math.min(hits, 3);
    }
    if (score > categoryScore) {
      category = rule.category;
      categoryScore = score;
    }
  }

  // spec example: "charged twice … please refund" → Billing/Payment, not Refund Request
  const duplicateCharge =
    /\bcharged (twice|two times|double|2x)\b/i.test(text) ||
    /\bduplicate (charge|payment|transaction)\b/i.test(text);
  if (
    duplicateCharge &&
    (category === "Refund Request" || category === "Payment / Transaction" || category === "Subscription Issue")
  ) {
    category = "Billing Problem";
  }

  // short issue tag, e.g. "Duplicate Payment", "Login Failure"
  let issueLabel = "General Inquiry";
  for (const [re, label] of ISSUE_LABEL_RULES) {
    if (re.test(text)) {
      issueLabel = label;
      break;
    }
  }

  // 2) sentiment (neg / pos lexicons + punctuation intensity)
  const neg = countMatches(lower, NEGATIVE_WORDS);
  const pos = countMatches(lower, POSITIVE_WORDS);
  const exclaim = (text.match(/!/g) ?? []).length;
  const capsWords = (text.match(/\b[A-Z]{3,}\b/g) ?? []).length;
  const negIntensifiers = (lower.match(/\b(very|extremely|so|really|totally|absolutely)\b/g) ?? []).length;
  const sentimentScore = neg * 2 + exclaim * 0.5 + capsWords * 0.5 + negIntensifiers - pos * 1.5;
  const sentimentLabel: Sentiment =
    sentimentScore >= 2 ? "Negative" : sentimentScore <= -1.5 ? "Positive" : "Neutral";

  // emotion + urgency
  const emotionRules: { emotion: string; patterns: RegExp[] }[] = [
    { emotion: "Anger", patterns: [/\b(furious|angry|outraged|disgusted|unacceptable)\b/i] },
    { emotion: "Frustration", patterns: [/\b(frustrated|frustrating|annoyed|runaround|third time|still)\b/i] },
    { emotion: "Fear / Anxiety", patterns: [/\b(scared|afraid|worried|nervous|anxious|compromised|hacked|stolen)\b/i] },
    { emotion: "Disappointment", patterns: [/\b(disappointed|let down|unhappy|expected better)\b/i] },
    { emotion: "Confusion", patterns: [/\b(confused|don'?t understand|why (is|did)|what happened|how come)\b/i] },
    { emotion: "Satisfaction", patterns: [/\b(happy|satisfied|resolved|thank(s| you)|great|excellent)\b/i] },
    { emotion: "Urgency", patterns: [/\b(urgent|asap|immediately|right now|emergency)\b/i] },
  ];
  let emotion = "Neutral";
  for (const r of emotionRules) {
    if (r.patterns.some((p) => p.test(text))) {
      emotion = r.emotion;
      break;
    }
  }

  const urgentHits = countMatches(lower, URGENT_WORDS);
  const compromiseSignals = (lower.match(/\b(compromised|hacked|unauthorized|fraud|stolen|breach)\b/g) ?? []).length;
  // repeated contact attempts ("three times", "multiple tickets") and being ignored
  // ("nobody has solved", "no response", "still not resolved") are urgency signals
  const repeatContactHits =
    (lower.match(/\b(second|third|fourth|fifth|2nd|3rd|4th|5th)\s+time\b/g) ?? []).length +
    (lower.match(/\b(two|three|four|five|six|seven|\d+)\s+times\b/g) ?? []).length +
    (lower.match(/\b(multiple|several|countless|repeated)\s+(times|tickets|emails|calls|attempts|messages)\b/g) ?? []).length;
  const ignoredSignals =
    (lower.match(/\bno (response|reply|answer)\b/g) ?? []).length +
    (lower.match(/\b(no ?one|nobody) (has |have )?(replied|responded|answered|solved|fixed|helped)\b/g) ?? []).length +
    (lower.match(/\bstill (not |isn'?t )?(resolved|fixed)\b/g) ?? []).length;
  let urgency: Priority = "Low";
  if (ignoredSignals >= 1) urgency = "Medium";
  if (
    urgentHits >= 1 ||
    repeatContactHits >= 2 ||
    (repeatContactHits >= 1 && sentimentLabel === "Negative") ||
    (ignoredSignals >= 1 && sentimentLabel === "Negative")
  )
    urgency = "High";
  if (urgentHits >= 2 || compromiseSignals >= 1) urgency = "Critical";

  // 3) resolution status
  const resolvedHits = RESOLVED_MARKERS.filter((m) => new RegExp(`\\b${escapeRegExp(m)}\\b`, "i").test(text));
  const unresolvedHits = UNRESOLVED_MARKERS.filter((m) => new RegExp(`\\b${escapeRegExp(m)}\\b`, "i").test(text));
  const resolutionSignals = [
    ...resolvedHits.map((m) => `Resolved marker: "${m}"`),
    ...unresolvedHits.map((m) => `Open-issue marker: "${m}"`),
  ];
  const resolutionStatus: AnalysisResult["resolution"]["status"] =
    unresolvedHits.length > resolvedHits.length ? "Unresolved"
    : resolvedHits.length > 0 ? "Resolved"
    : "Unclear";

  // 4) keywords (simple TF, stopwords removed)
  const STOPWORDS = new Set([
    "the", "a", "an", "and", "or", "but", "if", "then", "else", "when", "at", "by", "for",
    "with", "about", "against", "between", "into", "through", "during", "before", "after",
    "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "once", "here", "there", "all", "any", "both", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than",
    "too", "very", "s", "t", "can", "will", "just", "don", "should", "now", "i", "me", "my",
    "myself", "we", "our", "ours", "you", "your", "yours", "he", "him", "his", "she", "her",
    "it", "its", "they", "them", "their", "what", "which", "who", "whom", "this", "that",
    "these", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did",
    "doing", "would", "could", "ought", "is", "are", "was", "were", "am", "de", "hi", "hello",
    "regards", "thanks", "please", "may", "might", "must", "shall", "d", "ll", "m", "o", "re",
    "ve", "y", "ain", "aren", "couldn", "didn", "doesn", "hadn", "hasn", "haven", "isn",
    "ma", "mightn", "mustn", "needn", "shan", "shouldn", "wasn", "weren", "won", "wouldn",
  ]);
  const words = lower
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  const keywords = Array.from(freq.entries())
    .filter(([w]) => w.length > 3)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([w]) => w);

  // 5) threat detection
  const socialEngineering: { technique: string; reason: string }[] = [];
  const techniques = new Set<string>();
  if (/\b(urgent|immediately|right now|asap|act now|within \d+ (hours|minutes)|expire[sd]?|final (warning|notice))\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.urgency, reason: "Urgency language pressures the reader to act without verifying" });
    techniques.add("urgency");
  }
  if (/\b(security team|billing department|it department|bank official|verify your identity|account manager)\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.authority, reason: "Sender claims organizational authority to demand compliance" });
    techniques.add("authority");
  }
  if (/\b(password|passcode|pin|otp|one-time code|one time password|cvv|card number|card details|credit card)\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.credentials, reason: "Message references passwords, OTPs or card data" });
    techniques.add("credentials");
  }
  if (/\b(account (will be|has been|is) (permanently )?(closed|suspended|blocked|terminated)|legal action|sue|court|deactivate|delete your account|data (will be|has been) (deleted|lost))\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.fear, reason: "Threatens account closure or legal consequences" });
    techniques.add("fear");
  }
  if (/\b(gift card|crypto|bitcoin|wire transfer|western union|transfer (money|funds)|send (money|funds))\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.redirection, reason: "Asks to move money through hard-to-reverse channels" });
    techniques.add("redirection");
  }
  if (/\b(you have (won|been selected)|exclusive (offer|deal)|limited (time )?offer|claim your (prize|refund|reward)|free (gift|money|iphone))\b/i.test(text)) {
    socialEngineering.push({ technique: TECHNIQUE_LABELS.lure, reason: "Unsolicited reward offer is a classic lure" });
    techniques.add("lure");
  }

  // 5b) generic phishing lures (score even when no brand impersonation is present)
  const phishingSignals: { signal: string; detail: string; weight: number }[] = [];
  const addSignal = (signal: string, detail: string, weight: number) => {
    if (!phishingSignals.some((s) => s.signal === signal))
      phishingSignals.push({ signal, detail, weight });
  };

  if (/\bdear\s+(customer|user|valued (customer|user|client))\b/i.test(text)) {
    addSignal("Generic greeting", "Addresses 'Dear Customer' instead of your name — mass-phishing tell", 1);
  }
  if (/\b(unusual|suspicious)\s+(activity|login|sign[- ]?in|transaction|attempt)\b/i.test(text)) {
    addSignal("Fake security warning", "Claims unusual or suspicious activity to trigger fear", 2);
  }
  if (
    /\b(verify|confirm|validate|restore|secure|unlock)\b[^.!?]{0,30}\baccount\b/i.test(text) ||
    /\baccount\b[^.!?]{0,30}\b(verify|confirm|validate|restore|secure|unlock)\b/i.test(text)
  ) {
    addSignal("Account-verification demand", "Asks you to verify or secure your account — a classic phishing request", 1.5);
  }
  if (/\b(update|confirm|submit)\b[^.!?]{0,30}\b(payment|billing|card)\s+(information|details|info)\b/i.test(text)) {
    addSignal("Payment-detail update lure", "Requests updated payment or billing details via an untrusted message", 2);
  }
  if (
    /\b(click|tap|select|go to)\b[^.!?]{0,20}\b(link|here|button|below)\b/i.test(text) &&
    urls.length > 0
  ) {
    addSignal("Click-through demand", "Presses the reader to follow a link to complete the action", 1.5);
  }
  if (
    /\b(within \d+ (hours|minutes)|access will be (limited|restricted)|account (has been|will be) (locked|limited|frozen))\b/i.test(text)
  ) {
    addSignal("Deadline / suspension threat", "Sets a short deadline or threatens restricted access", 2);
  }

  const phishingWeight = Math.min(
    phishingSignals.reduce((sum, s) => sum + s.weight, 0),
    9,
  );

  const suspiciousUrls = urls.filter((u) => u.risk !== "low");
  const riskyAttachments = attachments.filter((a) => a.risk !== "low");
  const credentialRequest = /\b(enter|provide|confirm|share|reply with)\b[^.!?]*\b(password|username|pin|otp|card|credentials)\b/i.test(text);
  const otpRequest = /\b(otp|one[- ]time (code|password)|verification code)\b/i.test(text);

  // 6) risk scoring
  let riskScore = 0;
  for (const u of urls) {
    riskScore += u.risk === "critical" ? 4 : u.risk === "high" ? 3 : u.risk === "medium" ? 1.5 : 0;
  }
  for (const e of emails) {
    riskScore += e.risk === "critical" ? 3.5 : e.risk === "medium" ? 1 : 0;
  }
  for (const a of attachments) {
    riskScore += a.risk === "critical" ? 3.5 : a.risk === "high" ? 3 : a.risk === "medium" ? 1 : 0;
  }
  if (credentialRequest) riskScore += 4;
  if (otpRequest) riskScore += 3;
  riskScore += techniques.size * 1.2;
  riskScore += phishingWeight;
  riskScore = Math.round(riskScore * 10) / 10;

  let riskLevel: RiskLevel = "Low";
  if (riskScore >= 8) riskLevel = "Critical";
  else if (riskScore >= 4.5) riskLevel = "High";
  else if (riskScore >= 2) riskLevel = "Medium";
  if (techniques.size > 0 && riskLevel === "Low") riskLevel = "Medium";

  const threatTypes: string[] = [];
  if (suspiciousUrls.length > 0) threatTypes.push("Phishing URL");
  if (urls.some((u) => u.lookalikeBrand) || emails.some((e) => e.lookalikeBrand)) threatTypes.push("Brand impersonation");
  if (credentialRequest) threatTypes.push("Credential harvesting");
  if (otpRequest) threatTypes.push("OTP request");
  if (techniques.has("redirection")) threatTypes.push("Payment redirection");
  if (riskyAttachments.length > 0) threatTypes.push("Malicious attachment");
  if (phishingWeight >= 3) threatTypes.push("Phishing lure");

  const hasThreat = riskLevel !== "Low";

  // 7) summary
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0]?.trim() ?? text.slice(0, 140);
  const issue = firstSentence.length > 160 ? `${firstSentence.slice(0, 157)}…` : firstSentence;
  const requestPatterns = [
    /\bi (?:would like|want|need|am requesting) (?:a |an |to )?([^.!?]+)/i,
    /\bplease ([^.!?]+)/i,
    /\bkindly ([^.!?]+)/i,
    /\brequest(?:ing)? (?:a |an |to )?([^.!?]+)/i,
  ];
  let customerRequest = "Explicit request not stated — infer from issue";
  for (const p of requestPatterns) {
    const m = text.match(p);
    const request = m?.[1]?.trim();
    if (request) {
      customerRequest = request.length > 120 ? `${request.slice(0, 117)}…` : request;
      break;
    }
  }
  const actionsTaken = /\b(we (have )?(refunded|reset|escalated|initiated|verified|checked)|support (has )?(replied|responded|confirmed))\b/i.test(text)
    ? "Support actions detected in conversation"
    : null;
  const currentStatus = resolutionStatus === "Unresolved" ? "Awaiting resolution" : resolutionStatus === "Resolved" ? "Reported resolved" : "Needs review";

  const priority: Priority =
    urgency === "Critical" || riskLevel === "Critical" || compromiseSignals >= 1
      ? "Critical"
      : urgency === "High" ||
          riskLevel === "High" ||
          (moneyMentioned && sentimentLabel === "Negative") ||
          issueLabel === "Duplicate Payment"
        ? "High"
        : riskLevel === "Medium" ? "Medium" : "Low";

  const recommendedAction = buildRecommendation(riskLevel, techniques, suspiciousUrls.length > 0, credentialRequest, otpRequest);

  return {
    id: crypto.randomUUID(),
    channel: "pasted-email",
    receivedAt: new Date().toISOString(),
    textLength: text.length,
    wordCount: text.split(/\s+/).filter(Boolean).length,
    language: "en",
    complaint: { category, categoryScore, issue, issueLabel, priority },
    sentiment: { label: sentimentLabel, score: Math.round(sentimentScore * 10) / 10, emotion, urgency },
    keywords,
    resolution: { status: resolutionStatus, signals: resolutionSignals.slice(0, 6) },
    summary: { issue, customerRequest, actionsTaken, currentStatus },
    security: {
      hasThreat,
      riskLevel,
      riskScore,
      threatTypes,
      socialEngineering,
      phishingSignals,
      urls,
      emails,
      attachments,
      credentialRequest,
      otpRequest,
      moneyMentioned,
      currencyAmounts: amounts,
      recommendedAction,
    },
  };
}

function buildRecommendation(
  riskLevel: RiskLevel,
  techniques: Set<string>,
  hasSuspiciousUrl: boolean,
  credentialRequest: boolean,
  otpRequest: boolean,
): string {
  if (riskLevel === "Critical") {
    let action = "Escalate to the security team immediately. ";
    if (credentialRequest || otpRequest) action += "Do not follow links or disclose credentials/OTP. ";
    if (hasSuspiciousUrl) action += "Block the flagged domain and preserve headers for forensics. ";
    action += "Notify affected customers through a verified channel.";
    return action;
  }
  if (riskLevel === "High") {
    let action = "Review within the hour before any agent replies. ";
    if (hasSuspiciousUrl) action += "Verify the link via threat-intel before responding. ";
    if (techniques.size >= 2) action += "Multiple social-engineering signals — treat as hostile until proven safe. ";
    return action;
  }
  if (riskLevel === "Medium") {
    return "Proceed with standard reply flow, but verify any links or payment requests before action.";
  }
  return "No security action required. Route by category and sentiment to the right queue.";
}

export const SAMPLE_EMAILS: { label: string; text: string }[] = [
  {
    label: "Phishing: urgency + lookalike URL",
    text: `URGENT! Your account has been compromised. Click this link immediately to secure your account and enter your username, password and OTP.
Visit http://paypa1-security.example/login within 2 hours or your account will be permanently closed.
Contact our support team at support@paypa1-security.example`,
  },
  {
    label: "Phishing: bank lure (no lookalike)",
    text: `Dear Customer,

We detected unusual activity in your online banking account. For your protection, you must verify your account within 24 hours or access will be limited.

Click here to confirm your payment details: http://account-secure-verify.xyz/login

Sincerely, Security Department`,
  },
  {
    label: "Refund complaint (billing)",
    text: `I was charged twice for my subscription this month. Please refund the extra payment of $49.99. I have emailed three times and nobody has solved my problem. This is extremely frustrating.`,
  },
  {
    label: "Attachment-based phishing",
    text: `Hi team, please review the attached invoice_2024.zip and confirm payment today. Details are in invoice_2024.zip — if you cannot open it, enable macros in the docm file. Thanks, billing@paypa1-secure.example`,
  },
  {
    label: "Delivery issue (benign)",
    text: `Hi, my order #4521 still hasn't arrived after 9 days. The tracking link shows the package was out for delivery on Monday but nothing since. Can you check what happened to my parcel? Thanks!`,
  },
];

// ─── recurring-issues aggregation ─────────────────────────────────────────

export interface TrendRow {
  issue: string;
  count: number;
  /** share of the analyzed corpus (0–1) */
  share: number;
  /** mean sentiment: -1 negative, 0 neutral, +1 positive */
  avgSentiment: number;
  /** mean urgency: 0 Low, 1 Medium, 2 High, 3 Critical */
  avgUrgency: number;
  /** fraction of this issue's conversations flagged as security threats (0–1) */
  threatShare: number;
}

const URGENCY_SCORE: Record<Priority, number> = { Low: 0, Medium: 1, High: 2, Critical: 3 };

/**
 * Group analyzed conversations by issue label (falling back to the complaint
 * category when no specific issue was detected) and rank them by frequency —
 * the "frequently reported issues" view from the product spec.
 */
export function aggregateIssues(results: AnalysisResult[]): TrendRow[] {
  const total = results.length;
  if (total === 0) return [];

  const groups = new Map<
    string,
    { count: number; sentimentSum: number; urgencySum: number; threats: number }
  >();
  for (const r of results) {
    const key =
      r.complaint.issueLabel && r.complaint.issueLabel !== "General Inquiry"
        ? r.complaint.issueLabel
        : r.complaint.category;
    const g = groups.get(key) ?? { count: 0, sentimentSum: 0, urgencySum: 0, threats: 0 };
    g.count += 1;
    g.sentimentSum +=
      r.sentiment.label === "Negative" ? -1 : r.sentiment.label === "Positive" ? 1 : 0;
    g.urgencySum += URGENCY_SCORE[r.sentiment.urgency];
    if (r.security.hasThreat) g.threats += 1;
    groups.set(key, g);
  }

  return Array.from(groups.entries())
    .map(([issue, g]) => ({
      issue,
      count: g.count,
      share: g.count / total,
      avgSentiment: Math.round((g.sentimentSum / g.count) * 100) / 100,
      avgUrgency: Math.round((g.urgencySum / g.count) * 100) / 100,
      threatShare: Math.round((g.threats / g.count) * 100) / 100,
    }))
    .sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue));
}
