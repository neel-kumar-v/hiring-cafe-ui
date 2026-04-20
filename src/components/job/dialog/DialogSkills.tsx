import CardTechnicalTools from "../card/CardTechnicalTools";

const DialogSkills = ({ technicalTools }: { technicalTools: string[] }) => {
  if (!technicalTools || technicalTools.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="mb-3 font-medium text-foreground text-lg dark:text-foreground">
        Skills
      </h3>
      <CardTechnicalTools technicalTools={technicalTools} variant="dialog" />
    </div>
  );
};

export default DialogSkills;
