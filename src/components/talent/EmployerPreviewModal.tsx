"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SlidingTabs, type SlidingTabOption } from "@/components/ui/sliding-tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";

type EmployerPreviewModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  roleLine: string;
  experience: string[];
  education: string;
  skills: string[];
  contact: string[];
};

type PreviewStage = "before" | "after";

const PREVIEW_STAGE_OPTIONS: readonly SlidingTabOption<PreviewStage>[] = [
  { id: "before", label: "Before you accept", ariaLabel: "Before you accept" },
  { id: "after", label: "After you accept", ariaLabel: "After you accept" },
];

export default function EmployerPreviewModal({ open, onOpenChange, name, roleLine, experience, education, skills, contact }: EmployerPreviewModalProps) {
  const [accepted, setAccepted] = useState(false);
  const blurred = !accepted;
  const initials = name.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setAccepted(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="px-5 pt-4 pb-0 text-left">
          <DialogTitle>How employers see you</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          <SlidingTabs<PreviewStage>
            ariaLabel="Employer preview stage"
            role="radiogroup"
            shape="pill"
            tone="default"
            size="sm"
            value={accepted ? "after" : "before"}
            onChange={(next) => setAccepted(next === "after")}
            options={PREVIEW_STAGE_OPTIONS}
            className="w-full flex"
            tabClassName="flex-1"
          />

          <div className={cn("space-y-4 rounded-lg border border-border bg-card p-5", blurred && "select-none")}>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground transition-[filter]",
                  blurred && "blur-[3px]"
                )}
              >
                {blurred ? "?" : initials}
              </div>
              <div className="min-w-0">
                <p className={cn("font-semibold text-foreground transition-[filter]", blurred && "blur-[3px]")}>{name}</p>
                <p className="text-sm text-muted-foreground">{roleLine}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Experience</p>
              <ul className="mt-1.5 space-y-1 text-sm text-foreground">
                {experience.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Education</p>
              <p className="mt-1.5 text-sm text-foreground">{education}</p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {accepted && contact.length > 0 ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</p>
                <ul className="mt-1.5 space-y-1 text-sm text-foreground">
                  {contact.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end border-t border-border px-5 py-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
