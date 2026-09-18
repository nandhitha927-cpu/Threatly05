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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  SAMPLE_EMAILS,
  type AnalysisResult,
} from "@/lib/analyzer";

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

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const analyze = () => {
    if (!input.trim()) return;
    const r = analyzeText(input);
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
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-8">
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
                {SAMPLE_EMAILS.map((s) => (
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
            {/* Verdict banner */}
            <div
              className={`flex flex-col gap-3 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${
                result.security.hasThreat
                  ? "border-red-500/30 bg-red-500/5"
                  : "border-emerald-500/25 bg-emerald-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                {result.security.hasThreat ? (
                  <ShieldAlert className="mt-0.5 size-6 shrink-0 text-red-600" />
                ) : (
                  <ShieldCheck className="mt-0.5 size-6 shrink-0 text-emerald-600" />
                )}
                <div>
                  <p className="font-semibold tracking-tight">
                    {result.security.hasThreat
                      ? `Security threat detected — ${result.security.riskLevel} risk (score ${result.security.riskScore})`
                      : "No security threat detected"}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {result.security.recommendedAction}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.security.threatTypes.map((t) => (
                  <Badge key={t} className="border-red-500/25 bg-red-500/10 text-red-700 shadow-none">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={Tag}
                label="Complaint category"
                value={result.complaint.category}
                hint={`Match score ${result.complaint.categoryScore}`}
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
                    <TabsTrigger value="techniques">
                      Techniques ({result.security.socialEngineering.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="summary" className="mt-4 grid gap-3">
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
                        <FindingRow
                          key={u.url}
                          icon={Link2}
                          title={u.url}
                          sub={`Domain: ${u.registrableDomain}${u.lookalikeBrand ? ` · impersonates ${u.lookalikeBrand}` : ""}`}
                          risk={u.risk}
                          flags={u.flags}
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="emails" className="mt-4 grid gap-2.5">
                    {result.security.emails.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No email addresses found.</p>
                    ) : (
                      result.security.emails.map((e) => (
                        <FindingRow
                          key={e.email}
                          icon={AtSign}
                          title={e.email}
                          sub={`Domain: ${e.domain}${e.lookalikeBrand ? ` · impersonates ${e.lookalikeBrand}` : ""}`}
                          risk={e.risk}
                          flags={e.flags}
                        />
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
          </motion.div>
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
      </main>
    </div>
  );
}
