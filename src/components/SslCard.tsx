import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Clock, Lock, AlertTriangle } from "lucide-react";
import type { SslData } from "@/lib/dns";

interface SslCardProps {
  data: SslData;
}

export function SslCard({ data }: SslCardProps) {
  const formatDate = (d?: string) => {
    if (!d) return undefined;
    try {
      return new Date(d).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
      });
    } catch {
      return d;
    }
  };

  const daysColor =
    data.daysRemaining != null
      ? data.daysRemaining > 30
        ? "text-success"
        : data.daysRemaining > 7
        ? "text-warning"
        : "text-destructive"
      : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow bg-card border border-border rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          SSL Certificate
        </h3>
        {data.valid ? (
          <div className="flex items-center gap-1.5 text-success text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            Valid
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-destructive text-sm font-medium">
            <ShieldAlert className="h-4 w-4" />
            Invalid
          </div>
        )}
      </div>

      {data.error && (
        <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-md px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {data.error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {data.issuer && (
          <div>
            <p className="text-xs text-muted-foreground">Issuer</p>
            <p className="font-mono text-sm text-foreground/90 break-all">{data.issuer}</p>
          </div>
        )}
        {data.subject && (
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="font-mono text-sm text-foreground/90 break-all">{data.subject}</p>
          </div>
        )}
        {data.validFrom && (
          <div>
            <p className="text-xs text-muted-foreground">Valid From</p>
            <p className="font-mono text-sm text-foreground/90">{formatDate(data.validFrom)}</p>
          </div>
        )}
        {data.validTo && (
          <div>
            <p className="text-xs text-muted-foreground">Valid To</p>
            <p className="font-mono text-sm text-foreground/90">{formatDate(data.validTo)}</p>
          </div>
        )}
      </div>

      {data.daysRemaining != null && (
        <div className="flex items-center gap-2 pt-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={`font-mono text-sm font-semibold ${daysColor}`}>
            {data.daysRemaining} days remaining
          </span>
        </div>
      )}

      {data.protocol && (
        <p className="text-xs text-muted-foreground">Protocol: {data.protocol}</p>
      )}
    </motion.div>
  );
}
