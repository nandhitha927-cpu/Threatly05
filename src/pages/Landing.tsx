import { motion } from "framer-motion";
import {
  ShieldCheck,
  ScanSearch,
  BrainCircuit,
  Gauge,
  Inbox,
  Radar,
  ArrowRight,
  Lock,
  Fingerprint,
  Bug,
  MailWarning,
  FileSearch,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router";
import { useLang } from "@/hooks/use-lang";
import logo from "@/assets/logo.svg";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "Complaint Intelligence",
    body: "Every message is classified into 11 categories — billing, refunds, login, delivery, security — with priority, sentiment and emotion in one pass.",
  },
  {
    icon: Gauge,
    title: "Sentiment & Urgency",
    body: "Lexicon-driven scoring surfaces anger, frustration and urgency so hot tickets escalate before customers churn.",
  },
  {
    icon: Radar,
    title: "Phishing Detection",
    body: "Lookalike domains, homoglyph tricks, URL shorteners, raw-IP hosts and high-abuse TLDs are flagged with risk scores.",
  },
  {
    icon: Fingerprint,
    title: "Social-Engineering Signals",
    body: "Six techniques detected: urgency pressure, authority impersonation, credential harvesting, fear framing, payment redirection and lures.",
  },
  {
    icon: Bug,
    title: "Attachment Triage",
    body: "Executables, macro documents and archives are risk-rated so agents never open hostile payloads.",
  },
  {
    icon: Sparkles,
    title: "Actionable Recommendations",
    body: "Each analysis ends with a concrete next step: escalate, verify via threat intel, or route to the right queue.",
  },
];

const CHANNELS = ["Email", "Live chat", "Support tickets", "Social DMs", "Contact forms"];

export default function Landing() {
  const { t } = useLang();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-backdrop min-h-screen text-foreground"
    >
      {/* ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(38rem 30rem at 78% 12%, rgb(59 130 246 / var(--glow-a, 0.12)), transparent 65%), radial-gradient(34rem 26rem at 10% 88%, rgb(16 185 129 / var(--glow-b, 0.10)), transparent 60%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center gap-2.5" title={t.home}>
            <img src={logo} alt="Threatly logo" className="size-9 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight">Threatly</span>
          </Link>
        </div>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <a href="#features">Features</a>
          </Button>
          <Button asChild variant="outline" className="glass-chip border-white/70">
            <a href="/auth">Sign in</a>
          </Button>
          <Button asChild className="gap-2">
            <a href="/auth">
              Launch console
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-10 pb-16 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="glass-chip border-white/70 text-foreground shadow-none">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            AI-powered support intelligence &amp; phishing defense
          </Badge>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Read every support message.
            <span className="block bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Catch every threat inside it.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 shadow-lg shadow-blue-600/20">
              <a href="/auth">
                Analyze your first message
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-chip border-white/70">
              <a href="#features">See how it works</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Works out of the box — no API keys required for the rule-based engine.
          </p>
        </div>

        {/* Hero mock panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-panel-strong mx-auto mt-14 max-w-4xl rounded-2xl p-5 sm:p-7"
        >
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
              <Inbox className="size-3.5 text-blue-600 dark:text-blue-300" /> Inbound: customer email
            </span>
            <span className="glass-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium">
              <ScanSearch className="size-3.5 text-sky-600" /> Analysis complete
            </span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 font-semibold text-red-700">
              <MailWarning className="size-3.5" /> Threat: Critical
            </span>
          </div>

          <div className="glass-inset mt-4 grid gap-4 rounded-xl p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer message
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                “URGENT! Your account has been compromised. Click this link
                immediately to secure it and enter your username, password and
                OTP. Visit <span className="font-mono text-red-600">http://paypa1-security.example</span>{" "}
                within 2 hours or your account will be permanently closed.”
              </p>
            </div>
            <div className="grid content-start gap-2.5">
              {[
                ["Category", "Security Concern"],
                ["Sentiment", "Negative · Fear / Anxiety"],
                ["Priority", "Critical"],
                ["Flagged URL", "paypa1-security.example"],
                ["Techniques", "Urgency · Fear · Credential harvesting"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/5 p-4">
            <Lock className="mt-0.5 size-4 shrink-0 text-red-600" />
            <p className="text-sm leading-relaxed text-foreground/90">
              <span className="font-semibold">Recommended action:</span> Escalate
              to the security team immediately. Do not follow links or disclose
              credentials/OTP. Block the flagged domain and preserve headers for
              forensics.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Two intelligence engines, one inbox
          </h2>
          <p className="mt-3 text-muted-foreground">
            Business insight and cyber defense from the same conversation — no
            manual triage, no missed attacks.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-300">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Channels strip */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="glass-panel rounded-2xl px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <FileSearch className="size-4" />
            Analyzes conversations from
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            {CHANNELS.map((c) => (
              <span
                key={c}
                className="glass-chip rounded-full px-4 py-1.5 text-sm font-medium"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="glass-panel-strong rounded-3xl px-6 py-14 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Protect your inbox. Understand your customers.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Paste a conversation, get complaint intelligence and a threat verdict
            in seconds.
          </p>
          <Button asChild size="lg" className="mt-8 gap-2 shadow-lg shadow-blue-600/20">
            <a href="/auth">
              Open the console
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        Threatly — Customer Support Intelligence &amp; Phishing Threat Detection
      </footer>
    </motion.div>
  );
}
