import { ConvexHttpClient } from "convex/browser";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type BenchCase = {
	name: string;
	args: Record<string, unknown>;
};

const url = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!url) {
	throw new Error("NEXT_PUBLIC_CONVEX_URL is required for benchmark runs.");
}

const attempts = Number(process.env.BENCH_ATTEMPTS ?? "3");
const now = new Date().toISOString();
const client = new ConvexHttpClient(url);
const queryFn = (client as any).query.bind(client as any);

const cases: BenchCase[] = [
	{
		name: "blank-first-page",
		args: { paginationOpts: { numItems: 24, cursor: null } },
	},
	{
		name: "broad-text-engineer",
		args: { q: "engineer", paginationOpts: { numItems: 24, cursor: null } },
	},
	{
		name: "text-workplace-company",
		args: {
			q: "engineer",
			filters: { workplaceTypes: ["remote"], companyIds: ["google", "meta"] },
			paginationOpts: { numItems: 24, cursor: null },
		},
	},
];

function percentile(sorted: number[], p: number) {
	if (!sorted.length) return null;
	const idx = Math.floor((sorted.length - 1) * p);
	return sorted[idx];
}

async function runCase(benchCase: BenchCase) {
	const durations: number[] = [];
	let timeoutCount = 0;
	let returnedRows = 0;

	for (let i = 0; i < attempts; i += 1) {
		const started = Date.now();
		try {
			const result = await queryFn("jobs:search", benchCase.args);
			durations.push(Date.now() - started);
			returnedRows = Array.isArray((result as any)?.page) ? (result as any).page.length : 0;
		} catch (error: any) {
			const message = String(error?.message ?? error ?? "");
			if (message.includes("SystemTimeoutError")) timeoutCount += 1;
		}
	}

	const sorted = durations.slice().sort((a, b) => a - b);
	return {
		name: benchCase.name,
		attempts,
		successes: durations.length,
		timeouts: timeoutCount,
		timeoutRate: attempts ? timeoutCount / attempts : 0,
		p50Ms: percentile(sorted, 0.5),
		p95Ms: percentile(sorted, 0.95),
		returnedRows,
	};
}

async function runPaginationChain() {
	const started = Date.now();
	let cursor: string | null = null;
	let pagesCompleted = 0;
	let timeout = false;
	let rowsTotal = 0;

	for (let page = 0; page < 5; page += 1) {
		try {
			const result = (await queryFn("jobs:search", {
				paginationOpts: { numItems: 24, cursor },
			})) as any;
			rowsTotal += Array.isArray(result?.page) ? result.page.length : 0;
			pagesCompleted += 1;
			cursor = result?.continueCursor ?? null;
			if (result?.isDone) break;
		} catch (error: any) {
			if (String(error?.message ?? "").includes("SystemTimeoutError")) timeout = true;
			break;
		}
	}

	return {
		name: "pagination-5-pages",
		durationMs: Date.now() - started,
		pagesCompleted,
		rowsTotal,
		timeout,
	};
}

async function main() {
	const summaries = [];
	for (const benchCase of cases) {
		summaries.push(await runCase(benchCase));
	}
	const chain = await runPaginationChain();

	const output = {
		timestamp: now,
		url,
		attempts,
		summaries,
		pagination: chain,
	};

	const outDir = resolve("scripts", "benchmarks");
	mkdirSync(outDir, { recursive: true });
	const outPath = resolve(outDir, "convex-search-benchmark.json");
	writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

	console.log(JSON.stringify(output, null, 2));
	console.log(`Saved benchmark report to ${outPath}`);
}

void main();
