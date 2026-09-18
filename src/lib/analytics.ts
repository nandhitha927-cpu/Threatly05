import { analyzeText, type AnalysisResult } from "./analyzer";
import { generateSampleCorpus } from "./sample-corpus";

export interface Kpis {
  totalConversations: number;
  totalComplaints: number;
  positive: number;
  negative: number;
  neutral: number;
  mostCommonComplaint: { name: string; count: number } | null;
  mostFrequentIssue: { name: string; count: number } | null;
  unresolved: number;
  critical: number;
  threats: number;
}

export interface SentimentSlice {
  name: string;
  value: number;
  color: string;
}

export interface CategorySlice {
  name: string;
  count: number;
}

export interface IssueSlice {
  name: string;
  count: number;
}

export interface TrendPoint {
  label: string;
  negative: number;
  neutral: number;
  positive: number;
}

/**
 * Compute the customer-support KPIs (product spec §10) over a batch of
 * analyzed conversations. Pure function so both session history and the demo
 * corpus can feed it.
 */
export function computeAnalytics(results: AnalysisResult[]) {
  const total = results.length;

  let negative = 0;
  let neutral = 0;
  let positive = 0;
  let unresolved = 0;
  let critical = 0;
  let threats = 0;

  const categoryCounts = new Map<string, number>();
  const issueCounts = new Map<string, number>();

  for (const r of results) {
    if (r.sentiment.label === "Negative") negative++;
    else if (r.sentiment.label === "Positive") positive++;
    else neutral++;

    // a complaint = anything beyond a neutral general inquiry
    if (
      r.sentiment.label === "Negative" ||
      r.complaint.category !== "Other" ||
      r.complaint.issueLabel !== "General Inquiry"
    ) {
      categoryCounts.set(r.complaint.category, (categoryCounts.get(r.complaint.category) ?? 0) + 1);
    }
    if (r.complaint.issueLabel !== "General Inquiry") {
      issueCounts.set(r.complaint.issueLabel, (issueCounts.get(r.complaint.issueLabel) ?? 0) + 1);
    }

    if (r.resolution.status === "Unresolved") unresolved++;
    if (r.complaint.priority === "Critical") critical++;
    if (r.security.hasThreat) threats++;
  }

  const totalComplaints = Array.from(categoryCounts.values()).reduce((a, b) => a + b, 0);

  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const topIssue = Array.from(issueCounts.entries()).sort((a, b) => b[1] - a[1])[0];

  const kpis: Kpis = {
    totalConversations: total,
    totalComplaints: totalComplaints,
    positive,
    negative,
    neutral,
    mostCommonComplaint: topCategory ? { name: topCategory[0], count: topCategory[1] } : null,
    mostFrequentIssue: topIssue ? { name: topIssue[0], count: topIssue[1] } : null,
    unresolved,
    critical,
    threats,
  };

  const sentimentDistribution: SentimentSlice[] = [
    { name: "Negative", value: negative, color: "#dc2626" },
    { name: "Neutral", value: neutral, color: "#64748b" },
    { name: "Positive", value: positive, color: "#16a34a" },
  ].filter((s) => s.value > 0);

  const categoryDistribution: CategorySlice[] = Array.from(categoryCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const issueFrequency: IssueSlice[] = Array.from(issueCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // weekly trend (ISO week buckets from receivedAt)
  const weekBuckets = new Map<string, TrendPoint>();
  for (const r of results) {
    const d = new Date(r.receivedAt);
    const weekKey = getWeekKey(d);
    const bucket = weekBuckets.get(weekKey) ?? {
      label: weekKey,
      negative: 0,
      neutral: 0,
      positive: 0,
    };
    if (r.sentiment.label === "Negative") bucket.negative++;
    else if (r.sentiment.label === "Positive") bucket.positive++;
    else bucket.neutral++;
    weekBuckets.set(weekKey, bucket);
  }
  const weeklyTrend = Array.from(weekBuckets.values()).sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  return { kpis, sentimentDistribution, categoryDistribution, issueFrequency, weeklyTrend };
}

function getWeekKey(d: Date): string {
  // simple ISO-ish week bucket: YYYY-Wnn
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/** Distinct CS-IDs for structured output (spec expected output format). */
export function conversationId(r: AnalysisResult): string {
  // deterministic per-result: hash the uuid
  const n = r.id.split("-").reduce((acc, part) => acc + parseInt(part.slice(0, 4), 36) || 0, 0);
  return `CS-${10000 + (n % 90000)}`;
}

/**
 * Build a representative demo analytics batch: the seeded corpus (500) plus a
 * handful of hand-written threat conversations so the security KPI isn't empty.
 */
export function buildAnalyticsCorpus(): AnalysisResult[] {
  const results = generateSampleCorpus(500);
  const extras = [
    "URGENT! Your account has been compromised. Click this link immediately to secure your account and enter your username, password and OTP.",
    "Contact our support team at support@paypa1-security.example or visit http://paypa1-security.example/login",
    "Someone has accessed my account and transferred ₹25,000 without my permission. I need help immediately.",
    "Please review the attached invoice_2024.zip and confirm payment today. Enable macros in the docm file if it will not open.",
    "I was charged twice for my subscription this month. Please refund the extra payment. Third time contacting you about this!",
    "My payment was deducted but my order was not confirmed. Support says they are checking. I still haven't received my refund.",
  ];
  for (const t of extras) results.push(analyzeText(t));
  return results;
}
