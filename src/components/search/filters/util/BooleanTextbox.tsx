"use client";

import { Button } from "@/components/ui/button";
import { Mention, MentionContent, MentionInput, MentionItem } from "@/components/ui/mention";
import { Textarea } from "@/components/ui/textarea";
import { decodeSearchExpression, parseSearchExpression } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { SearchExpression } from "@/types/search";
import { Undo2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";

function getMentionQuery(value: string) {
  const triggerIndex = value.lastIndexOf("@");
  if (triggerIndex === -1) return null;

  const beforeTrigger = value.slice(0, triggerIndex);
  if (beforeTrigger && !/[\s(]$/.test(beforeTrigger)) return null;

  const afterTrigger = value.slice(triggerIndex + 1);
  if (afterTrigger.length === 0) return "";

  const match = afterTrigger.match(/^[^\s)]+/);
  return match ? match[0] : null;
}

function normalizeExpressionText(value: string) {
  return value.replace(/@/g, "");
}

function emptyExpression(): SearchExpression<string> {
  return "" as SearchExpression<string>;
}

function toMentionInsertValue(opt: string) {
  const trimmed = opt.trim();
  if (!trimmed) return trimmed;
  // If the suggestion contains whitespace, quote it so the boolean parser
  // treats it as a single phrase instead of splitting into AND-ed tokens.
  if (/\s/.test(trimmed)) {
    const escaped = trimmed.replaceAll('"', '\\"');
    return `"${escaped}"`;
  }
  return trimmed;
}

export function BooleanTextbox({
  value,
  onChange,
  placeholder,
  facet_type,
  examples,
}: {
  value: SearchExpression<string>;
  onChange: (expr: SearchExpression<string>) => void;
  placeholder?: string;
  facet_type?: string;
  examples?: Record<string, string>;
}) {
  const [text, setText] = useState<string>(() => decodeSearchExpression(value) ?? "");
  const [warmOptions, setWarmOptions] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [undoPayload, setUndoPayload] = useState<{ text: string; expr: SearchExpression<string> } | null>(null);
  const valueSignature = useMemo(() => JSON.stringify(value), [value]);

  // Update text if value changes from outside
  useEffect(() => {
    setText(decodeSearchExpression(value) ?? "");
  }, [value]);

  // Warm cache for @ suggestions (optional).
  useEffect(() => {
    if (!facet_type) {
      setWarmOptions([]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams({ type: facet_type, limit: "50" });
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();
        const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        if (!cancelled) {
          setWarmOptions(
            suggestions
              .map((x: unknown) => (typeof x === "string" ? x.trim() : ""))
              .filter(Boolean),
          );
        }
      } catch {
        if (!cancelled) setWarmOptions([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [facet_type]);

  // Live suggestions as user types after @.
  useEffect(() => {
    if (!facet_type) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    const query = getMentionQuery(text);
    if (query === null) {
      setOptions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    const timeout = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ type: facet_type, limit: "50" });
        if (query.trim()) params.set("query", query.trim());
        const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error("Failed to fetch suggestions");
        const data = await res.json();
        const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
        setOptions(
          suggestions
            .map((x: unknown) => (typeof x === "string" ? x.trim() : ""))
            .filter(Boolean),
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setOptions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [facet_type, text]);

  const mentionQuery = facet_type ? getMentionQuery(text) : null;
  const displayedOptions = useMemo(() => {
    if (!facet_type || mentionQuery === null) return [];
    const q = mentionQuery.trim().toLowerCase();
    const pool = options.length > 0 ? options : warmOptions;
    const dedup = [...new Set(pool)];
    if (!q) return dedup.slice(0, 50);
    return dedup.filter((s) => s.toLowerCase().includes(q)).slice(0, 50);
  }, [facet_type, mentionQuery, options, warmOptions]);

  const showMentionMenu = Boolean(facet_type && mentionQuery !== null && (isLoading || displayedOptions.length > 0));

  const commit = () => {
    const normalized = normalizeExpressionText(text).trim();
    const expr = normalized ? parseSearchExpression(normalized) : emptyExpression();
    onChange(expr);
    // Canonicalize local text to match what's actually stored.
    setText(decodeSearchExpression(expr) ?? "");
  };

  const applyExample = (next: string) => {
    const current = normalizeExpressionText(text).trim();
    if (current) setUndoPayload({ text: current, expr: parseSearchExpression(current) });
    else setUndoPayload(null);

    const normalized = normalizeExpressionText(next).trim();
    const expr = normalized ? parseSearchExpression(normalized) : emptyExpression();
    const display = decodeSearchExpression(expr) ?? "";
    flushSync(() => {
      setText(display);
      onChange(expr);
    });
  };

  const undo = () => {
    if (!undoPayload) return;
    flushSync(() => {
      setText(undoPayload.text);
      onChange(undoPayload.expr);
    });
    setUndoPayload(null);
  };

  const clear = () => {
    flushSync(() => {
      setText("");
      onChange(emptyExpression());
    });
    setUndoPayload(null);
  };

  const exampleEntries = examples ? Object.entries(examples) : [];

  return (
    <div className="space-y-2">
      <div className="relative">
        {facet_type ? (
          <Mention
            key={valueSignature}
            inputValue={text}
            onInputValueChange={setText}
            onValueChange={() => {
              // Selecting an item is a "completion" event: strip @ immediately.
              window.setTimeout(commit, 0);
            }}
            trigger="@"
            className="**:data-tag:bg-transparent **:data-tag:text-inherit **:data-tag:rounded-none **:data-tag:p-0"
          >
            <MentionInput
              className={cn("h-11 w-full bg-card", undoPayload && "pr-10")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={() => window.setTimeout(commit, 150)}
              placeholder={placeholder}
            />
            {showMentionMenu ? (
              <MentionContent>
                {isLoading && displayedOptions.length === 0 ? (
                  <MentionItem value=":loading:" disabled>
                    Loading suggestions…
                  </MentionItem>
                ) : null}
                {displayedOptions.map((opt) => (
                  <MentionItem key={opt} value={toMentionInsertValue(opt)}>
                    {opt}
                  </MentionItem>
                ))}
              </MentionContent>
            ) : null}
          </Mention>
        ) : (
          <Textarea
            className={cn("w-full min-h-16 bg-card", undoPayload && "pr-10")}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => window.setTimeout(commit, 150)}
            placeholder={placeholder}
          />
        )}

        {undoPayload ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute bottom-1.5 right-1.5 z-20 h-7 w-7 text-muted-foreground opacity-70 hover:bg-muted/60 hover:opacity-100"
            onClick={undo}
            title="Undo example"
            aria-label="Undo example replace"
          >
            <Undo2 className="size-3.5" />
          </Button>
        ) : text.trim() ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute bottom-1.5 right-1.5 z-20 h-7 w-7 text-muted-foreground opacity-70 hover:bg-muted/60 hover:opacity-100"
            onClick={clear}
            title="Clear"
            aria-label="Clear input"
          >
            <X className="size-3.5" />
          </Button>
        ) : null}
      </div>

      {exampleEntries.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {exampleEntries.map(([label, expr]) => (
            <Button
              key={label}
              variant="dashed"
              size="sm"
              className="max-w-full rounded-full p-1 px-2 h-full text-xs"
              onClick={() => applyExample(expr)}
              title={expr}
            >
              {label}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
} 