import { useApp } from "@/contexts/AppContext";
import { getCurrentYear } from "@/lib/search/company";
import { getInvestorsFromData, getRoundTypesFromData } from "@/lib/search";
import { CurrentStage, Keywords, Select } from "@/types/search";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import RangeSlider from "../util/RangeSlider";

export default function Stage() {
  const { searchOptions, updateSearchOptions } = useApp();

  const stagesOptions: CurrentStage[] = ["Public", "Private"];

  const isCurrentStageSelected = (currentStage: CurrentStage): boolean => {
    if (searchOptions.stage_funding.current === "All") return true;
    if (Array.isArray(searchOptions.stage_funding.current)) {
      return searchOptions.stage_funding.current.includes(currentStage);
    }
    return false;
  };

  const handleCurrentStageChange = useCallback((currentStage: CurrentStage) => {
    const currentStages = searchOptions.stage_funding.current;
    let newCurrentStages: Select<CurrentStage, "All">;

    if (currentStages === "All") {
      const allExceptSelected = stagesOptions.filter((stage: CurrentStage) => stage !== currentStage);
      newCurrentStages = allExceptSelected;
    } else if (Array.isArray(currentStages)) {
      if (currentStages.includes(currentStage)) {
        newCurrentStages = currentStages.filter(stage => stage !== currentStage);
        newCurrentStages = newCurrentStages.length === 0 ? "All" : newCurrentStages;
        toast.info("Selecting no current stages is the same as selecting all current stages")
      } else {
        newCurrentStages = [...currentStages, currentStage];
        newCurrentStages = newCurrentStages.length === currentStages.length ? "All" : newCurrentStages;
      }
    } else {
      newCurrentStages = [currentStage];
    }

    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        current: newCurrentStages
      }
    });
  }, [searchOptions.stage_funding, updateSearchOptions]);

  const roundTypes = useMemo(() => {
    return getRoundTypesFromData().map(roundType => ({
      label: roundType,
      value: roundType
    }));
  }, []);

  const investors = useMemo(() => {
    return getInvestorsFromData().map(investor => ({
      label: investor,
      value: investor
    }));
  }, []);

  const handleKeywordsChange = useCallback((keywords: Keywords, id: "round_types" | "investors") => {
    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        [id === "round_types" ? "latest_round_type" : "investors"]: keywords,
      }
    });
  }, [searchOptions.stage_funding, updateSearchOptions]);

  const handleLatestRoundChange = useCallback(([min, max]: [number, number]) => {
    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        latest_round: { min, max }
      }
    });
  }, [searchOptions.stage_funding, updateSearchOptions]);

  const handleLatestRoundAmountChange = useCallback(([min, max]: [number, number]) => {
    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        latest_round_amount: { min, max }
      }
    });
  }, [searchOptions.stage_funding, updateSearchOptions]);

  const roundTypesKeywords = useMemo(() => searchOptions.stage_funding.latest_round_type, [searchOptions.stage_funding.latest_round_type]);
  const investorsKeywords = useMemo(() => searchOptions.stage_funding.investors, [searchOptions.stage_funding.investors]);

  return (
    <FilterContainer title="Stage & Funding">
      <LabelInputContainer title="Current Stage" midColCount={2} lgColCount={2}>
        <LabelCheckbox
          label="Public"
          checked={isCurrentStageSelected("Public")}
          onChange={() => handleCurrentStageChange("Public")}
        />
        <LabelCheckbox
          label="Private"
          checked={isCurrentStageSelected("Private")}
          onChange={() => handleCurrentStageChange("Private")}
        />
      </LabelInputContainer>
      <KeywordsMultiSelect
        value={roundTypesKeywords}
        onChange={(keywords) => handleKeywordsChange(keywords, "round_types")}
        includeOptions={roundTypes}
        excludeOptions={roundTypes}
        includePlaceholder="Include Round Types"
        excludePlaceholder="Exclude Round Types"
      />
      <KeywordsMultiSelect
        value={investorsKeywords}
        onChange={(keywords) => handleKeywordsChange(keywords, "investors")}
        includeOptions={investors}
        excludeOptions={investors}
        includePlaceholder="Include Investors"
        excludePlaceholder="Exclude Investors"
      />
      <div>
        <div className="mb-1 text-xs font-medium">Latest Round Year Range</div>
        <RangeSlider
          min={1800}
          max={getCurrentYear()}
          step={1}
          money={false}
          value={[searchOptions.stage_funding.latest_round.min === 0 ? 1800 : searchOptions.stage_funding.latest_round.min, searchOptions.stage_funding.latest_round.max === 0 ? getCurrentYear() : searchOptions.stage_funding.latest_round.max]}
          onValueChange={handleLatestRoundChange}
        />
      </div>
      <div>
        <div className="mb-1 text-xs font-medium">Latest Round Amount</div>
        <RangeSlider
          min={0}
          max={500000000}
          step={100000}
          currency="$"
          money={true}
          value={[searchOptions.stage_funding.latest_round_amount.min === 0 ? 0 : searchOptions.stage_funding.latest_round_amount.min, searchOptions.stage_funding.latest_round_amount.max === 0 ? 500000000 : searchOptions.stage_funding.latest_round_amount.max]}
          onValueChange={handleLatestRoundAmountChange}
        />
      </div>
    </FilterContainer>
  );
} 