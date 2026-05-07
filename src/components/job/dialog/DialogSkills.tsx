import { jobFadeClass } from "@/lib/jobs/fadeTransition";
import CardTechnicalTools from "../card/CardTechnicalTools";

const DialogSkills = ({
  technicalTools,
  isTransitioning = false,
}: {
  technicalTools: string[];
  isTransitioning?: boolean;
}) => {
  if (!technicalTools || technicalTools.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-foreground text-lg dark:text-foreground">
        Skills
      </h3>
      <div className={jobFadeClass(isTransitioning)}>
        <CardTechnicalTools technicalTools={technicalTools} variant="dialog" />
      </div>
    </div>
  );
};

export default DialogSkills;
