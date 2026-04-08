import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Globe, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RECORD_TYPES, type RecordType } from "@/lib/dns";
import { cn } from "@/lib/utils";

interface DomainInputProps {
  onSubmit: (domain: string, types: RecordType[], dkimSelector?: string) => void;
  isLoading: boolean;
}

export function DomainInput({ onSubmit, isLoading }: DomainInputProps) {
  const [domain, setDomain] = useState("");
  const [dkimSelector, setDkimSelector] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<RecordType[]>(
    RECORD_TYPES.map((t) => t.id)
  );

  const hasDkim = selectedTypes.includes("DKIM");

  const toggleType = (type: RecordType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = domain.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (cleaned && selectedTypes.length > 0) {
      onSubmit(cleaned, selectedTypes, hasDkim && dkimSelector ? dkimSelector : undefined);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/50 to-accent/50 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
          <div className="relative flex items-center gap-2 bg-card border border-border rounded-xl p-2">
            <Globe className="ml-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter domain (e.g. example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="border-0 bg-transparent text-lg font-mono focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            />
            <Button
              type="submit"
              variant="glow"
              size="lg"
              disabled={isLoading || !domain.trim() || selectedTypes.length === 0}
              className="shrink-0 font-semibold"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Search className="h-4 w-4" />
                </motion.div>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Lookup
                </>
              )}
            </Button>
          </div>
        </div>

        {/* DKIM selector input – only shown when DKIM is selected */}
        {hasDkim && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center gap-2 bg-card border border-border rounded-xl p-2">
              <Key className="ml-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="DKIM selector (optional – e.g. google)"
                value={dkimSelector}
                onChange={(e) => setDkimSelector(e.target.value)}
                className="border-0 bg-transparent font-mono focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
              />
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {RECORD_TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              title={type.description}
              onClick={() => toggleType(type.id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-all duration-200 border",
                selectedTypes.includes(type.id)
                  ? "bg-primary/15 border-primary/50 text-primary glow-primary"
                  : "bg-secondary/50 border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              {type.id}
            </button>
          ))}
        </div>
      </form>
    </motion.div>
  );
}
