"use client";

import EmployerPreviewModal from "@/components/talent/EmployerPreviewModal";
import TalentPreferences from "@/components/talent/TalentPreferences";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/contexts/AppContext";
import { DEMO_MAIL_THREADS } from "@/data/inbox-demo";
import { formatCompactRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const INTRO_REQUESTS = DEMO_MAIL_THREADS.filter((t) => t.unread).slice(0, 3);

export default function TalentNetworkPage() {
  const { user } = useApp();
  const [live, setLive] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  const displayName = user.name?.trim() || "Your name";
  const skills = user.skills.length > 0 ? user.skills.slice(0, 6) : ["TypeScript", "React", "Next.js", "Node.js"];
  const email = user.email || "you@example.com";

  const roleLine = useMemo(() => {
    const title = skills[0] ? `${skills[0]} engineer` : "Software engineer";
    return `${title.charAt(0).toUpperCase()}${title.slice(1)} · Remote`;
  }, [skills]);

  const experience = ["Senior Engineer · Current role · 2022–now", "Software Engineer · Prior role · 2019–2022"];
  const education = "B.S. Computer Science";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background-body p-6 lg:p-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Talent Network</h1>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <span className={cn("font-medium", live ? "text-foreground" : "text-muted-foreground")}>{live ? "Live" : "Hidden"}</span>
              <Switch checked={live} onCheckedChange={setLive} aria-label="Toggle talent network visibility" />
            </label>
            <Button asChild variant="outline" size="sm">
              <Link href="/inbox">
                <Inbox className="mr-1.5 size-4" />
                Inbox
              </Link>
            </Button>
          </div>
        </div>

        <TalentPreferences onHowEmployersSeeIt={() => setPreviewOpen(true)} />

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">Intro requests</h2>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link href="/inbox">Open inbox</Link>
            </Button>
          </div>

          {!live ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              Profile is hidden. Flip Live to receive intro requests.
            </div>
          ) : INTRO_REQUESTS.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">No intro requests yet.</div>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {INTRO_REQUESTS.map((thread) => (
                <li key={thread.id}>
                  <Link href="/inbox" className="flex items-start justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-muted/50">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{thread.company}</p>
                        {thread.unread ? (
                          <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                            New
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">{thread.subject}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{thread.name}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatCompactRelativeTime(thread.date)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <EmployerPreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        name={displayName}
        roleLine={roleLine}
        experience={experience}
        education={education}
        skills={skills}
        contact={[email]}
      />
    </div>
  );
}
