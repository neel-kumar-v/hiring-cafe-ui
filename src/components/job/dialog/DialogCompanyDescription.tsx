import React from "react";

const DialogCompanyDescription = ({ tagline }: { tagline: string }) => {
  if (!tagline) return null;

  return (
    <div className="mb-6 ">
      <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        Company Description
      </h4>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {tagline}
      </p>
    </div>
  );
};

export default DialogCompanyDescription;
