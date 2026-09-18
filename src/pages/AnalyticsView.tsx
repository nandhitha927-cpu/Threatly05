import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, AlertTriangle, ShieldAlert, Smile, Frown, Meh, TrendingUp } from "lucide-react";
import { computeAnalytics } from "@/lib/analytics";
import type { AnalysisResult } from "@/lib/analyzer";

const chartColors = [
  "#2563eb", "#0891b2", "#7c3aed", "#db2777",
  "#ea580c", "#16a34a", "#ca8a04", "#0d9488",
];

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ElementType;
  tone?: "default" | "red" | "amber" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "text-red-600"
      : tone === "amber"
        ? "text-amber-600"
        : tone === "green"
          ? "text-emerald-600"
          : "text-blue-600";
  return (
    <Card className="glass-panel border-white/70 shadow-none">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 text-xs font-medium">
          <Icon className={`size-3.5 ${toneClass}`} />
          {label}
        </CardDescription>
        <CardTitle className="text-2xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      {hint && <CardContent className="text-xs text-muted-foreground">{hint}</CardContent>}
    </Card>
  );
}

export default function AnalyticsView({ corpus }: { corpus: AnalysisResult[] }) {
  const analytics = useMemo(() => computeAnalytics(corpus), [corpus]);
  const { kpis, sentimentDistribution, categoryDistribution, issueFrequency, weeklyTrend } =
    analytics;

  if (corpus.length === 0) {
    return (
      <Card className="glass-panel mt-6 border-white/70 shadow-none">
        <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
          <Inbox className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No conversations analyzed yet. Run analyses in the Console tab, or launch the
            500-message demo batch, to populate the analytics view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 grid gap-6"
    >
      {/* KPI row 1: volume */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Inbox} label="Total conversations" value={kpis.totalConversations} />
        <KpiCard icon={TrendingUp} label="Total complaints" value={kpis.totalComplaints} />
        <KpiCard
          icon={ShieldAlert}
          label="Unresolved"
          value={kpis.unresolved}
          tone="amber"
          hint="Need follow-up"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Critical complaints"
          value={kpis.critical}
          tone="red"
          hint="Skip-the-queue handling"
        />
      </div>

      {/* KPI row 2: sentiment + top issues */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Frown} label="Negative" value={kpis.negative} tone="red" />
        <KpiCard icon={Meh} label="Neutral" value={kpis.neutral} />
        <KpiCard icon={Smile} label="Positive" value={kpis.positive} tone="green" />
        <KpiCard
          icon={ShieldAlert}
          label="Security threats"
          value={kpis.threats}
          tone="red"
          hint="Phishing / scam signals"
        />
      </div>

      {/* Most common cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass-panel border-white/70 shadow-none">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Most common complaint
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {kpis.mostCommonComplaint?.name ?? "—"}
            </p>
            {kpis.mostCommonComplaint && (
              <Badge variant="secondary" className="mt-2 shadow-none">
                {kpis.mostCommonComplaint.count} conversations
              </Badge>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/70 shadow-none">
          <CardContent className="pt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Most frequent issue
            </p>
            <p className="mt-1 text-xl font-semibold tracking-tight">
              {kpis.mostFrequentIssue?.name ?? "—"}
            </p>
            {kpis.mostFrequentIssue && (
              <Badge variant="secondary" className="mt-2 shadow-none">
                {kpis.mostFrequentIssue.count} reports
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="glass-panel border-white/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tracking-tight">Sentiment distribution</CardTitle>
            <CardDescription>Positive / neutral / negative across all conversations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mx-auto h-64 max-w-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {sentimentDistribution.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tracking-tight">Complaint categories</CardTitle>
            <CardDescription>Top categories by conversation count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryDistribution} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tracking-tight">Issue frequency</CardTitle>
            <CardDescription>Most frequently reported issues (spec §3 view)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issueFrequency} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/70 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-base tracking-tight">Weekly sentiment trend</CardTitle>
            <CardDescription>Conversation volume by sentiment over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#dc2626"
                    fill="#dc262633"
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#64748b"
                    fill="#64748b33"
                  />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#16a34a"
                    fill="#16a34a33"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

