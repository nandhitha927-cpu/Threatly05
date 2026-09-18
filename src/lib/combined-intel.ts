import { type AnalysisResult, type CombinedIntel } from "./analyzer";

/**
 * Fuse customer-support intelligence and security intelligence into one
 * answer to: what is the customer saying, what do they need, how serious is
 * the issue, and is this interaction a security threat? (product spec §9)
 */
export function buildCombinedIntel(r: AnalysisResult, rawText?: string): CombinedIntel {
  const techniqueNames = r.security.socialEngineering.map((t) => t.technique);
  const combinedTechniques =
    techniqueNames.length > 0 ? techniqueNames.join(" + ") : "None detected";

  // what is the customer saying — issue label + summary issue
  const whatTheySay =
    r.complaint.issueLabel !== "General Inquiry"
      ? `Reporting ${r.complaint.issueLabel.toLowerCase()}`
      : r.summary.issue.slice(0, 100);

  // how serious — derived from priority + stakes
  const seriousness =
    r.complaint.priority === "Critical"
      ? "Critical — immediate response required"
      : r.complaint.priority === "High"
        ? r.security.moneyMentioned
          ? "High — money at stake, respond promptly"
          : "High — respond promptly"
        : r.complaint.priority === "Medium"
          ? "Medium — handle within normal SLA"
          : "Low — routine inquiry";

  // spec §9: "click this link" without a literal URL still counts as a
  // suspicious link indicator — phishes often hide the href in buttons/images
  const linkReference =
    !!rawText &&
    /\b(click|tap|follow|open|go to)\b[^.!?]{0,24}\b(link|here|button|below|this)\b/i.test(rawText);

  // threat verdict
  const threatVerdict = r.security.hasThreat
    ? `Security threat detected — ${r.security.riskLevel} risk (score ${r.security.riskScore})`
    : "No security threat indicators";

  // recommended action: fuse security escalation with urgent-rule guidance
  let action: string;
  if (r.urgent.isUrgent && r.security.hasThreat) {
    action = `${r.security.recommendedAction} ${r.urgent.recommendedAction}`.trim();
  } else if (r.security.hasThreat) {
    action = r.security.recommendedAction;
  } else if (r.urgent.isUrgent) {
    action = r.urgent.recommendedAction;
  } else {
    action = `Route by category "${r.complaint.category}" and sentiment to the right queue.`;
  }
  if (
    r.security.hasThreat &&
    (r.security.credentialRequest || r.security.otpRequest) &&
    !/credential|otp|link/i.test(action)
  ) {
    action += " Do not follow suspicious links or disclose credentials.";
  }
  if (
    linkReference &&
    r.security.hasThreat &&
    !/do not (follow|click)/i.test(action)
  ) {
    action += " Do not allow anyone to follow the referenced link.";
  }

  return {
    customer: {
      category: r.complaint.category,
      issueLabel: r.complaint.issueLabel,
      sentiment: r.sentiment.label,
      emotion: r.sentiment.emotion,
      priority: r.complaint.priority,
      customerRequest: r.summary.customerRequest,
      whatTheySay,
    },
    security: {
      threatTypes: r.security.threatTypes,
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
