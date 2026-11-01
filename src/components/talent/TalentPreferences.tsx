"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Banknote, ChevronDown, EyeOff, FileText, Github, Globe, Globe2, Link2, Linkedin, MapPin, Plus, Search, Upload } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";

const STORAGE_KEY = "talent-network-prefs";

function getLinkIcon(url: string) {
  const lower = url.trim().toLowerCase();
  if (lower.includes("linkedin")) return Linkedin;
  if (lower.includes("github")) return Github;
  return Globe;
}

type TalentPrefs = {
  resumeName: string | null;
  otherResumeCount: number;
  homeLocation: string;
  openToLocations: string[];
  minimumPay: string;
  links: string[];
  hiddenCompanies: string[];
};

const DEFAULT_PREFS: TalentPrefs = {
  resumeName: "Neel Kumar Resume",
  otherResumeCount: 2,
  homeLocation: "Chester Springs, PA, US",
  openToLocations: [],
  minimumPay: "30/hr",
  links: ["https://www.linkedin.com/in/neel-v-kumar/", "https://neelvkumar.vercel.app/"],
  hiddenCompanies: [],
};

function loadPrefs(): TalentPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function PreferenceRow({ icon, label, children, action }: { icon: ReactNode; label: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3 border-b border-border py-5 last:border-b-0 sm:items-start sm:gap-x-6",
        action ? "sm:grid-cols-[11rem_minmax(0,1fr)_auto]" : "sm:grid-cols-[11rem_minmax(0,1fr)]"
      )}
    >
      <div className="flex items-start gap-2.5 pt-1 text-muted-foreground">
        <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>
        <span className="text-sm font-medium leading-snug">{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
      {action ? <div className="flex justify-end sm:pt-0.5">{action}</div> : null}
    </div>
  );
}

function SearchField({ value, onChange, placeholder, trailing }: { value: string; onChange: (value: string) => void; placeholder?: string; trailing?: ReactNode }) {
  return (
    <div className="relative flex items-center">
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn("h-10 bg-background pl-9 shadow-xs", trailing ? "pr-9" : undefined)}
      />
      {trailing ? <span className="absolute right-2.5 text-muted-foreground">{trailing}</span> : null}
    </div>
  );
}

