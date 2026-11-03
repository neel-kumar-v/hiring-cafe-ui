"use client";

import { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip, type SankeyData, type SankeyNodeDatum } from "@/components/charts/sankey";
import type { JobCategory } from "@/types/tracker";
import { useMemo } from "react";

type TrackerFlowDiagramProps = {
  /**
   * Logical funnel path per tracked job: the stages the job actually reached,
   * with backward moves already reset out. Consecutive entries become links,
   * so zig-zag history never shows up as reverse edges.
   */
  paths: JobCategory[][];
};

const CATEGORY_META: Array<{ category: JobCategory; label: string; color: string }> = [
  { category: "saved", label: "Saved", color: "var(--primary)" },
  { category: "applied", label: "Applied", color: "var(--info)" },
  { category: "interviewing", label: "Interviewing", color: "var(--success)" },
  { category: "rejected", label: "Rejected", color: "var(--destructive)" },
  { category: "hidden", label: "Hidden", color: "var(--muted-foreground)" },
];

function formatValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function getNodeColor(node: SankeyNodeDatum) {
  if (node.category === "source") return "var(--primary)";
  return CATEGORY_META.find((item) => item.label === node.name)?.color ?? "var(--chart-1)";
}

/**
 * Fold every job's logical path into Sankey links. Each job enters at its first
 * stage ("Tracked jobs" → stage) and flows forward one link per stage it
 * reached; jobs pooled in a stage just end there.
 */
export function buildFlowData(paths: JobCategory[][]): SankeyData {
  const reachedStages = new Set<JobCategory>();
  for (const path of paths) {
    for (const stage of path) reachedStages.add(stage);
  }

  const nodes: SankeyNodeDatum[] = [{ category: "source", name: "Tracked jobs" }];
  const stageIndex = new Map<JobCategory, number>();
  for (const { category, label } of CATEGORY_META) {
    if (!reachedStages.has(category)) continue;
    stageIndex.set(category, nodes.length);
    nodes.push({ category: "outcome", name: label, categoryKey: category });
  }

  const linkTotals = new Map<string, number>();
  const countLink = (source: number, target: number) => {
    const key = `${source}:${target}`;
    linkTotals.set(key, (linkTotals.get(key) ?? 0) + 1);
  };

  for (const path of paths) {
    if (path.length === 0) continue;
    // Every tracked job enters the flow at the first stage it reached.
    countLink(0, stageIndex.get(path[0]) ?? 0);
    for (let index = 0; index + 1 < path.length; index += 1) {
      const source = stageIndex.get(path[index]);
      const target = stageIndex.get(path[index + 1]);
      if (source === undefined || target === undefined || source === target) continue;
      countLink(source, target);
    }
  }

  const links = Array.from(linkTotals.entries()).map(([key, value]) => {
    const [source, target] = key.split(":").map(Number);
    return { source, target, value };
  });

  return { nodes, links };
}

export default function TrackerFlowDiagram({ paths }: TrackerFlowDiagramProps) {
  const total = paths.length;

  const data = useMemo<SankeyData>(() => buildFlowData(paths), [paths]);

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">Job flow</h2>
          <span className="rounded-md bg-brand-soft px-2 py-1 text-sm font-medium text-brand-soft-foreground">0 total</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Job flow</h2>
        </div>
        <span className="rounded-md bg-brand-soft px-2 py-1 text-sm font-medium text-brand-soft-foreground">{formatValue(total)} total</span>
      </div>

      <SankeyChart
        animationDuration={900}
        aspectRatio="2.5 / 1"
        data={data}
        margin={{ bottom: 24, left: 132, right: 152, top: 24 }}
        nodePadding={18}
        nodeWidth={18}
        revealSignature={paths.map((path) => path.join(">")).join("|")}
      >
        <SankeyLink getNodeColor={(node) => getNodeColor(node)} strokeOpacity={0.45} />
        <SankeyNode getNodeColor={(node) => getNodeColor(node)} lineCap={5} />
        <SankeyTooltip formatValue={formatValue} />
      </SankeyChart>
    </section>
  );
}
