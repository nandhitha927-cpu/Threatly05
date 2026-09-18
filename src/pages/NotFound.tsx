import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-backdrop flex min-h-screen flex-col"
    >
      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4">
        <div className="glass-panel-strong w-full max-w-md rounded-2xl p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700 dark:text-blue-300">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="mt-5 text-5xl font-bold tracking-tight text-foreground">404</h1>
          <p className="mt-2 text-lg font-medium text-foreground/90">Page not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
          >
            Back to home
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