export default function TalentPreferences({ onHowEmployersSeeIt }: { onHowEmployersSeeIt?: () => void }) {
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [prefs, setPrefs] = useState<TalentPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [openToDraft, setOpenToDraft] = useState("");
  const [hiddenDraft, setHiddenDraft] = useState("");
  const [dragging, setDragging] = useState(false);
  const [managingResume, setManagingResume] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* ignore */
    }
  }, [hydrated, prefs]);

  const update = useCallback((patch: Partial<TalentPrefs>) => {
    setPrefs((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyResumeFile = useCallback((file: File | null) => {
    if (!file) return;
    const base = file.name.replace(/\.[^.]+$/, "").trim() || "Resume";
    setPrefs((prev) => ({
      ...prev,
      resumeName: base,
      otherResumeCount: prev.resumeName ? prev.otherResumeCount + 1 : prev.otherResumeCount,
    }));
    setManagingResume(false);
  }, []);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyResumeFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    applyResumeFile(event.dataTransfer.files?.[0] ?? null);
  };

  const addOpenTo = () => {
    const next = openToDraft.trim();
    if (!next) return;
    if (prefs.openToLocations.includes(next)) {
      setOpenToDraft("");
      return;
    }
    update({ openToLocations: [...prefs.openToLocations, next] });
    setOpenToDraft("");
  };

  const addHidden = () => {
    const next = hiddenDraft.trim().toLowerCase();
    if (!next) return;
    if (prefs.hiddenCompanies.includes(next)) {
      setHiddenDraft("");
      return;
    }
    update({ hiddenCompanies: [...prefs.hiddenCompanies, next] });
    setHiddenDraft("");
  };

  const setLinkAt = (index: number, value: string) => {
    const links = [...prefs.links];
    links[index] = value;
    update({ links });
  };

  const addLinkField = () => {
    update({ links: [...prefs.links, ""] });
  };

  return (
    <section className="rounded-lg border border-border bg-card px-4 sm:px-5">
      <input ref={fileRef} id={fileInputId} type="file" accept=".pdf,.doc,.docx,application/pdf" className="sr-only" onChange={onFileChange} />

      <PreferenceRow
        icon={<FileText />}
        label="Resume employers see"
        action={
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setManagingResume((v) => !v)}>
            Manage
          </Button>
        }
      >
        {prefs.resumeName && !managingResume ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-medium text-foreground">{prefs.resumeName}</p>
            <button type="button" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:underline" onClick={onHowEmployersSeeIt}>
              How employers see it
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors",
              dragging && "border-primary bg-primary/5"
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <Upload className="size-5 text-muted-foreground" />
            <p className="text-sm text-foreground">Drop a resume, or browse</p>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              Choose file
            </Button>
            {prefs.resumeName ? (
              <button type="button" className="text-xs text-muted-foreground underline-offset-2 hover:underline" onClick={() => setManagingResume(false)}>
                Keep {prefs.resumeName}
              </button>
            ) : null}
          </div>
        )}
      </PreferenceRow>

      <PreferenceRow icon={<MapPin />} label="Where you live">
        <SearchField
          value={prefs.homeLocation}
          onChange={(homeLocation) => update({ homeLocation })}
          placeholder="City, state, or country"
          trailing={<ChevronDown className="size-4" />}
        />
      </PreferenceRow>

      <PreferenceRow icon={<Globe2 />} label="Open to working in">
        <div className="space-y-2">
          <p className="text-sm text-foreground">{prefs.openToLocations.length === 0 ? "Only where you live." : null}</p>
          {prefs.openToLocations.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {prefs.openToLocations.map((place) => (
                <li key={place}>
                  <button
                    type="button"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                    onClick={() => update({ openToLocations: prefs.openToLocations.filter((p) => p !== place) })}
                    title="Remove"
                  >
                    {place} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <SearchField value={openToDraft} onChange={setOpenToDraft} placeholder="Add a city, state, or country..." />
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" className="shrink-0" disabled={!openToDraft.trim()} onClick={addOpenTo}>
              Add
            </Button>
          </div>
        </div>
      </PreferenceRow>

      <PreferenceRow icon={<Banknote />} label="Minimum pay">
        <Input value={prefs.minimumPay} onChange={(e) => update({ minimumPay: e.target.value })} className="h-10 w-28 bg-background shadow-xs" aria-label="Minimum pay" />
      </PreferenceRow>

      <PreferenceRow icon={<Link2 />} label="Links">
        <div className="space-y-2">
          {prefs.links.map((link, index) => {
            const Icon = getLinkIcon(link);
            return (
              <div key={`link-${index}`} className="relative flex items-center">
                <Icon className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={link}
                  onChange={(e) => setLinkAt(index, e.target.value)}
                  placeholder="https://"
                  className="h-10 bg-background pl-9 shadow-xs"
                  inputMode="url"
                />
              </div>
            );
          })}
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" className="shrink-0 text-muted-foreground" onClick={addLinkField}>
              <Plus className="mr-1 size-3.5" />
              Add link
            </Button>
          </div>
        </div>
      </PreferenceRow>

      <PreferenceRow icon={<EyeOff />} label="Hidden from">
        <div className="space-y-2">
          {prefs.hiddenCompanies.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {prefs.hiddenCompanies.map((domain) => (
                <li key={domain}>
                  <button
                    type="button"
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                    onClick={() => update({ hiddenCompanies: prefs.hiddenCompanies.filter((d) => d !== domain) })}
                    title="Remove"
                  >
                    {domain} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="flex gap-2">
            <Input
              value={hiddenDraft}
              onChange={(e) => setHiddenDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHidden();
                }
              }}
              placeholder="Add a company domain (e.g. meta.com)"
              className="h-10 bg-background shadow-xs"
            />
            <Button type="button" variant="outline" size="icon" className="size-10 shrink-0" onClick={addHidden} aria-label="Hide company">
              <Plus className="size-4" />
            </Button>
          </div>
        </div>
      </PreferenceRow>
    </section>
  );
}
