"use client";

import { SankeyChart, SankeyLink, SankeyNode, SankeyTooltip, type SankeyData, type SankeyLinkDatum, type SankeyNodeDatum } from "@/components/charts/sankey";
import type { JobTransition } from "@/types/app";
import type { JobCategory } from "@/types/tracker";
import { useMemo } from "react";

export type TrackerFlowDiagramProps = {
  counts: Record<JobCategory, number>;
  transitions?: JobTransition[];
};

export const CATEGORY_META: Array<{ category: JobCategory; label: string; color: string }> = [
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

function wouldCreateCycle(
  existingEdges: Array<{ from: string; to: string }>,
  newEdge: { from: string; to: string }
): boolean {
  if (newEdge.from === newEdge.to) return true;
  const visited = new Set<string>();
  const queue = [newEdge.to];
  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr === newEdge.from) return true;
    visited.add(curr);
    for (const edge of existingEdges) {
      if (edge.from === curr && !visited.has(edge.to)) {
        queue.push(edge.to);
      }
    }
  }
  return false;
}

export function buildPipelineSankeyData(
  counts: Record<JobCategory, number>,
  transitions?: JobTransition[]
): SankeyData {
  const categoryTransitions = (transitions ?? []).filter(
    (t): t is JobTransition & { to: JobCategory } => Boolean(t.to && CATEGORY_META.some((m) => m.category === t.to))
  );

  const pipelineOrder: Record<JobCategory, number> = {
    saved: 1,
    applied: 2,
    interviewing: 3,
    rejected: 4,
    hidden: 5,
  };

  const seenJobEdges = new Set<string>();
  const interCategoryCounts = new Map<string, number>();

  const sortedTransitions = [...categoryTransitions].sort((a, b) => a.at - b.at);

  for (const t of sortedTransitions) {
    if (t.from && t.to && t.from !== t.to && CATEGORY_META.some((m) => m.category === t.from)) {
      const edgeKey = `${t.jobId}:${t.from}->${t.to}`;
      if (!seenJobEdges.has(edgeKey)) {
        seenJobEdges.add(edgeKey);
        const pairKey = `${t.from}->${t.to}`;
        interCategoryCounts.set(pairKey, (interCategoryCounts.get(pairKey) ?? 0) + 1);
      }
    }
  }

  const pairEntries = Array.from(interCategoryCounts.entries()).sort(([pairA, countA], [pairB, countB]) => {
    const [fromA, toA] = pairA.split("->") as [JobCategory, JobCategory];
    const [fromB, toB] = pairB.split("->") as [JobCategory, JobCategory];
    const isForwardA = pipelineOrder[fromA] < pipelineOrder[toA];
    const isForwardB = pipelineOrder[fromB] < pipelineOrder[toB];
    if (isForwardA !== isForwardB) return isForwardA ? -1 : 1;
    return countB - countA;
  });

  const safeInterEdges: Array<{ from: JobCategory; to: JobCategory; value: number }> = [];
  const addedEdgePairs: Array<{ from: string; to: string }> = [];

  for (const [pair, count] of pairEntries) {
    const [from, to] = pair.split("->") as [JobCategory, JobCategory];
    if (!wouldCreateCycle(addedEdgePairs, { from, to })) {
      addedEdgePairs.push({ from, to });
      safeInterEdges.push({ from, to, value: count });
    }
  }

  const outflowMap: Record<JobCategory, number> = {
    saved: 0,
    applied: 0,
    interviewing: 0,
    rejected: 0,
    hidden: 0,
  };
  const inflowMap: Record<JobCategory, number> = {
    saved: 0,
    applied: 0,
    interviewing: 0,
    rejected: 0,
    hidden: 0,
  };

  for (const edge of safeInterEdges) {
    outflowMap[edge.from] = (outflowMap[edge.from] ?? 0) + edge.value;
    inflowMap[edge.to] = (inflowMap[edge.to] ?? 0) + edge.value;
  }

  const allEdges: Array<{ from: string; to: string; value: number }> = [];

  for (const { category } of CATEGORY_META) {
    const current = counts[category] ?? 0;
    const outflow = outflowMap[category] ?? 0;
    const interInflow = inflowMap[category] ?? 0;
    const sourceInflow = Math.max(0, current + outflow - interInflow);

    if (sourceInflow > 0) {
      allEdges.push({
        from: "source",
        to: category,
        value: sourceInflow,
      });
    }
  }

  for (const edge of safeInterEdges) {
    if (edge.value > 0) {
      allEdges.push(edge);
    }
  }

  if (allEdges.length === 0) {
    return { nodes: [], links: [] };
  }

  const activeKeysSet = new Set<string>();
  for (const edge of allEdges) {
    activeKeysSet.add(edge.from);
    activeKeysSet.add(edge.to);
  }

  const orderedKeys = ["source", ...CATEGORY_META.map((m) => m.category)].filter((k) => activeKeysSet.has(k));
  const keyToIndex = new Map<string, number>();

  const nodes: SankeyNodeDatum[] = orderedKeys.map((key, index) => {
    keyToIndex.set(key, index);
    if (key === "source") {
      return { category: "source", name: "Tracked jobs" };
    }
    const meta = CATEGORY_META.find((m) => m.category === key)!;
    return { category: "outcome", name: meta.label, categoryKey: key };
  });

  const links: SankeyLinkDatum[] = allEdges.map((edge) => ({
    source: keyToIndex.get(edge.from)!,
    target: keyToIndex.get(edge.to)!,
    value: edge.value,
  }));

  return { nodes, links };
}

export default function TrackerFlowDiagram({ counts, transitions }: TrackerFlowDiagramProps) {
  const total = CATEGORY_META.reduce((sum, { category }) => sum + counts[category], 0);

  const data = useMemo<SankeyData>(() => {
    return buildPipelineSankeyData(counts, transitions);
  }, [counts, transitions]);

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
        revealSignature={`${Object.values(counts).join(":")}:${transitions?.length ?? 0}`}
      >
        <SankeyLink getNodeColor={(node) => getNodeColor(node)} strokeOpacity={0.45} />
        <SankeyNode getNodeColor={(node) => getNodeColor(node)} lineCap={5} />
        <SankeyTooltip formatValue={formatValue} />
      </SankeyChart>
    </section>
  );
}
