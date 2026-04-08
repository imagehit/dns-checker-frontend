const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL ?? "http://localhost:8080";

// ─── Backend /check/all response shapes ──────────────────────────────────────

export interface BackendAllResponse {
  status: "success" | "error";
  data: {
    domain: string;
    a: { type: string; found: boolean; records: string[] };
    aaaa: { type: string; found: boolean; records: string[] };
    mx: { type: string; found: boolean; records: { exchange: string; priority: number; type: string }[] };
    ns: { type: string; found: boolean; records: string[] };
    cname: { type: string; found: boolean; records: string[] };
    soa: {
      type: string;
      found: boolean;
      record?: {
        nsname: string;
        hostmaster: string;
        serial: number;
        refresh: number;
        retry: number;
        expire: number;
        minttl: number;
      };
    };
    txt: { type: string; found: boolean; records: string[] };
    caa: { type: string; found: boolean; records: any[] };
    srv: { type: string; found: boolean; records: any[] };
    ptr: { type: string; found: boolean; records: any[] };
    spf: {
      found: boolean;
      spfRecord?: string;
      values?: string[];
    };
    dmarc: {
      found: boolean;
      dmarcRecord?: string;
      values?: string[];
    };
    dkim: {
      found: boolean;
      selector?: string;
      record?: string;
    };
  };
}

// ─── Normalised shape used by the UI ─────────────────────────────────────────

export type RecordType =
  | "A" | "AAAA" | "MX" | "NS" | "CNAME" | "SOA" | "TXT"
  | "CAA" | "SRV" | "PTR" | "SPF" | "DKIM" | "DMARC";

export const RECORD_TYPES: { id: RecordType; label: string; description: string }[] = [
  { id: "A", label: "A", description: "IPv4 address" },
  { id: "AAAA", label: "AAAA", description: "IPv6 address" },
  { id: "MX", label: "MX", description: "Mail exchange" },
  { id: "NS", label: "NS", description: "Name servers" },
  { id: "CNAME", label: "CNAME", description: "Canonical name" },
  { id: "SOA", label: "SOA", description: "Start of authority" },
  { id: "TXT", label: "TXT", description: "Text records" },
  { id: "CAA", label: "CAA", description: "CA authorization" },
  { id: "SRV", label: "SRV", description: "Service locator" },
  { id: "PTR", label: "PTR", description: "Reverse DNS" },
  { id: "SPF", label: "SPF", description: "Sender policy" },
  { id: "DKIM", label: "DKIM", description: "DomainKeys ident." },
  { id: "DMARC", label: "DMARC", description: "Mail auth policy" },
];

/** A single record for display – records are always human-readable strings */
export interface DnsResult {
  type: RecordType;
  found: boolean;
  records: string[];
  /** Structured rows for types that benefit from a table-like display */
  structured?: Record<string, string>[];
  error?: string;
}

export interface DnsHealth {
  score: number;
  spf: boolean;
  dmarc: boolean;
  mx: boolean;
  ns: boolean;
  ipv6: boolean;
  dkim: boolean;
}

export interface DnsLookupResponse {
  domain: string;
  results: DnsResult[];
  health: DnsHealth;
  timestamp: string;
  raw: BackendAllResponse["data"];
}

// ─── Normalisation ────────────────────────────────────────────────────────────

