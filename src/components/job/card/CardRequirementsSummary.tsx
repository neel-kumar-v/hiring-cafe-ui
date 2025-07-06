const CardRequirementsSummary = ({
  requirementsSummary,
}: {
  requirementsSummary: string;
}) => {
  return (
    <div className="line-clamp-3 cursor-text text-neutral-700 text-xs leading-normal dark:text-neutral-300">
      {requirementsSummary}
    </div>
  );
};

export default CardRequirementsSummary;
