import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal } from "lucide-react";
import { DomainInput } from "@/components/DomainInput";
import { DnsResults } from "@/components/DnsResults";
import {
  lookupDns,
  type RecordType,
  type DnsLookupResponse,
} from "@/lib/dns";

const Index = () => {
  const [result, setResult] = useState<DnsLookupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (
    domain: string,
    types: RecordType[],
    dkimSelector?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const dnsData = await lookupDns(domain, types, dkimSelector);
      setResult(dnsData);
    } catch (e: any) {
      setError(e.message || "Lookup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid relative overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12 space-y-12">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Terminal className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              <span className="text-gradient">DNS</span>{" "}
              <span className="text-foreground">Checker</span>
            </h1>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Analyze DNS records, email authentication (SPF, DKIM, DMARC), and get a health score for any domain.
          </p>
        </motion.header>

        <DomainInput onSubmit={handleLookup} isLoading={isLoading} />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.domain + result.timestamp}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <DnsResults data={result} />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center text-xs text-muted-foreground pt-8 flex items-center justify-center gap-1.5">
          <Shield className="h-3 w-3" />
          Powered by DNS Checker API
        </footer>
      </div>
    </div>
  );
};

export default Index;
