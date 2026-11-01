/**
 * Demo data for the new-design app-shell surfaces that have no backend yet.
 * UI-only by design (see docs/redesign-structure-plan.md): real chat/agent search
 * backends land later; deleting these constants removes the demo content cleanly.
 */

export interface DemoAgentChat {
  id: string;
  name: string;
  prompt?: string;
  summary?: string;
  criteria?: string[];
  lastRun?: string;
  updatedAt?: number;
}

export const DEMO_AGENT_CHATS: DemoAgentChat[] = [
  {
    id: "chat-nyc-swe",
    name: "Entry-Level SWE — NYC / SF / Seattle / remote US",
    prompt: "Find junior and entry-level software engineering roles with transparent salary over $150k in tech hubs or remote US.",
    summary: "117 matched roles · Developer-product & infra companies · Salary floor $150k+",
    criteria: ["Full Time", "Remote / NYC / SF / Seattle", "Salary: $150k+", "Entry-Level", "Infra & Dev Tools"],
    lastRun: "2 hours ago",
    updatedAt: 1793380000000,
  },
  {
    id: "chat-new-grad",
    name: "Find New Grad / Entry roles with listed salary",
    prompt: "Search for 2025/2026 new grad software engineer positions with confirmed compensation ranges.",
    summary: "84 matched roles · Full-time new grad postings · Verified compensation",
    criteria: ["Full Time", "New Grad 2025/2026", "Listed Salary", "Software Engineer"],
    lastRun: "5 hours ago",
    updatedAt: 1793370000000,
  },
  {
    id: "chat-internships",
    name: "Find internships / new grad spring 2027",
    prompt: "Track summer & spring 2027 engineering internships, co-ops, and student programs across North America.",
    summary: "42 matched roles · Summer/Spring co-ops · Actively recruiting",
    criteria: ["Internship / Co-op", "Spring / Summer 2027", "Software Engineering", "North America"],
    lastRun: "Yesterday",
    updatedAt: 1793300000000,
  },
];

/** Deterministic "N new" badge counts so the UI reads live without a backend. */
export function demoNewCount(key: string): number {
  const hash = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return Math.min(969, Math.max(4, (hash % 150) + 4));
}

export interface DemoChatMessage {
  id: string;
  role: "agent" | "user";
  text: string;
  /** "Show agent thinking" disclosure attached to this agent turn. */
  thinking?: string;
  /** Timestamp shown on user messages ("YOU · Oct 6, 7:28 PM"). */
  at?: string;
  /** Inline "Running job searches" results card posted by the agent. */
  searchCard?: { rows: { name: string; jobs: number }[] };
}

export const DEMO_AGENT_INTRO: DemoChatMessage[] = [
  {
    id: "demo-msg-intro-1",
    role: "agent",
    text: [
      "I set up your board for **entry-level software engineering** roles. Here's what's in it:",
      "• 210 roles at infrastructure and developer-product companies — all with listed salaries clearing $150k",
      "• NYC-based roles are ranked toward the top",
    ].join("\n"),
  },
  {
    id: "demo-msg-intro-2",
    role: "agent",
    text: "Head to the dashboard to browse them. One thing worth considering as you look through — would you like to refine by workplace mode (e.g. only onsite/hybrid in NYC, vs. remote-only)? That could help surface the most actionable listings given your location preferences.",
  },
  {
    id: "demo-msg-intro-3",
    role: "user",
    at: "Oct 6, 7:28 PM",
    text: `Please modify the "Entry-Level SWE — NYC / SF / Seattle / remote US" search — update the filters and re-run it:\n\n• add Salary: Range starts at least USD 150,000\n\nKeep everything else about the search the same.`,
  },
  {
    id: "demo-msg-intro-4",
    role: "agent",
    thinking: `The user wants to add a salary filter: "Range starts at least USD 150,000". This maps to \`minCompensationLowEnd: 150000\` — the low end of the posted salary range must be at least $150k. This is different from the existing \`maxCompensationLowEnd: 150000\` filter which requires the high end to reach $150k.

So now we'll have both:

• \`maxCompensationLowEnd: 150000\` (the job's listed salary max must be at least $150k) — already set
• \`minCompensationLowEnd: 150000\` (the job's listed salary low end must be at least $150k) — adding this

I'm confirming this maps correctly to \`minCompensationLowEnd\` per the instructions about range starts referring to posting bounds, not the standard floor. Since the search already completed, I need to stage this as a pending revision rather than rerun immediately.

Looking more closely at the system prompt, there's a dashboard client action of type \`'apply_filters_and_rerun'\` tied to exact search_key "kg20q0mcv6" — the user clicked Apply & Rerun in the filters UI, even though their message itself is plain English without a machine-readable action.

The user confirmed. The dashboard client action says to run search_key "kg20q0mcv6". Let me run it.`,
    searchCard: {
      rows: [{ name: `Entry-Level SWE — NYC / SF / Seattle / remote US`, jobs: 117 }],
    },
    text: "Done! The stricter salary filter — requiring the **bottom** of the posted range to start at $150k+ — tightened the pool from 210 → **117 jobs**, all of which have a salary floor at or above $150k. Results are updated in your dashboard.",
  },
];

export const DEMO_AGENT_FALLBACK_REPLY =
  "Got it — I've noted that preference. This demo build doesn't run a live agent yet, but in the full setup I would re-run your search and fold the change into your saved results.";
