import React from "react";
import { formatJobDescription } from "@/lib/utils";

const DialogJobDescription = ({ description }: { description: string }) => {
  if (!description) return null;

  return (
    <div className="mb-2 md:mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
        Job Description
      </h2>
      <div
        className="text-gray-700 dark:text-gray-300 leading-relaxed prose prose-gray dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: formatJobDescription(description) }}
      />
    </div>
  );
};

export default DialogJobDescription;
