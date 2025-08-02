"use client";

import { Combobox } from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UniversalTooltip from "@/components/util/UniversalTooltip";
import { getJobTitlesFromData } from "@/lib/search";
import type { BooleanOperator, SearchExpression } from "@/types/search";
import { useEffect, useState } from "react";

export function BooleanBuilder({
  value,
  onChange,
  depth = 0,
  isRoot = false,
  parentIsGroup = false,
  parentIsNot = false,
}: {
  value: SearchExpression<string>;
  onChange: (expr: SearchExpression<string>) => void;
  depth?: number;
  isRoot?: boolean;
  parentIsGroup?: boolean;
  parentIsNot?: boolean;
}) {
  const isString = typeof value === "string";
  const jobTitleOptions = getJobTitlesFromData().map((t) => ({ value: t, label: t }));
  const [input, setInput] = useState(isString ? value : "");

  useEffect(() => {
    if (isString) setInput(value as string);
  }, [value]);

  function isBooleanOperator(obj: unknown): obj is BooleanOperator<string> {
    return typeof obj === "object" && obj !== null && ("AND" in obj || "OR" in obj || "NOT" in obj);
  }

  // --- NOT node ---
  if (isBooleanOperator(value) && value.NOT !== undefined) {
    return (
      <div className="flex flex-row items-center gap-1 border border-input bg-muted/30 rounded-md px-2 py-1 max-w-full text-black dark:text-white">
        <UniversalTooltip content="Remove NOT Group">
          <span 
            className="text-sm font-medium mr-1 cursor-pointer"
            onClick={() => onChange({ NOT: undefined })}
          >NOT</span>
        </UniversalTooltip>
        <BooleanBuilder
          value={value.NOT!}
          onChange={expr => onChange({ NOT: expr })}
          depth={depth + 1}
          parentIsNot={true}
        />
      </div>
    );
  }

  // --- M-ary AND/OR group node ---
  if (isBooleanOperator(value) && (value.AND || value.OR)) {
    const op = value.AND ? "AND" : "OR";
    const childrenArr = (value[op] as SearchExpression<string>[]);
    // Handler to change the operator between two children (splits the group)
    const handleOperatorChange = (idx: number, newOp: "AND" | "OR") => {
      // Split the group at idx, wrap the right side in a new group with the new operator
      const left = childrenArr.slice(0, idx + 1);
      const right = childrenArr.slice(idx + 1);
      if (right.length === 1) {
        // If only one right, just change the group op
        onChange({ [op]: [...left, ...right] });
      } else {
        onChange({
          [op]: [
            ...left,
            { [newOp]: right },
          ],
        });
      }
    };
    // Handler to add a new child
    const handleAddChild = () => {
      onChange({ [op]: [...childrenArr, ""] });
    };
    return (
      <div className="flex flex-row flex-wrap items-center gap-1 max-w-full">
        {childrenArr.map((child, idx) => (
          <>
            {idx > 0 && (
              <Select
                value={op}
                onValueChange={newOp => handleOperatorChange(idx - 1, newOp as "AND" | "OR")}
              >
                <SelectTrigger size="default" className="w-fit min-w-[60px] max-w-[80px] border border-input rounded-md !h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            )}
            <BooleanBuilder
              value={child}
              onChange={expr => {
                const newArr = [...childrenArr];
                newArr[idx] = expr;
                onChange({ [op]: newArr });
              }}
              depth={depth + 1}
              parentIsGroup={true}
              parentIsNot={false}
            />
          </>
        ))}
        {/* Add new input at end */}
        <button
          className="ml-1 px-2 py-1 text-xs border border-input rounded-md h-8 bg-muted/30 text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out"
          onClick={handleAddChild}
          type="button"
        >
          +
        </button>
      </div>
    );
  }

  // --- String node (input) ---
  const showNot = !isRoot && !input.trim() && !parentIsNot;

  // When a string node is edited from empty to non-empty, immediately convert to a group
  const handleComboboxChange = (val: string) => {
    setInput(val);
    if (!parentIsGroup && val.trim() !== "") {
      if (input.trim() === "") {
        // Create an AND group by default
        onChange({ AND: [val, ""] });
      } else {
        onChange(val);
      }
    } else {
      onChange(val);
    }
  };

  const isNotActive = false;
  const handleNotToggle = () => {
    onChange({ NOT: input });
  };

  return (
    <div className="flex flex-row items-center max-w-full h-8 gap-0">
      {showNot && (
        <UniversalTooltip content="Create a NOT Group">
          <span
            className={`flex items-center px-2 py-1 text-sm border border-input border-r-0 rounded-l-md h-8 bg-transparent focus:outline-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors duration-200 ease-in-out`}
            onClick={handleNotToggle}
            tabIndex={0}
            aria-pressed={isNotActive}
          >
            NOT
          </span>
        </UniversalTooltip>
      )}
      <div className={showNot ? "rounded-l-none" : "rounded-md"}>
        <Combobox
          items={jobTitleOptions}
          value={input}
          onChange={handleComboboxChange}
          placeholder="Keyword or phrase"
          buttonClassName={showNot ? "!rounded-l-none" : "rounded-md"}
        />
      </div>
    </div>
  );
} 