function normalizeAll(data: BackendAllResponse["data"]): DnsResult[] {
  const results: DnsResult[] = [];

  // A
  results.push({ type: "A", found: data.a.found, records: data.a.records });

  // AAAA
  results.push({ type: "AAAA", found: data.aaaa.found, records: data.aaaa.records });

  // MX – show priority inline, structured table
  const mxRecords = data.mx.records.map(
    (r) => `[${r.priority}] ${r.exchange}`
  );
  const mxStructured = data.mx.records.map((r) => ({
    Priority: String(r.priority),
    Exchange: r.exchange,
  }));
  results.push({ type: "MX", found: data.mx.found, records: mxRecords, structured: mxStructured });

  // NS
  results.push({ type: "NS", found: data.ns.found, records: data.ns.records });

  // CNAME
  results.push({ type: "CNAME", found: data.cname.found, records: data.cname.records });

  // SOA – format nicely
  const soa = data.soa.record;
  const soaRecords = soa
    ? [
      `NS: ${soa.nsname}`,
      `Hostmaster: ${soa.hostmaster}`,
      `Serial: ${soa.serial}`,
      `Refresh: ${soa.refresh}s`,
      `Retry: ${soa.retry}s`,
      `Expire: ${soa.expire}s`,
      `Min TTL: ${soa.minttl}s`,
    ]
    : [];
  results.push({ type: "SOA", found: data.soa.found, records: soaRecords });

  // TXT
  results.push({ type: "TXT", found: data.txt.found, records: data.txt.records });

  // CAA
  const caaRecords = data.caa.records.map((r) =>
    typeof r === "string" ? r : JSON.stringify(r)
  );
  results.push({ type: "CAA", found: data.caa.found, records: caaRecords });

  // SRV
  const srvRecords = data.srv.records.map((r) =>
    typeof r === "string" ? r : JSON.stringify(r)
  );
  results.push({ type: "SRV", found: data.srv.found, records: srvRecords });

  // PTR
  const ptrRecords = data.ptr.records.map((r) =>
    typeof r === "string" ? r : JSON.stringify(r)
  );
  results.push({ type: "PTR", found: data.ptr.found, records: ptrRecords });

  // SPF – show full record + parsed values
  const spfRecords: string[] = [];
  if (data.spf.spfRecord) spfRecords.push(data.spf.spfRecord);
  results.push({ type: "SPF", found: data.spf.found, records: spfRecords });

  // DKIM
  const dkimRecords: string[] = [];
  if (data.dkim.record) dkimRecords.push(data.dkim.record);
  results.push({ type: "DKIM", found: data.dkim.found, records: dkimRecords });

  // DMARC
  const dmarcRecords: string[] = [];
  if (data.dmarc.dmarcRecord) dmarcRecords.push(data.dmarc.dmarcRecord);
  results.push({ type: "DMARC", found: data.dmarc.found, records: dmarcRecords });

  return results;
}

function computeHealth(data: BackendAllResponse["data"]): DnsHealth {
  const hasMx = data.mx.found && data.mx.records.length > 0;
  const hasNs = data.ns.found && data.ns.records.length > 0;
  const hasIpv6 = data.aaaa.found && data.aaaa.records.length > 0;
  const hasSpf = data.spf.found;
  const hasDmarc = data.dmarc.found;
  const hasDkim = data.dkim.found;

  let score = 0;
  if (hasMx) score += 20;
  if (hasNs) score += 15;
  if (hasSpf) score += 20;
  if (hasDmarc) score += 20;
  if (hasDkim) score += 15;
  if (hasIpv6) score += 10;

  return { score, spf: hasSpf, dmarc: hasDmarc, mx: hasMx, ns: hasNs, ipv6: hasIpv6, dkim: hasDkim };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all DNS records for a domain in one request using /api/v1/check/all.
 * The `types` parameter is used only as a display filter – health is always computed
 * from the full dataset.
 */
export async function lookupDns(
  domain: string,
  types: RecordType[],
  dkimSelector?: string
): Promise<DnsLookupResponse> {
  const body: Record<string, string> = { domain };
  if (dkimSelector) body.selector = dkimSelector;

  const res = await fetch(`${BASE_URL}/api/v1/check/all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => `HTTP ${res.status}`);
    throw new Error(errText);
  }

  const json: BackendAllResponse = await res.json();

  if (json.status !== "success") {
    throw new Error("Backend returned an error status");
  }

  const allResults = normalizeAll(json.data);
  const health = computeHealth(json.data);

  // Filter to only the record types the user selected
  const filtered = allResults.filter((r) => types.includes(r.type));

  return {
    domain: json.data.domain,
    results: filtered,
    health,
    timestamp: new Date().toISOString(),
    raw: json.data,
  };
}
