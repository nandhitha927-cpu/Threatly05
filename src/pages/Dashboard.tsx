import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  ScanSearch,
  Gauge,
  Tag,
  AlertTriangle,
  Link2,
  AtSign,
  Paperclip,
  RotateCcw,
  Sparkles,
  ListFilter,
  LogOut,
  Inbox,
  TrendingUp,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import {
  analyzeText,
  aggregateIssues,
  buildConversationSummary,
  SAMPLE_EMAILS,
  type AnalysisResult,
  type TrendRow,
} from "@/lib/analyzer";
import { generateSampleCorpus } from "@/lib/sample-corpus";
import { buildCombinedIntel } from "@/lib/combined-intel";
import { conversationId } from "@/lib/analytics";
import { LANG_LABELS } from "@/lib/analyzer";
import AnalyticsView from "@/pages/AnalyticsView";

/** Spec §6 demo: a long 24-message support thread. */
const DEMO_THREAD = `Customer: Hi, I was charged twice for my order #88213 this month. The amount ₹1,299 was deducted two times.
Support: Hello! Sorry for the trouble. Let me check your payment records right away.
Customer: It's the second time this has happened. Please refund the duplicate payment.
Support: I have verified the transaction and I can confirm two payments of ₹1,299 were taken for the same order.
Customer: Good. So when will I get my money back?
Support: We are checking with the payment gateway on why the charge went through twice.
Customer: This is frustrating, I have been waiting.
Support: I sincerely apologize for the inconvenience. I have initiated the refund for the duplicate transaction.
Customer: Okay, how long will the refund take?
Support: The refund will be processed within 5-7 business days. You will receive a confirmation email.
Customer: Fine. Also please make sure this doesn't happen again.
Support: Absolutely, we have escalated the duplicate-charge case to the billing team to review the root cause.
Customer: I still haven't received any confirmation email.
Support: Let me share the refund reference number with you right now.
Customer: Yes please.
Support: Here it is: RFND-88213-AX. Please keep it for tracking.
Customer: Thanks. And the escalation?
Support: The billing team is looking into it and will get back to you within 48 hours.
Customer: Alright. I will wait for the refund then.
Support: Is there anything else I can help you with today?
Customer: No, that's all for now.
Support: Thank you for your patience. Have a great day!
Customer: Thanks, bye.
Support: Bye! Take care.`;

const riskStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/25",
  Medium: "bg-amber-500/10 text-amber-700 border-amber-500/25",
  High: "bg-orange-500/10 text-orange-700 border-orange-500/25",
  Critical: "bg-red-500/10 text-red-700 border-red-500/25",
};

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="glass-panel border-white/70 shadow-none">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 text-xs font-medium">
          <Icon className="size-3.5 text-blue-600" />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}

function FindingRow({
  icon: Icon,
  title,
  sub,
  risk,
  flags,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  risk: string;
  flags: string[];
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border/70 p-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {flags.slice(0, 2).map((f) => (
          <span
            key={f}
            className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {f}
          </span>
        ))}
        <Badge className={`border font-semibold shadow-none ${riskStyles[risk] ?? riskStyles.Low}`}>
          {risk}
        </Badge>
      </div>
    </div>
  );
}

