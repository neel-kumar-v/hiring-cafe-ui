import { getRoleActivities } from "@/lib/job-info";

const DialogResponsibilities = ({
  roleActivities,
}: {
  roleActivities: string[] | null;
}) => {
  if (!roleActivities || roleActivities.length === 0) return null;  

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-foreground text-lg dark:text-foreground">
        Responsibilities
      </h3>
      <div className="text-foreground/80 leading-relaxed dark:text-foreground/80">
        {getRoleActivities(roleActivities)}
      </div>
    </div>
  );
};

export default DialogResponsibilities;
