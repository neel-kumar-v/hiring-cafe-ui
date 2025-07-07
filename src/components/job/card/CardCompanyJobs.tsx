import type { V5ProcessedCompanyData } from "@/types/jobs";

const CardCompanyJobs = ({
  companyData,
}: {
  companyData: V5ProcessedCompanyData;
}) => {
  return (
    <div className="col-span-1 flex justify-end">
      <span className="text-sm text-pink-600 dark:text-pink-400 hover:scale-105 dark:hover:text-pink-200 transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100 cursor-pointer">
        View All
      </span>
    </div>
  );
};

export default CardCompanyJobs;
