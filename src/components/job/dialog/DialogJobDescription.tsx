import React from "react";
import { formatJobDescription } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
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
            "tr"
          ];
          if (blockTags.includes(tag) && text.length > 0) text += "\n";
          if (tag === "br") text += "\n";
          for (const child of Array.from(node.childNodes)) text += getTextWithLineBreaks(child);
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
            onClick={handleCopyDescription}
            variant="outline"
            size="sm"
            className="rounded-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Job Description
          </Button>
        </div>
      </div>
      <div
        className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-gray dark:prose-invert max-w-none"
        id="job-description"
        dangerouslySetInnerHTML={{ __html: formatJobDescription(description) }}
      />
    </div>
  );
};

export default DialogJobDescription;
