import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { useSearchData } from "@/hooks/useSearchData";
import { getCurrentYear } from "@/lib/search/company";
import { CurrentStage, Keywords, Select } from "@/types/search";
import FilterContainer from "../util/FilterContainer";
import { KeywordsMultiSelect } from "../util/KeywordsMultiSelect";
import LabelCheckbox from "../util/LabelCheckbox";
import LabelInputContainer from "../util/LabelInputContainer";
import MinMax from "../util/MinMax";

export default function Stage() {
  const { searchOptions, updateSearchOptions } = useApp();

  const stagesOptions: CurrentStage[] = ["Public", "Private"];
  const currentYear = getCurrentYear();
  const [latestRoundMin, setLatestRoundMin] = useState("");
  const [latestRoundMax, setLatestRoundMax] = useState("");
  const [latestRoundAmountMin, setLatestRoundAmountMin] = useState("");
  const [latestRoundAmountMax, setLatestRoundAmountMax] = useState("");

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

  const { options: roundTypes, loading: roundTypesLoading } = useSearchData("round_types", false);
  const { options: investors, loading: investorsLoading } = useSearchData("investors", false);

  const handleKeywordsChange = useCallback((keywords: Keywords, id: "round_types" | "investors") => {
    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        [id === "round_types" ? "latest_round_type" : "investors"]: keywords,
      }
    });
  }, [searchOptions.stage_funding, updateSearchOptions]);

  useEffect(() => {
    const { latest_round, latest_round_amount } = searchOptions.stage_funding;
    setLatestRoundMin(latest_round.min > 0 ? String(latest_round.min) : "");
    setLatestRoundMax(latest_round.max > 0 ? String(latest_round.max) : "");
    setLatestRoundAmountMin(latest_round_amount.min > 0 ? String(latest_round_amount.min) : "");
    setLatestRoundAmountMax(latest_round_amount.max > 0 ? String(latest_round_amount.max) : "");
  }, [
    searchOptions.stage_funding.latest_round.max,
    searchOptions.stage_funding.latest_round.min,
    searchOptions.stage_funding.latest_round_amount.max,
    searchOptions.stage_funding.latest_round_amount.min,
  ]);

  const toNumberOrZero = (value: string) => {
    if (!value) return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

  const commitLatestRound = useCallback(() => {
    const rawMin = toNumberOrZero(latestRoundMin);
    const rawMax = toNumberOrZero(latestRoundMax);

    const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 1800, currentYear);
    const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 1800, currentYear);

    const min = normalizedMin;
    const max = normalizedMax;

    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        latest_round: min > 0 && max > 0 && min > max ? { min: max, max: min } : { min, max },
      },
    });
  }, [currentYear, latestRoundMax, latestRoundMin, searchOptions.stage_funding, updateSearchOptions]);

  const commitLatestRoundAmount = useCallback(() => {
    const rawMin = toNumberOrZero(latestRoundAmountMin);
    const rawMax = toNumberOrZero(latestRoundAmountMax);

    const normalizedMin = rawMin === 0 ? 0 : clamp(rawMin, 0, 500000000);
    const normalizedMax = rawMax === 0 ? 0 : clamp(rawMax, 0, 500000000);

    const min = normalizedMin;
    const max = normalizedMax;

    updateSearchOptions({
      stage_funding: {
        ...searchOptions.stage_funding,
        latest_round_amount: min > 0 && max > 0 && min > max ? { min: max, max: min } : { min, max },
      },
    });
  }, [latestRoundAmountMax, latestRoundAmountMin, searchOptions.stage_funding, updateSearchOptions]);

  const roundTypesKeywords = useMemo(() => searchOptions.stage_funding.latest_round_type, [searchOptions.stage_funding.latest_round_type]);
  const investorsKeywords = useMemo(() => searchOptions.stage_funding.investors, [searchOptions.stage_funding.investors]);

  return (
    <FilterContainer categoryId="stage" title="Stage & Funding">
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
      {roundTypesLoading ? (
        <div className="text-sm text-muted-foreground">Loading round types...</div>
      ) : (
        <KeywordsMultiSelect
          value={roundTypesKeywords}
          onChange={(keywords) => handleKeywordsChange(keywords, "round_types")}
          includeOptions={roundTypes}
          excludeOptions={roundTypes}
          includePlaceholder="Include Round Types"
          excludePlaceholder="Exclude Round Types"
        />
      )}
      {investorsLoading ? (
        <div className="text-sm text-muted-foreground">Loading investors...</div>
      ) : (
        <KeywordsMultiSelect
          value={investorsKeywords}
          onChange={(keywords) => handleKeywordsChange(keywords, "investors")}
          includeOptions={investors}
          excludeOptions={investors}
          includePlaceholder="Include Investors"
          excludePlaceholder="Exclude Investors"
        />
      )}
      <div>
        <MinMax
          title="Latest Round Year Range"
          variant="number"
          minValue={latestRoundMin}
          maxValue={latestRoundMax}
          minPlaceholder="No min"
          maxPlaceholder="No max"
          onChangeMinValue={setLatestRoundMin}
          onChangeMaxValue={setLatestRoundMax}
          onBlurCommit={commitLatestRound}
        />
      </div>
      <div>
        <MinMax
          title="Latest Round Amount"
          variant="number"
          minValue={latestRoundAmountMin}
          maxValue={latestRoundAmountMax}
          minPlaceholder="No min"
          maxPlaceholder="No max"
          onChangeMinValue={setLatestRoundAmountMin}
          onChangeMaxValue={setLatestRoundAmountMax}
          onBlurCommit={commitLatestRoundAmount}
        />
      </div>
    </FilterContainer>
  );
} 
