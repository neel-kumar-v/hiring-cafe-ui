"use client";

import { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip, type SankeyData, type SankeyNodeDatum } from "@/components/charts/sankey";
import type { JobCategory } from "@/types/tracker";
import { useMemo } from "react";

type TrackerFlowDiagramProps = {
  counts: Record<JobCategory, number>;
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

export default function TrackerFlowDiagram({ counts }: TrackerFlowDiagramProps) {
  const total = CATEGORY_META.reduce((sum, { category }) => sum + counts[category], 0);

  const data = useMemo<SankeyData>(() => {
    const visibleCategories = CATEGORY_META.filter(({ category }) => counts[category] > 0);

    return {
      nodes: [
        { category: "source", name: "Tracked jobs" },
        ...visibleCategories.map(({ category, label }) => ({ category: "outcome" as const, name: label, categoryKey: category })),
      ],
      links: visibleCategories.map((item, index) => ({
        source: 0,
        target: index + 1,
        value: counts[item.category],
      })),
    };
  }, [counts]);

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-1 text-lg font-semibold text-foreground">Job flow</div>
        <p className="text-sm text-muted-foreground">Save or apply to a job to see it move through your tracker.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Job flow</h2>
          <p className="text-sm text-muted-foreground">Your tracked jobs by current stage.</p>
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
        revealSignature={Object.values(counts).join(":")}
      >
        <SankeyLink getNodeColor={(node) => getNodeColor(node)} strokeOpacity={0.45} />
        <SankeyNode getNodeColor={(node) => getNodeColor(node)} lineCap={5} />
        <SankeyTooltip formatValue={formatValue} />
      </SankeyChart>
    </section>
  );
}
