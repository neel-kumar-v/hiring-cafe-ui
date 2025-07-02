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
      // Create a temporary element to get clean text content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = formatJobDescription(description);
      const cleanText = tempDiv.textContent || tempDiv.innerText || "";

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
        dangerouslySetInnerHTML={{ __html: formatJobDescription(description) }}
      />
    </div>
  );
};

export default DialogJobDescription;
