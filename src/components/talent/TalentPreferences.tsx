"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MultiLocationPicker } from "@/components/ui/multi-location-picker";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/search";
import { Banknote, EyeOff, FileText, Github, Globe, Globe2, Link2, Linkedin, MapPin, Plus, Upload } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from "react";

const STORAGE_KEY = "talent-network-prefs-v2";
const LEGACY_STORAGE_KEY = "talent-network-prefs";

function locationFromLabel(label: string): Location {
  return {
    searched: false,
    id: `location_${label}`,
    types: ["Locality"],
    address: { formatted: label, components: [] },
    geographical: { latitude: 0, longitude: 0 },
  };
}

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
  onlyWhereYouLive: boolean;
  openToLocations: string[];
  minimumPay: string;
  links: string[];
  hiddenCompanies: string[];
};

const DEFAULT_PREFS: TalentPrefs = {
  resumeName: "Resume",
  otherResumeCount: 2,
  homeLocation: "New York, NY, US",
  onlyWhereYouLive: true,
  openToLocations: [],
  minimumPay: "30/hr",
  links: ["https://www.linkedin.com/in/username", "https://example.com/portfolio"],
  hiddenCompanies: [],
};

function loadPrefs(): TalentPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
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
        "grid grid-cols-1 gap-3 border-b border-border py-4 last:border-b-0 md:items-start md:gap-x-6 md:py-5",
        action ? "md:grid-cols-[11rem_minmax(0,1fr)_auto]" : "md:grid-cols-[11rem_minmax(0,1fr)]"
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5 text-muted-foreground md:pt-1">
        <span className="mt-0.5 shrink-0 [&_svg]:size-4">{icon}</span>
        <span className="min-w-0 text-sm font-medium leading-snug wrap-break-word">{label}</span>
      </div>
      <div className="min-w-0">{children}</div>
      {action ? <div className="flex min-w-0 justify-end md:pt-0.5">{action}</div> : null}
    </div>
  );
}

export default function TalentPreferences({ onHowEmployersSeeIt }: { onHowEmployersSeeIt?: () => void }) {
  const fileInputId = useId();
  const onlyHomeId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [prefs, setPrefs] = useState<TalentPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
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

  const setOnlyWhereYouLive = (checked: boolean) => {
    update({
      onlyWhereYouLive: checked,
      ...(checked ? { openToLocations: [] } : {}),
    });
  };

  return (
    <section className="rounded-lg border border-border bg-card px-4 sm:px-5">
      <input ref={fileRef} id={fileInputId} type="file" accept=".pdf,.doc,.docx,application/pdf" className="sr-only" onChange={onFileChange} />

      <PreferenceRow icon={<FileText />} label="Resume employers see">
        {prefs.resumeName && !managingResume ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <button type="button" className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-2 hover:underline" onClick={onHowEmployersSeeIt}>
              How employers see it
            </button>
            <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setManagingResume((v) => !v)}>
              Manage
            </Button>
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
        <MultiLocationPicker
          className="w-full min-w-0"
          locations={[locationFromLabel(prefs.homeLocation)]}
          onLocationsChange={(next) => {
            const last = next[next.length - 1];
            if (last) update({ homeLocation: last.address.formatted });
          }}
          placeholder="City, state, or country"
          theme={{
            input: "h-10 w-full min-w-0 bg-background text-foreground shadow-xs",
            searchButton: "size-10 shrink-0 p-0",
            locateButton: "size-10 shrink-0 p-0",
          }}
        />
      </PreferenceRow>

      <PreferenceRow icon={<Globe2 />} label="Open to working in">
        <div className="space-y-2">
          <ul className="flex flex-wrap items-center gap-1.5">
            <li>
              <label
                htmlFor={onlyHomeId}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs font-normal text-foreground hover:bg-muted",
                  prefs.onlyWhereYouLive && "border-primary/40 bg-primary/5"
                )}
              >
                <Checkbox id={onlyHomeId} checked={prefs.onlyWhereYouLive} onCheckedChange={(value) => setOnlyWhereYouLive(value === true)} />
                Only where you live
              </label>
            </li>
          </ul>

          {!prefs.onlyWhereYouLive ? (
            <>
              <MultiLocationPicker
                className="w-full min-w-0"
                locations={prefs.openToLocations.map(locationFromLabel)}
                onLocationsChange={(next) => {
                  update({
                    onlyWhereYouLive: next.length > 0 ? false : prefs.onlyWhereYouLive,
                    openToLocations: next.map((location) => location.address.formatted),
                  });
                }}
                placeholder="Add a city, state, or country"
                theme={{
                  input: "h-10 w-full min-w-0 bg-background text-foreground shadow-xs",
                  searchButton: "size-10 shrink-0 p-0",
                  locateButton: "size-10 shrink-0 p-0",
                }}
              />
              <ul className="flex flex-wrap items-center gap-1.5">
                {prefs.openToLocations.map((place) => (
                  <li key={place}>
                    <button
                      type="button"
                      className="max-w-full break-words rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                      onClick={() => update({ openToLocations: prefs.openToLocations.filter((p) => p !== place) })}
                      title="Remove"
                    >
                      {place} ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </PreferenceRow>

      <PreferenceRow icon={<Banknote />} label="Minimum pay">
        <Input
          value={prefs.minimumPay}
          onChange={(e) => update({ minimumPay: e.target.value })}
          className="h-10 w-full min-w-0 bg-background shadow-xs md:w-28"
          aria-label="Minimum pay"
        />
      </PreferenceRow>

      <PreferenceRow icon={<Link2 />} label="Links">
        <div className="space-y-2">
          {prefs.links.map((link, index) => {
            const Icon = getLinkIcon(link);
            return (
              <div key={`link-${index}`} className="relative w-full min-w-0">
                <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={link}
                  onChange={(e) => setLinkAt(index, e.target.value)}
                  placeholder="https://"
                  className="h-10 w-full min-w-0 bg-background pl-10 shadow-xs"
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
          <div className="flex min-w-0 items-center gap-2">
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
              className="h-10 w-full min-w-0 flex-1 bg-background shadow-xs"
            />
            <Button type="button" variant="outline" size="icon" className="size-10 shrink-0" onClick={addHidden} aria-label="Hide company">
              <Plus className="size-4" />
            </Button>
          </div>
          {prefs.hiddenCompanies.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {prefs.hiddenCompanies.map((domain) => (
                <li key={domain}>
                  <button
                    type="button"
                    className="max-w-full break-words rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground hover:bg-muted"
                    onClick={() => update({ hiddenCompanies: prefs.hiddenCompanies.filter((d) => d !== domain) })}
                    title="Remove"
                  >
                    {domain} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </PreferenceRow>
    </section>
  );
}
