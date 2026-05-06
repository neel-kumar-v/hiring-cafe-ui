import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatJobDescription } from "@/lib/job-info";
import { Copy } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DialogJobDescription = ({ description, isLoading = false }: { description: string; isLoading?: boolean }) => {
  const deferredDescription = useDeferredValue(description);
  const [isFormatting, setIsFormatting] = useState(false);

  const formattedDescription = useMemo(() => {
    if (!deferredDescription) return "";
    const started = performance.now();
    const html = formatJobDescription(deferredDescription);
    const elapsed = performance.now() - started;
    if (process.env.NODE_ENV !== "production" && elapsed > 24) {
      // eslint-disable-next-line no-console
      console.log(`[perf] formatJobDescription ${elapsed.toFixed(1)}ms`);
    }
    return html;
  }, [deferredDescription]);

  useEffect(() => {
    if (!description) {
      setIsFormatting(false);
      return;
    }
    // While the deferred value is catching up, keep a skeleton visible.
    setIsFormatting(deferredDescription !== description);
  }, [deferredDescription, description]);

  if (isLoading) {
    return (
      <div className="mb-2 md:mb-4">
        <Separator className="my-8" />
        <DescriptionSkeleton />
      </div>
    );
  }

  if (!description) return null;

  const handleCopyDescription = async () => {
    try {
      const jobDescriptionElement = document.getElementById("job-description");
      if (!jobDescriptionElement) return;

      // Helper to recursively extract text with line breaks for block elements
      function getTextWithLineBreaks(node: Node): string {
        let text = "";
        if (node.nodeType === Node.TEXT_NODE) {
          return (node as Text).data;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as HTMLElement).tagName.toLowerCase();
          const blockTags = [
            "p",
            "div",
            "br",
            "li",
            "ul",
            "ol",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "pre",
            "blockquote",
            "tr",
          ];
          if (blockTags.includes(tag) && text.length > 0) text += "\n";
          if (tag === "br") text += "\n";
          for (const child of Array.from(node.childNodes))
            text += getTextWithLineBreaks(child);
          if (blockTags.includes(tag)) text += "\n";
        }
        return text;
      }

      const cleanText = getTextWithLineBreaks(jobDescriptionElement)
        .replace(/\n{3,}/g, "\n\n") // Collapse 3+ newlines to 2
        .replace(/[ \t]+\n/g, "\n") // Remove trailing spaces before newlines
        .trim();

      await navigator.clipboard.writeText(cleanText);
      toast.success("Job description copied to clipboard");
    } catch (err) {
      console.error("Failed to copy description:", err);
    }
  };

  return (
    <div className="mb-2 md:mb-4">
      <div className="relative">
        <Separator className="my-8" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button
            className="rounded-md border border-border bg-background shadow-sm hover:bg-secondary/60 dark:border-border dark:bg-card dark:hover:bg-accent"
            onClick={handleCopyDescription}
            size="sm"
            variant="outline"
          >
            <Copy className="mr-2 size-4" />
            Copy Job Description
          </Button>
        </div>
      </div>
      {isFormatting ? (
        <div className="mt-6">
          <DescriptionSkeleton />
        </div>
      ) : (
        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground/80 leading-relaxed dark:text-foreground/80"
          dangerouslySetInnerHTML={{ __html: formattedDescription }}
          id="job-description"
        />
      )}
    </div>
  );
};

export default DialogJobDescription;

function DescriptionSkeleton() {
  // A structured placeholder that resembles typical job posts.
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-6 w-[42%]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[86%]" />
          <Skeleton className="h-4 w-[94%]" />
          <Skeleton className="h-4 w-[88%]" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-[34%]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[96%]" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[93%]" />
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-[30%]" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="flex items-start gap-3" key={i}>
              <Skeleton className="mt-1 size-2 rounded-full" />
              <Skeleton className={i % 3 === 0 ? "h-4 w-[78%]" : i % 3 === 1 ? "h-4 w-[90%]" : "h-4 w-[84%]"} />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border/60 p-4 dark:border-border">
        <Skeleton className="h-4 w-[28%]" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[82%]" />
        </div>
      </div>
    </div>
  );
}
