import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatJobDescription } from "@/lib/job-info";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const DialogJobDescription = ({ description }: { description: string }) => {
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
      <div
        className="prose prose-neutral dark:prose-invert max-w-none text-foreground/80 leading-relaxed dark:text-foreground/80"
        dangerouslySetInnerHTML={{ __html: formatJobDescription(description) }}
        id="job-description"
      />
    </div>
  );
};

export default DialogJobDescription;
