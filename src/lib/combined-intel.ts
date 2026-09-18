import { type AnalysisResult, type CombinedIntel } from "./analyzer";
import { type SupportedLang } from "./languages";
import { phrases, tr } from "./report-i18n";

/**
 * Fuse customer-support intelligence and security intelligence into one
 * answer to: what is the customer saying, what do they need, how serious is
 * the issue, and is this interaction a security threat? (product spec §9)
 *
 * All synthesized phrases are produced in the selected UI language.
 */
export function buildCombinedIntel(
  r: AnalysisResult,
  rawText?: string,
  uiLang: SupportedLang = "en",
): CombinedIntel {
  const P = phrases(uiLang);

  const techniqueNames = r.security.socialEngineering.map((t) =>
    tr(uiLang, "techniques", t.technique),
  );
  const combinedTechniques =
    techniqueNames.length > 0 ? techniqueNames.join(" + ") : P.noTechniques;

  // what is the customer saying — issue label + summary issue
  const whatTheySay =
    r.complaint.issueLabel !== "General Inquiry"
      ? P.whatTheySay(tr(uiLang, "issueLabels", r.complaint.issueLabel))
      : r.summary.issue.slice(0, 100);

  // how serious — derived from priority + stakes
  const seriousness = P.seriousness(
    r.complaint.priority,
    r.security.moneyMentioned,
  );

  // spec §9: "click this link" without a literal URL still counts as a
  // suspicious link indicator — phishes often hide the href in buttons/images
  const linkReference =
    !!rawText &&
    (/\b(click|tap|follow|open|go to)\b[^.!?]{0,24}\b(link|here|button|below|this)\b/i.test(rawText) ||
      // multilingual click-through cues (es/fr/de/pt/hi/ml)
      /\b(haga clic|pulse|abra|cliquez|appuyez|ouvrez|klicken|tippen|\u00f6ffnen|clique|toque)\b[^.!?]{0,24}\b(aqu\u00ed|ici|hier|aqui|auf den link|no link|\u092f\u0939\u093e\u0901|\u0932\u093f\u0902\u0915)\b/i.test(rawText) ||
      /(\u0d15\u0d4d\u0d32\u0d3f\u0d15\u0d4d\u0d15\u0d4d|\u0d32\u0d3f\u0d19\u0d4d\u0d15\u0d4d|\u0d07\u0d35\u0d3f\u0d1f\u0d46)/.test(rawText));

  // threat verdict
  const riskT = tr(uiLang, "riskLevels", r.security.riskLevel);
  const threatVerdict = r.security.hasThreat
    ? P.threatVerdictThreat(riskT, r.security.riskScore)
    : P.threatVerdictNone;

  // recommended action: fuse security escalation with urgent-rule guidance
  let action: string;
  if (r.urgent.isUrgent && r.security.hasThreat) {
    action = `${r.security.recommendedAction} ${r.urgent.recommendedAction}`.trim();
  } else if (r.security.hasThreat) {
    action = r.security.recommendedAction;
  } else if (r.urgent.isUrgent) {
    action = r.urgent.recommendedAction;
  } else {
    action = P.actionRoute(tr(uiLang, "categories", r.complaint.category));
  }
  // translate the assembled action sentence-by-sentence
  action = translateSentence(action, uiLang);

  if (
    r.security.hasThreat &&
    (r.security.credentialRequest || r.security.otpRequest) &&
    !/credential|otp|link/i.test(action)
  ) {
    action += P.actionNoLinks;
  }
  if (
    linkReference &&
    r.security.hasThreat &&
    !/do not (follow|click)/i.test(action)
  ) {
    action += P.actionNoLinkFollow;
  }

  return {
    customer: {
      category: tr(uiLang, "categories", r.complaint.category),
      issueLabel: tr(uiLang, "issueLabels", r.complaint.issueLabel),
      sentiment: tr(uiLang, "sentiments", r.sentiment.label),
      emotion: tr(uiLang, "emotions", r.sentiment.emotion),
      priority: r.complaint.priority,
      customerRequest: r.summary.customerRequest,
      whatTheySay,
    },
    security: {
      threatTypes: r.security.threatTypes.map((t) => tr(uiLang, "threatTypes", t)),
      socialEngineering: r.security.socialEngineering.length > 0,
      techniques: combinedTechniques,
      suspiciousUrl: r.security.urls.some((u) => u.risk !== "low") || linkReference,
      credentialRequest: r.security.credentialRequest,
      otpRequest: r.security.otpRequest,
      riskLevel: r.security.riskLevel,
      riskScore: r.security.riskScore,
    },
    seriousness,
    threatVerdict,
    recommendedAction: action,
  };
}

/**
 * Sentence-wise translation of fused English action strings. Splits on
 * sentence boundaries and looks up each fragment in the actions and
 * urgentActions tables (which contain the exact engine sentences).
 */
function translateSentence(action: string, lang: SupportedLang): string {
  const parts = action.split(/(?<=[.!?])\s+/);
  const translated = parts.map((part) => {
    const trimmed = part.trim();
    if (!trimmed) return part;
    const lookup = trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
    return (
      tr(lang, "actions", lookup) ||
      tr(lang, "urgentActions", lookup) ||
      trimmed
    );
  });
  return translated.join(" ");
}
