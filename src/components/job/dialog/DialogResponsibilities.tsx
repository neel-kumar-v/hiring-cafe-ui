import { getRoleActivities } from "@/lib/job-info";

const DialogResponsibilities = ({
  roleActivities,
}: {
  roleActivities: string[] | null;
}) => {
  if (!roleActivities || roleActivities.length === 0) return null;  

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-neutral-900 text-lg dark:text-white">
        Responsibilities
      </h3>
      <div className="text-neutral-700 leading-relaxed dark:text-neutral-300">
        {getRoleActivities(roleActivities)}
      </div>
    </div>
  );
};

export default DialogResponsibilities;
