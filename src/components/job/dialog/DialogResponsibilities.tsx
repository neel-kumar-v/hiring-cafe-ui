import { getRoleActivities } from "@/lib/job-info";
import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import { cn } from "@/lib/utils";

const DialogResponsibilities = ({
  roleActivities,
  isTransitioning = false,
}: {
  roleActivities: string[] | null;
  isTransitioning?: boolean;
}) => {
  if (!roleActivities || roleActivities.length === 0) return null;  

  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-foreground text-lg dark:text-foreground">
        Responsibilities
      </h3>
      <div className={cn("text-foreground/80 leading-relaxed dark:text-foreground/80", jobFadeClass(isTransitioning))}>
        {getRoleActivities(roleActivities)}
      </div>
    </div>
  );
};

export default DialogResponsibilities;