function TrendRowItem({
  row,
  rank,
  maxCount,
}: {
  row: TrendRow;
  rank: number;
  maxCount: number;
}) {
  const pct = Math.round((row.count / maxCount) * 100);
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(rank * 0.04, 0.4) }}
      className="flex flex-col gap-2 rounded-xl border border-border/70 p-3.5 sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="flex min-w-0 items-center gap-3 sm:w-64 sm:shrink-0">
        <span className="w-6 text-center text-xs font-semibold text-muted-foreground">
          {rank}
  </span>
        <p className="truncate text-sm font-medium">{row.issue}</p>
      </div>
      <div className="min-w-0 flex-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-blue-600/80"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, delay: Math.min(rank * 0.04, 0.4) }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {(row.share * 100).toFixed(1)}% of corpus · avg sentiment {row.avgSentiment.toFixed(2)} · avg urgency {row.avgUrgency.toFixed(2)} · threat share {(row.threatShare * 100).toFixed(0)}%
        </p>
      </div>
      <Badge variant="secondary" className="font-mono shadow-none sm:shrink-0">
        {row.count.toLocaleString()} reports
      </Badge>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [expectedDomain, setExpectedDomain] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [batch, setBatch] = useState<AnalysisResult[] | null>(null);
  const [view, setView] = useState<"console" | "analytics">("console");

  const analyze = () => {
    if (!input.trim()) return;
    const r = analyzeText(input, {
      expectedDomain: expectedDomain.trim() || undefined,
    });
    setResult(r);
    setHistory((h) => [r, ...h].slice(0, 25));
  };

  const reset = () => {
    setInput("");
    setResult(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const topKeywords = result?.keywords.slice(0, 5) ?? [];
  const threatCount = useMemo(
    () => history.filter((h) => h.security.hasThreat).length,
    [history],
  );
  const corpus = useMemo(() => batch ?? history, [batch, history]);
  const trends = useMemo(() => aggregateIssues(corpus), [corpus]);
  const maxTrendCount = trends[0]?.count ?? 1;

  // Spec §9: combined intelligence synthesis for the latest result
  const combined = useMemo(() => (result ? buildCombinedIntel(result, input) : null), [result, input]);

  // Spec §6: structured summary for the latest result
  const convSummary = useMemo(() => {
    if (!result) return null;
    return buildConversationSummary(result.resolution.turnAnalyses, {
      resolutionStatus: result.resolution.status,
      openPromises: result.resolution.followUp.openPromises,
      isUrgent: result.urgent.isUrgent,
      urgency: result.sentiment.urgency,
      riskLevel: result.security.riskLevel,
      fallbackIssue: result.summary.issue,
      fallbackRequest: result.summary.customerRequest,
    });
  }, [result]);

  const runDemoBatch = () => {
    const corpusResults = generateSampleCorpus(500);
    setBatch(corpusResults);
  };

  return (
    <div className="glass-backdrop min-h-screen text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">InsightGuard Console</p>
              <p className="text-xs text-muted-foreground">
                {user?.email ?? "Signed in"} · {history.length} analyzed
                {threatCount > 0 ? ` · ${threatCount} threats` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border/70 bg-background/50 p-0.5">
              <Button
                type="button"
                size="sm"
                variant={view === "console" ? "default" : "ghost"}
                className="h-8 gap-1.5 rounded-md"
                onClick={() => setView("console")}
              >
                <ScanSearch className="size-3.5" />
                Console
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === "analytics" ? "default" : "ghost"}
                className="h-8 gap-1.5 rounded-md"
                onClick={() => setView("analytics")}
              >
                <TrendingUp className="size-3.5" />
                Analytics
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              className="glass-chip gap-2 border-white/70"
              onClick={handleSignOut}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8">
        {view === "analytics" ? (
          <AnalyticsView corpus={corpus} />
        ) : (
          <>
        {/* Input */}
        <Card className="glass-panel-strong border-white/80 shadow-none">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 tracking-tight">
                  <ScanSearch className="size-5 text-blue-600" />
                  Analyze a conversation
                </CardTitle>
                <CardDescription className="mt-1">
                  Paste a customer email, chat or ticket — get support intelligence and a
                  phishing verdict in one pass.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[...SAMPLE_EMAILS, { label: "Long thread: duplicate charge (summary demo)", text: DEMO_THREAD }].map((s) => (
                  <Button
                    key={s.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="glass-chip h-8 border-white/70 text-xs"
                    onClick={() => setInput(s.text)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste the customer message here…"
              className="min-h-40 resize-y border-border/70 bg-white/60 text-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Input
                type="text"
                value={expectedDomain}
                onChange={(e) => setExpectedDomain(e.target.value)}
                placeholder="Your org domain (e.g. acme.com) — improves sender checks"
                className="h-9 max-w-xs border-border/70 bg-white/60 text-xs"
              />
              <Button type="button" onClick={analyze} disabled={!input.trim()} className="gap-2">
                <ScanSearch className="size-4" />
                Analyze message
              </Button>
              <Button
                type="button"
                variant="outline"
                className="glass-chip gap-2 border-white/70"
                onClick={reset}
                disabled={!input && !result}
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
              <span className="ml-auto text-xs text-muted-foreground">
                {input.trim() ? `${input.trim().split(/\s+/).length} words` : "No input yet"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-6 grid gap-6"
          >
            {/* Spec §9: Combined intelligence verdict */}
            {combined && (
              <div
                className={`rounded-2xl border p-5 ${
                  result.security.hasThreat
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-emerald-500/25 bg-emerald-500/5"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-2 font-semibold tracking-tight">
                    {result.security.hasThreat ? (
                      <ShieldAlert className="size-5 text-red-600" />
                    ) : (
                      <ShieldCheck className="size-5 text-emerald-600" />
                    )}
                    {combined.threatVerdict}
                  </p>
                  <Badge
                    className={`border font-semibold shadow-none ${riskStyles[result.security.riskLevel]}`}
                  >
                    Risk: {result.security.riskLevel} ({result.security.riskScore})
                  </Badge>
                </div>
                <p className="mt-1.5 text-sm font-medium text-foreground/90">
                  {combined.seriousness}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {/* Customer intelligence */}
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Tag className="size-3.5 text-blue-600" />
                      Customer intelligence
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm">
                      <li>
                        <span className="text-muted-foreground">Category: </span>
                        <span className="font-medium">{combined.customer.category}</span>
                        {combined.customer.issueLabel !== "General Inquiry" && (
                          <span className="text-muted-foreground"> · {combined.customer.issueLabel}</span>
                        )}
                      </li>
                      <li>
                        <span className="text-muted-foreground">Sentiment: </span>
                        <span className="font-medium">
                          {combined.customer.sentiment} · {combined.customer.emotion}
                        </span>
                      </li>
                      <li>
                        <span className="text-muted-foreground">Priority: </span>
                        <span className="font-medium">{combined.customer.priority}</span>
                      </li>
                      <li>
                        <span className="text-muted-foreground">Customer request: </span>
                        <span className="font-medium">{combined.customer.customerRequest}</span>
                      </li>
                      <li className="text-xs text-muted-foreground">{combined.customer.whatTheySay}</li>
                    </ul>
                  </div>
                  {/* Security intelligence */}
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3.5">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <ShieldAlert className="size-3.5 text-orange-600" />
                      Security intelligence
                    </p>
                    <ul className="mt-2 grid gap-1 text-sm">
                      <li>
                        <span className="text-muted-foreground">Threat type: </span>
                        <span className="font-medium">
                          {combined.security.threatTypes.length > 0
                            ? combined.security.threatTypes.join(", ")
                            : "None"}
                        </span>
                      </li>
                      <li>
                        <span className="text-muted-foreground">Social engineering: </span>
                        <span className={combined.security.socialEngineering ? "font-semibold text-orange-700" : "font-medium"}>
                          {combined.security.socialEngineering ? "Yes" : "No"}
                        </span>
                        {combined.security.socialEngineering && (
                          <span className="text-muted-foreground"> — {combined.security.techniques}</span>
                        )}
                      </li>
                      <li>
                        <span className="text-muted-foreground">Suspicious URL: </span>
                        <span className={combined.security.suspiciousUrl ? "font-semibold text-red-700" : "font-medium"}>
                          {combined.security.suspiciousUrl ? "Detected" : "None"}
                        </span>
                      </li>
                      <li>
                        <span className="text-muted-foreground">Credential request: </span>
                        <span className={combined.security.credentialRequest ? "font-semibold text-red-700" : "font-medium"}>
                          {combined.security.credentialRequest ? "Detected" : "None"}
                        </span>
                      </li>
                      <li>
                        <span className="text-muted-foreground">OTP request: </span>
                        <span className={combined.security.otpRequest ? "font-semibold text-red-700" : "font-medium"}>
                          {combined.security.otpRequest ? "Detected" : "None"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-border/60 bg-background/60 p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Recommended action
                  </p>
                  <p className="mt-1 text-sm font-medium">{combined.recommendedAction}</p>
                </div>
              </div>
            )}

            {/* Spec §6: conversation summary */}
            {convSummary && convSummary.isMultiTurn && (
              <Card className="glass-panel border-white/70 shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                    <Sparkles className="size-4 text-blue-600" />
                    Conversation summary
                  </CardTitle>
                  <CardDescription>
                    Manager view — built from {convSummary.turnCount} turns, no need to read the full thread.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <div className="glass-inset rounded-xl p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Issue</p>
                    <p className="mt-1 text-sm leading-relaxed">{convSummary.issue}</p>
                  </div>
                  <div className="glass-inset rounded-xl p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer request</p>
                    <p className="mt-1 text-sm leading-relaxed">{convSummary.customerRequest}</p>
                  </div>
                  <div className="glass-inset rounded-xl p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions taken</p>
                    {convSummary.actionsTaken.length > 0 ? (
                      <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                        {convSummary.actionsTaken.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">None recorded yet</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`border shadow-none ${riskStyles[convSummary.priority]}`}>
                      Priority: {convSummary.priority}
                    </Badge>
                    <Badge variant="secondary" className="shadow-none">
                      Status: {convSummary.currentStatus}
                    </Badge>
                  </div>
                </CardContent>
                {result.security.hasThreat && result.urgent.isUrgent && (
                  <p className="px-6 pb-5 text-xs text-muted-foreground">
                    Note: security/urgent signals from the full analysis escalate the handling of this thread.
                  </p>
                  )}
              </Card>
            )}

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Tag}
                label="Complaint category"
                value={result.complaint.category}
                hint={`Issue: ${result.complaint.issueLabel} · Match score ${result.complaint.categoryScore}`}
              />
              <StatCard
                icon={Gauge}
                label="Sentiment"
                value={`${result.sentiment.label} · ${result.sentiment.emotion}`}
                hint={`Urgency: ${result.sentiment.urgency}`}
              />
              <StatCard
                icon={AlertTriangle}
                label="Priority"
                value={result.complaint.priority}
                hint={`Resolution: ${result.resolution.status}`}
              />
              <StatCard
                icon={Sparkles}
                label="Top keyword"
                value={topKeywords[0] ?? "—"}
                hint={topKeywords.slice(1).join(", ") || "No other keywords"}
              />
            </div>

            {/* Detail tabs */}
            <Card className="glass-panel border-white/70 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                  <ListFilter className="size-4 text-blue-600" />
                  Intelligence detail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="summary">
                  <TabsList className="flex-wrap">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="urls">
                      URLs ({result.security.urls.length})
                    </TabsTrigger>
                    <TabsTrigger value="emails">
                      Senders ({result.security.emails.length})
                    </TabsTrigger>
                    <TabsTrigger value="attachments">
                      Attachments ({result.security.attachments.length})
                    </TabsTrigger>
                    <TabsTrigger value="phishing">
                      Phishing ({result.security.phishingSignals.length})
                    </TabsTrigger>
                    <TabsTrigger value="techniques">
                      Techniques ({result.security.socialEngineering.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4 grid gap-3">
                    {result.urgent.isUrgent && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-red-700">
                          <ShieldAlert className="size-3.5" />
                          Requires immediate attention
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.urgent.reasons.map((reason) => (
                            <Badge key={reason} className="border-red-500/25 bg-red-500/10 text-red-700 shadow-none">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-foreground/90">{result.urgent.recommendedAction}</p>
                      </div>
                    )}
                    <div className="glass-inset rounded-xl p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Issue
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{result.summary.issue}</p>
                    </div>
                    <div className="glass-inset rounded-xl p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Customer request
                      </p>
                      <p className="mt-1 text-sm leading-relaxed">{result.summary.customerRequest}</p>
                    </div>
                    {result.resolution.turnAnalyses.length > 1 && (
                      <div className="glass-inset rounded-xl p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Conversation timeline ({result.resolution.turnAnalyses.length} turns)
                        </p>
                        <div className="mt-2 grid gap-2">
                          {result.resolution.turnAnalyses.map((t) => (
                            <div
                              key={t.index}
                              className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/40 p-2.5"
                            >
                              <Badge
                                className={
                                  t.role === "customer"
                                    ? "shrink-0 border-blue-500/25 bg-blue-500/10 text-blue-700 shadow-none"
                                    : t.role === "support"
                                      ? "shrink-0 border-emerald-500/25 bg-emerald-500/10 text-emerald-700 shadow-none"
                                      : "shrink-0 shadow-none"
                                }
                              >
                                {t.role === "customer" ? "Customer" : t.role === "support" ? "Support" : "Unknown"}
                              </Badge>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs leading-relaxed">{t.text}</p>
                                {t.signals.length > 0 && (
                                  <p className="mt-0.5 text-[11px] text-muted-foreground">{t.signals.join(" · ")}</p>
                                )}
                              </div>
                              <Badge
                                className={`shrink-0 border shadow-none ${
                                  t.status === "Resolved"
                                    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700"
                                    : t.status === "Unresolved"
                                      ? "border-orange-500/25 bg-orange-500/10 text-orange-700"
                                      : ""
                                }`}
                              >
                                {t.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                        {result.resolution.followUp.openPromises.length > 0 && (
                          <div className="mt-3 rounded-lg border border-orange-500/25 bg-orange-500/5 p-3">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">
                              Unclosed support promises
                            </p>
                            <ul className="mt-1.5 list-inside list-disc text-xs text-muted-foreground">
                              {result.resolution.followUp.openPromises.map((p) => (
                                <li key={p}>“{p}”</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.resolution.followUp.needsFollowUp && (
                          <p className="mt-2 text-xs font-medium text-orange-700">
                            {result.resolution.followUp.lastSpeaker === "customer"
                              ? "Conversation ends with the customer — follow-up recommended."
                              : "Issue remains open — schedule a follow-up."}
                          </p>
                        )}
                      </div>
                    )}
                    {result.resolution.signals.length > 0 && (
                      <div className="glass-inset rounded-xl p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Resolution signals
                        </p>
                        <ul className="mt-1.5 list-inside list-disc text-sm text-muted-foreground">
                          {result.resolution.signals.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.security.currencyAmounts.length > 0 && (
                      <div className="glass-inset rounded-xl p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Amounts mentioned
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {result.security.currencyAmounts.map((a) => (
                            <Badge key={a} variant="secondary" className="font-mono text-xs shadow-none">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="urls" className="mt-4 grid gap-2.5">
                    {result.security.urls.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No URLs found in this message.</p>
                    ) : (
                      result.security.urls.map((u) => (
                        <div key={u.url} className="rounded-xl border border-border/70 p-3.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                                <Link2 className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="break-all text-sm font-medium text-foreground">{u.url}</p>
                                <p className="text-xs text-muted-foreground">
                                  Domain: {u.registrableDomain}
                                  {u.lookalikeBrand ? ` · impersonates ${u.lookalikeBrand}` : ""}
                                </p>
                              </div>
                            </div>
                            <Badge className={`shrink-0 border font-semibold shadow-none ${riskStyles[u.risk] ?? riskStyles.Low}`}>
                              {u.risk}
                            </Badge>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3">
                            <div>
                              <span className="text-muted-foreground">Subdomain: </span>
                              <span className="font-mono">{u.subdomain || "—"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Length: </span>
                              <span className="font-mono">{u.urlLength} chars</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">HTTPS: </span>
                              <span className={u.https ? "text-emerald-700" : "font-semibold text-red-700"}>
                                {u.https ? "Yes" : "No"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">IP host: </span>
                              <span className={u.isIpHost ? "font-semibold text-red-700" : "font-mono"}>
                                {u.isIpHost ? "Yes" : "No"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Shortener: </span>
                              <span className={u.isShortener ? "font-semibold text-orange-700" : "font-mono"}>
                                {u.isShortener ? "Yes" : "No"}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Creds in URL: </span>
                              <span className={u.hasCredentialsInUrl ? "font-semibold text-red-700" : "font-mono"}>
                                {u.hasCredentialsInUrl ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-3">
                              <span className="text-muted-foreground">Redirects: </span>
                              {u.redirectHints.length > 0 ? (
                                <span className="font-semibold text-orange-700">{u.redirectHints.length} hint(s)</span>
                              ) : (
                                <span className="font-mono">none detected</span>
                              )}
                            </div>
                          </div>
                          {u.suspiciousChars.length > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Suspicious characters: <span className="font-mono">{u.suspiciousChars.join(" ")}</span>
                            </p>
                          )}
                          {u.flags.length > 0 && (
                            <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                              {u.flags.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="emails" className="mt-4 grid gap-2.5">
                    {result.security.emails.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No email addresses found.</p>
                    ) : (
                      result.security.emails.map((e) => (
                        <div key={e.email} className="rounded-xl border border-border/70 p-3.5">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                                <AtSign className="size-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="break-all text-sm font-medium text-foreground">
                                  {e.displayName ? `${e.displayName} <${e.email}>` : e.email}
                                </p>
                                <p className="text-xs text-muted-foreground">Domain: {e.domain}</p>
                              </div>
                            </div>
                            <Badge className={`shrink-0 border font-semibold shadow-none ${riskStyles[e.risk] ?? riskStyles.Low}`}>
                              {e.risk}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-foreground/80">
                            <span className="font-semibold">Risk indicator: </span>
                            {e.risk === "low"
                              ? "No impersonation signals"
                              : e.lookalikeBrand
                                ? "Potential impersonation"
                                : e.displayNameImpersonates
                                  ? "Potential impersonation (display name)"
                                  : "Potential mismatch"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">Reason: {e.reason}</p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span>
                              <span className="text-muted-foreground">Free-mail: </span>
                              <span className={e.isFreeMail ? "font-semibold text-orange-700" : "font-mono"}>
                                {e.isFreeMail ? "Yes" : "No"}
                              </span>
                            </span>
                            <span>
                              <span className="text-muted-foreground">Lookalike chars: </span>
                              <span className="font-mono">
                                {e.lookalikeChars.length > 0 ? e.lookalikeChars.join(" ") : "—"}
                              </span>
                            </span>
                            <span>
                              <span className="text-muted-foreground">Domain mismatch: </span>
                              <span className={e.domainMismatch ? "font-semibold text-red-700" : "font-mono"}>
                                {e.domainMismatch ? "Yes" : "No"}
                              </span>
                            </span>
                            {expectedDomain && (
                              <span>
                                <span className="text-muted-foreground">Expected org domain: </span>
                                <span className="font-mono">{expectedDomain}</span>
                              </span>
                            )}
                          </div>
                          {e.flags.length > 0 && (
                            <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                              {e.flags.map((f) => (
                                <li key={f}>{f}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="attachments" className="mt-4 grid gap-2.5">
                    {result.security.attachments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No attachments referenced.</p>
                    ) : (
                      result.security.attachments.map((a) => (
                        <FindingRow
                          key={a.name}
                          icon={Paperclip}
                          title={a.name}
                          sub={`Type: .${a.ext || "unknown"}`}
                          risk={a.risk}
                          flags={a.flags}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="phishing" className="mt-4 grid gap-2.5">
                    {result.security.phishingSignals.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No phishing lure signals detected in this message.
                      </p>
                    ) : (
                      result.security.phishingSignals.map((s) => (
                        <div
                          key={s.signal}
                          className="flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-3.5"
                        >
                          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{s.signal}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                          </div>
                          <Badge
                            className="ml-auto shrink-0 border-red-500/25 bg-red-500/10 text-red-700 shadow-none"
                          >
                            +{s.weight}
                          </Badge>
                        </div>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="techniques" className="mt-4 grid gap-2.5">
                    {result.security.socialEngineering.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No social-engineering techniques detected.
                      </p>
                    ) : (
                      result.security.socialEngineering.map((t) => (
                        <div
                          key={t.technique}
                          className="flex items-start gap-3 rounded-xl border border-orange-500/25 bg-orange-500/5 p-3.5"
                        >
                          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-600" />
                          <div>
                            <p className="text-sm font-medium">{t.technique}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{t.reason}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Spec §10: structured result card in expected-output format */}
            <Card className="glass-panel border-white/70 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                  <FileText className="size-4 text-blue-600" />
                  Structured result
                </CardTitle>
                <CardDescription>
                  Machine-readable card in the spec's expected-output format.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-white/60 p-4 font-mono text-xs leading-relaxed text-foreground/90">
                  <div className="grid gap-1.5">
                    <p>
                      <span className="text-muted-foreground">Conversation ID:</span>{" "}
                      <span className="font-semibold">{conversationId(result)}</span>
                      <span className="text-muted-foreground"> · Language:</span>{" "}
                      <span className="font-semibold">{LANG_LABELS[result.language]}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Customer Issue:</span> {result.summary.issue}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Category:</span> {result.complaint.category}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Sentiment:</span> {result.sentiment.label}
                      <span className="text-muted-foreground"> · Emotion:</span> {result.sentiment.emotion}
                      <span className="text-muted-foreground"> · Urgency:</span> {result.sentiment.urgency}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Priority:</span>{" "}
                      <span className="font-semibold">{result.complaint.priority}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Resolution Status:</span> {result.resolution.status}
                    </p>
                    {convSummary && (
                      <p>
                        <span className="text-muted-foreground">Summary:</span> {convSummary.customerRequest}
                      </p>
                    )}
                    <div className="my-1 border-t border-dashed" />
                    <p>
                      <span className="text-muted-foreground">Security Analysis:</span>{" "}
                      <span className={result.security.hasThreat ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>
                        {result.security.hasThreat ? "Potential Threat Detected" : "No Threat Detected"}
                      </span>
                    </p>
                    {result.security.hasThreat && (
                      <>
                        <p>
                          <span className="text-muted-foreground">Threat Type:</span> {result.security.threatTypes.join(", ") || "—"}
                        </p>
                        {result.security.urls.length > 0 && (
                          <p>
                            <span className="text-muted-foreground">Suspicious URL:</span> Detected ({result.security.urls.length})
                          </p>
                        )}
                        {result.security.emails.length > 0 && (
                          <p>
                            <span className="text-muted-foreground">Suspicious Domain:</span> Detected ({result.security.emails.length} sender flag)
                          </p>
                        )}
                        <p>
                          <span className="text-muted-foreground">Social Engineering:</span>{" "}
                          {result.security.socialEngineering.length > 0 ? `Possible (${result.security.socialEngineering[0].technique})` : "No"}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Risk Level:</span>{" "}
                          <span className="font-semibold">{result.security.riskLevel}</span>
                        </p>
                      </>
                    )}
                    <p className="mt-1">
                      <span className="text-muted-foreground">Recommended Action:</span> {combined?.recommendedAction ?? result.summary.actionsTaken}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Frequently reported issues */}
        {trends.length > 0 && (
          <Card className="glass-panel mt-6 border-white/70 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                    <TrendingUp className="size-4 text-blue-600" />
                    Frequently reported issues
                  </CardTitle>
                  <CardDescription>
                    {batch
                      ? `Systemic problems across a ${corpus.length.toLocaleString()}-conversation demo batch`
                      : "Recurring issues across this session — run a demo batch for volume trends"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2"
                    onClick={runDemoBatch}
                    disabled={!!batch}
                  >
                    <Layers className="size-4" />
                    Run 500-message demo batch
                  </Button>
                  {batch && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="glass-chip border-white/70"
                      onClick={() => setBatch(null)}
                    >
                      <RotateCcw className="size-4" />
                      Clear batch
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-2.5">
              {trends.slice(0, 10).map((t, i) => (
                <TrendRowItem
                  key={t.issue}
                  row={t}
                  rank={i + 1}
                  maxCount={maxTrendCount}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card className="glass-panel mt-6 border-white/70 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base tracking-tight">
                <Inbox className="size-4 text-blue-600" />
                Session log ({history.length})
              </CardTitle>
              <CardDescription>
                Recurring issues across this session — the seed of trend intelligence.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="hidden sm:table-cell">Urgent</TableHead>
                    <TableHead className="hidden sm:table-cell">Keywords</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.complaint.category}</TableCell>
                      <TableCell>
                        {h.sentiment.label} · {h.sentiment.emotion}
                      </TableCell>
                      <TableCell>{h.complaint.priority}</TableCell>
                      <TableCell>
                        <Badge className={`border shadow-none ${riskStyles[h.security.riskLevel]}`}>
                          {h.security.riskLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {h.urgent.isUrgent ? (
                          <Badge className="border-red-500/25 bg-red-500/10 text-red-700 shadow-none">
                            ⚡ {h.urgent.reasons[0]}
                          </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                      </TableCell>
                      <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">
                        {h.keywords.slice(0, 4).join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
          </>
        )}
      </main>
    </div>
  );
}
