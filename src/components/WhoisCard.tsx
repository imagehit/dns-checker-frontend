import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Calendar, Building, Server, FileText } from "lucide-react";
import type { WhoisData } from "@/lib/dns";

interface WhoisCardProps {
  data: WhoisData;
}

function InfoRow({ label, value, icon: Icon }: { label: string; value?: string; icon?: any }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-mono text-sm text-foreground/90 break-all">{value}</p>
      </div>
    </div>
  );
}

export function WhoisCard({ data }: WhoisCardProps) {
  if (data.raw && !data.registrar) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glow bg-card border border-border rounded-xl p-5 space-y-3"
      >
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          WHOIS
        </h3>
        <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap max-h-60 overflow-auto bg-secondary/50 rounded-md p-3">
          {data.raw}
        </pre>
      </motion.div>
    );
  }

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow bg-card border border-border rounded-xl p-5 space-y-1"
    >
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-primary" />
        WHOIS Information
      </h3>

      <InfoRow label="Registrar" value={data.registrar} icon={Building} />
      <InfoRow label="Registrant" value={data.registrant} icon={Building} />
      <InfoRow label="Created" value={formatDate(data.creationDate)} icon={Calendar} />
      <InfoRow label="Expires" value={formatDate(data.expirationDate)} icon={Calendar} />
      {data.nameServers && data.nameServers.length > 0 && (
        <div className="flex items-start gap-3 py-2">
          <Server className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">Name Servers</p>
            {data.nameServers.map((ns, i) => (
              <p key={i} className="font-mono text-sm text-foreground/90">{ns}</p>
            ))}
          </div>
        </div>
      )}
      {data.status && data.status.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-2">
          {data.status.slice(0, 5).map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md text-xs font-mono bg-secondary text-secondary-foreground">
              {s}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
