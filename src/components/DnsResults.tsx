import { motion } from "framer-motion";
import {
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Minus,
  Info,
} from "lucide-react";
import type { DnsLookupResponse, DnsResult } from "@/lib/dns";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RECORD_INFO: Record<string, string> = {
  A: "Address Record. Essential for directing internet traffic. It maps a human-readable domain name (like example.com) to an IPv4 address, telling browsers where a website is hosted.",
  AAAA: "IPv6 Address Record. Functions just like an A record but points to an IPv6 address instead of an IPv4 address, supporting the newer, much larger IP address space used for modern internet routing.",
  MX: "Mail Exchange Record. Crucial for email routing. It tells email senders which mail servers are responsible for accepting email messages on behalf of your domain name.",
  NS: "Name Server Record. Indicates which DNS servers are authoritative for a domain. It essentially delegates a domain or subdomain to specific DNS servers.",
  CNAME: "Canonical Name Record. Used to map one domain name (an alias) to another true or canonical domain name. Often used to map web subdomains (like www) to the root domain.",
  SOA: "Start of Authority Record. Stores essential administrative information about your domain or zone, including the primary name server and timers relating to refreshing the zone.",
  TXT: "Text Record. Allows administrators to add arbitrary text to their DNS records. Most commonly used for email security (SPF, DKIM, DMARC) and domain ownership verification.",
  CAA: "Certificate Authority Authorization. A security measure that specifies which Certificate Authorities (CAs) are allowed to issue SSL/TLS certificates for your domain.",
  SRV: "Service Record. Used to specify the location (hostname and port number) of servers for specific services, like instant messaging and other non-standard internet services.",
  PTR: "Pointer Record. Primarily used for Reverse DNS lookups. Specifically maps an IP address back to a canonical hostname. Used by mail servers to verify incoming connections.",
  SPF: "Sender Policy Framework. An email authentication method used to prevent spammers from sending messages on behalf of your domain by listing authorized sending IP addresses.",
  DMARC: "Domain-based Message Authentication, Reporting, and Conformance. Tells receiving mail servers what to do if an email fails SPF/DKIM authentication and provides feedback reports.",
  DKIM: "DomainKeys Identified Mail. Adds a digital cryptographic signature to emails, allowing receiving servers to verify that an email was not altered in transit."
};

interface DnsResultsProps {
  data: DnsLookupResponse;
}

// ─── Tag badge ────────────────────────────────────────────────────────────────

function StatusBadge({ found }: { found: boolean }) {
  return found ? (
    <span className="flex items-center gap-1 text-xs text-success font-mono">
      <CheckCircle2 className="h-3 w-3" /> found
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
      <Minus className="h-3 w-3" /> not found
    </span>
  );
}

// ─── SPF values chip list ─────────────────────────────────────────────────────

function SpfChips({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {values.map((v, i) => {
        const isAll = v.endsWith("all");
        const isInclude = v.startsWith("include:");
        return (
          <span
            key={i}
            className={`font-mono text-xs px-2 py-0.5 rounded-md border ${
              isAll
                ? "bg-warning/10 border-warning/30 text-warning"
                : isInclude
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-secondary/60 border-border text-foreground/70"
            }`}
          >
            {v}
          </span>
        );
      })}
    </div>
  );
}

// ─── DMARC tag renderer ───────────────────────────────────────────────────────

function DmarcValues({ values }: { values: string[] }) {
  return (
    <div className="mt-2 space-y-1">
      {values.map((v, i) => {
        const [key, ...rest] = v.replace(/;$/, "").split("=");
        const val = rest.join("=");
        return (
          <div key={i} className="flex items-start gap-2 font-mono text-xs">
            <span className="text-primary shrink-0 w-12">{key}</span>
            {val && <span className="text-foreground/70 break-all">{val}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── MX priority table ────────────────────────────────────────────────────────

function MxTable({
  structured,
}: {
  structured: Record<string, string>[];
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-secondary/50 text-muted-foreground">
            <th className="text-left px-3 py-1.5 w-16">Priority</th>
            <th className="text-left px-3 py-1.5">Exchange</th>
          </tr>
        </thead>
        <tbody>
          {structured.map((row, i) => (
            <tr
              key={i}
              className="border-t border-border hover:bg-secondary/30 transition-colors"
            >
              <td className="px-3 py-1.5 text-warning">{row.Priority}</td>
              <td className="px-3 py-1.5 text-foreground/90 break-all">{row.Exchange}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Record card ──────────────────────────────────────────────────────────────

function RecordCard({
  result,
  index,
  raw,
}: {
  result: DnsResult;
  index: number;
  raw: DnsLookupResponse["raw"];
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const copyAll = () => {
    navigator.clipboard.writeText(result.records.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const spfData = result.type === "SPF" ? raw?.spf : null;
  const dmarcData = result.type === "DMARC" ? raw?.dmarc : null;

  const hasContent = result.records.length > 0 || result.structured;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="card-glow bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold text-primary tracking-wide">
              {result.type}
            </span>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <div className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-help">
                    <Info className="h-4 w-4" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-[320px] p-3 shadow-lg">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-sm">{result.type} Record</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {RECORD_INFO[result.type] || "No detailed description available."}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <StatusBadge found={result.found} />
        </div>
        <div className="flex items-center gap-2">
          {hasContent && result.records.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyAll();
              }}
              className="text-muted-foreground hover:text-primary transition-colors p-1"
              title="Copy all"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          )}
          {hasContent &&
            (expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ))}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-4 space-y-2 border-t border-border/50">
          {result.error ? (
            <div className="flex items-center gap-2 text-destructive text-sm mt-3">
              <XCircle className="h-4 w-4 shrink-0" />
              {result.error}
            </div>
          ) : !result.found || result.records.length === 0 ? (
            <p className="text-muted-foreground text-sm italic mt-3">
              No records found
            </p>
          ) : (
            <>
              {/* MX – structured table */}
              {result.type === "MX" && result.structured ? (
                <MxTable structured={result.structured} />
              ) : result.type === "SPF" && spfData?.values ? (
                <>
                  <div className="mt-3 font-mono text-xs bg-secondary/50 rounded-md px-3 py-2 break-all text-foreground/90">
                    {result.records[0]}
                  </div>
                  <SpfChips values={spfData.values} />
                </>
              ) : result.type === "DMARC" && dmarcData?.values ? (
                <>
                  <div className="mt-3 font-mono text-xs bg-secondary/50 rounded-md px-3 py-2 break-all text-foreground/90">
                    {result.records[0]}
                  </div>
                  <DmarcValues values={dmarcData.values} />
                </>
              ) : (
                <div className="mt-3 space-y-1.5">
                  {result.records.map((record, i) => (
                    <div
                      key={i}
                      className="font-mono text-xs bg-secondary/50 rounded-md px-3 py-2 break-all text-foreground/90"
                    >
                      {record}
                    </div>
                  ))}
                </div>
              )}

              {/* DKIM selector badge */}
              {result.type === "DKIM" && raw?.dkim?.selector && (
                <div className="mt-1 text-xs text-muted-foreground font-mono">
                  selector:{" "}
                  <span className="text-accent">{raw.dkim.selector}</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-1">
                {result.records.length} record
                {result.records.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Health indicator ─────────────────────────────────────────────────────────

function HealthIndicator({ data }: DnsResultsProps) {
  const { health } = data;
  const items = [
    { label: "MX",    ok: health.mx },
    { label: "NS",    ok: health.ns },
    { label: "SPF",   ok: health.spf },
    { label: "DKIM",  ok: health.dkim },
    { label: "DMARC", ok: health.dmarc },
    { label: "IPv6",  ok: health.ipv6 },
  ];

  const scoreColor =
    health.score >= 80
      ? "text-success"
      : health.score >= 50
      ? "text-warning"
      : "text-destructive";

  const barColor =
    health.score >= 80
      ? "bg-success"
      : health.score >= 50
      ? "bg-warning"
      : "bg-destructive";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-card border border-border rounded-xl p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">DNS Health Score</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Based on presence of key security records
          </p>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold font-mono ${scoreColor}`}>
            {health.score}
          </span>
          <span className="text-muted-foreground text-sm">/100</span>
        </div>
      </div>

      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${health.score}%` }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 border ${
              item.ok
                ? "bg-success/5 border-success/20"
                : "bg-secondary/40 border-border"
            }`}
          >
            {item.ok ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            )}
            <span
              className={`font-mono text-xs font-medium ${
                item.ok ? "text-success" : "text-muted-foreground"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DnsResults({ data }: DnsResultsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      {/* Domain + timestamp */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-mono text-lg font-bold text-primary">{data.domain}</h2>
        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-secondary border border-border">
          {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <HealthIndicator data={data} />

      <div className="grid gap-4 sm:grid-cols-2">
        {data.results.map((result, i) => (
          <RecordCard key={result.type} result={result} index={i} raw={data.raw} />
        ))}
      </div>
    </motion.div>
  );
}
