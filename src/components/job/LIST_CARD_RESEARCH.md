# Research & Architecture Proposal: List-Mode Job Card (Jobright Reference Comparison)

> **Document Type:** Research & Architecture Specification  
> **Status:** Completed  
> **Author:** Antigravity Research Sub-agent  
> **Target Files:**
>
> - [`src/components/job/JobBoardListRow.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx)
> - [`src/components/job/contents/ListJobCardContents.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/contents/ListJobCardContents.tsx)
> - [`src/components/job/JobBoardCardSkeleton.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardCardSkeleton.tsx)
> - [`src/components/job/card/CardStats.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/card/CardStats.tsx)
> - [`src/components/job/util/CompanyLogo.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/util/CompanyLogo.tsx)

---

## Executive Summary & Core Intent

This research document compares the current list-mode card implementation in `hiring-cafe-ui` against the high-density Jobright reference layout (`assets/1f15cdf0-155d-4ff9-8b79-e1537cc13c71.png` / attachment `3cfd50c4-ec7c-4166-86e4-e1ee6a854646-cb906543-ded7-4c33-b869-49633b70d550.png`).

### Core Findings

1. **The Scannability Problem:** Our current list card attempts to behave both like a preview snippet (rendering multi-sentence company taglines and 2-line job description summaries) and a list row. Because clicking any card immediately opens the comprehensive detail drawer/dialog, **displaying prose on the card creates visual friction and impedes fast scanning**.
2. **Typography & Badge Contamination:** In our current card, the job title (`<h3>`) is stuffed into an unconstrained flex-wrap row alongside location badges, workplace type badges, commitment badges, and experience badges. Long titles cause badges to wrap irregularly underneath words of the title, destroying visual vertical alignment.
3. **Button & Footer Sprawl:** Our card renders four separate full-text buttons ("Apply Now", "Save", "Company Link", "Hide") next to `CardStats`, taking up ~380px of horizontal space and creating awkward wrap states on narrower screens.
4. **Reference Philosophy (Jobright):** Jobright achieves extreme density **not by cramming more text**, but by **organizing structured facts into predictable visual columns and badge slots**. The candidate's eye lands on the exact same coordinate for _Role_, _Company_, _Location/Workplace_, _Commitment/Level_, and _Compensation_.
5. **Strict Constraint:** We **MUST NOT** copy the Jobright right-hand "STRONG MATCH" / match percentage panel. Omitting that panel provides natural breathing room to keep the card compact, balanced, and responsive.

---

## 1. Side-by-Side Information Hierarchy (Jobright Reference vs. Ours)

| Feature Dimension        | Jobright Reference Card                                                                                                                                                                             | Our Current List Card (`JobBoardListRow.tsx`)                                                                                       | Recommended Target State                                                                                                                                                                                  |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Card Footprint**       | Densely packed single-unit card (~200px height at desktop), clean rounded borders, high scannability.                                                                                               | Variable height (240–310px+), bloated by 2-line summary text and multi-button footer wrapping.                                      | Fixed compact profile (~160–190px desktop). High information density, zero prose.                                                                                                                         |
| **Match / AI Panel**     | Right-hand dark green panel (~160px wide) with "STRONG MATCH", H1B, comp benefits.                                                                                                                  | None (good).                                                                                                                        | **Do NOT implement.** Keep full card width dedicated to structured facts and actions.                                                                                                                     |
| **Company Logo**         | Clean square logo on the left (~50–56px) with rounded corners.                                                                                                                                      | `CompanyLogo size="list"` (56x56px, rounded-[6px]). Good size and fallback initials.                                                | **Keep** `CompanyLogo size="list"`. Anchor it vertically to the primary header area.                                                                                                                      |
| **Top Metadata Badges**  | Horizontal row above title: _"Reposted 20h ago"_, _"Public company"_, _"Early applicant"_.                                                                                                          | Dispersed: `NewBadge` absolute badge on top border, `ScrapeTime` tucked into right-hand header on desktop and duplicated on mobile. | Single cohesive meta row: `NewBadge` (or "New" pill), `ScrapeTime` ("Posted 2d ago"), and stage/type tags.                                                                                                |
| **Job Title**            | **Standalone bold heading** on its own dedicated row. No inline badges polluting the title baseline.                                                                                                | `<h3>` jammed into a `flex flex-wrap` row with 4–5 badges (Location, Workplace, Commitment, YOE).                                   | **Dedicated heading row** (`text-base sm:text-lg font-semibold text-foreground truncate`). No inline badges wrapping into it.                                                                             |
| **Company Line**         | Single line: Company name + separator + brief 1-phrase category (`Salesforce \| AI CRM platform`).                                                                                                  | `{companyName} · {industry} · {tagline}` often outputting 100+ character company mission statements.                                | `{companyName}` in bold/medium, with optional short industry badge or 1-word tag. **No rambling company mission blurbs.**                                                                                 |
| **Key Structured Facts** | **Structured 3-column / grid layout**:<br>• Col 1: Location & Workplace (Pin + City/State, Hybrid)<br>• Col 2: Commitment & Level (Full-time, New Grad)<br>• Col 3: Compensation ($114K - $153K/yr) | Scannable facts scattered between title flex-wrap, top-right header, and bottom duplicate rows.                                     | **Dedicated Attribute Matrix (Row or Grid):**<br>• Location + Workplace (e.g., `San Francisco, CA · Hybrid`)<br>• Type + YOE (e.g., `Full-time · 3+ yrs YOE`)<br>• Compensation Pill (`$114K - $153K/yr`) |
| **Prose / Description**  | **Zero description prose.** No requirements snippet. Card relies on click-to-view details.                                                                                                          | 2-line clamped requirements summary (`requirementsSummary`). High visual weight, low scanning value.                                | **Completely REMOVED.** Clicking card opens full details drawer.                                                                                                                                          |
| **Skills Chips**         | Not in this specific reference view.                                                                                                                                                                | Renders up to 4 skill badges (`secondary`, `text-[10px]`). Essential for tech scanning.                                             | **Keep & Emphasize.** Up to 3–4 compact skill chips placed adjacent to or directly beneath attribute row.                                                                                                 |
| **Multi-role Switching** | Not present in reference.                                                                                                                                                                           | Button pills for sibling jobs (`otherRoles.map(...)`).                                                                              | **Keep** as a clean, compact secondary row when a collection has > 1 role.                                                                                                                                |
| **Activity / Stats**     | Compact metric on bottom-left: _"25+ applicants"_.                                                                                                                                                  | `<CardStats>` showing views, saves, and applies with animated hover tooltips.                                                       | **Keep** `<CardStats>` on bottom-left, styled compactly to match the new grid baseline.                                                                                                                   |
| **Action Buttons**       | Primary _"Apply"_ button + secondary button + overflow _"..."_ icon.                                                                                                                                | 4 full text buttons: _"Apply Now"_, _"Save"_, _"Company Link"_, _"Hide"_. Severe horizontal crowding.                               | **Streamline:**<br>1. Primary **Apply Now** button (`size="sm"`)<br>2. Toggle **Save** button (or icon)<br>3. Compact **More (`...`) Menu** containing _Company Link_ and _Hide_.                         |

---

## 2. What to REMOVE from Our List Card

### A. Remove the Requirements Summary Paragraph

- **Current Code:** [`JobBoardListRow.tsx:228`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L228) and [`ListJobCardContents.tsx:107`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/contents/ListJobCardContents.tsx#L107)
  ```tsx
  {
    summary ? <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary}</p> : null;
  }
  ```
- **Why Remove:** Clicking the card already opens the drawer with full markdown responsibilities and requirements. In list mode, candidates scan 30–50 jobs per minute. Two lines of truncated boilerplate ("Seeking an experienced software engineer to join our dynamic team...") add visual clutter, push down the action row, and degrade scannability.

### B. Remove Verbose Company Mission Blurbs / Taglines

- **Current Code:** [`JobBoardListRow.tsx:211-215`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L211-L215)
  ```tsx
  <p className="truncate text-xs text-muted-foreground sm:text-[0.8125rem]">
    <span className="text-sm font-medium text-foreground/80">{companyName || "Unknown company"}</span>
    {industry ? <span className="text-muted-foreground"> · {industry}</span> : null}
    {tagline ? <span className="text-muted-foreground"> · {tagline}</span> : null}
  </p>
  ```
- **Why Remove:** In Convex data, `tagline` and `description` often contain long paragraph snippets (e.g., aerospace manufacturing descriptions). When chained together with `industry`, it results in an unreadable truncated string. Keep it strictly to the clean `companyName` and optionally a short, formatted industry tag or location HQ.

### C. Remove Inline Badges Wrapped in the Title Container

- **Current Code:** [`JobBoardListRow.tsx:177-204`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L177-L204)
- **Why Remove:** Badges for location, workplace type, commitment, and YOE currently wrap directly beside the `<h3>{title}</h3>`. When the title is long or on responsive breakpoints, badges break onto new lines mid-title, creating a jagged, unaligned visual appearance. These badges belong in a dedicated structured facts row below the title.

### D. Remove Duplicate Responsive Compensation / Time Block

- **Current Code:** [`JobBoardListRow.tsx:230-244`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L230-L244)
- **Why Remove:** Because the current card hides compensation on narrow containers (`@min-[520px]/row:flex`), it duplicates the entire JSX block with `@min-[520px]/row:hidden` lower down. With a proper structured grid layout, compensation has a stable, dedicated slot that naturally reflows without duplicate DOM nodes.

### E. Remove Button Footprint Bloat (4 Full-Text Buttons)

- **Current Code:** [`JobBoardListRow.tsx:294-352`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L294-L352)
- **Why Remove:** Four text buttons ("Apply Now", "Save", "Company Link", "Hide") consume over 380px of width. On mobile or narrow containers, this forces the button group to wrap onto a second line, drastically increasing card height. Consolidating "Company Link" and "Hide" into a standard `DropdownMenu` (three-dots icon `···`) or icon-only buttons saves ~180px of horizontal space.

---

## 3. What to KEEP and EMPHASIZE

1. **Job Title (Clean & Uncluttered):**
   - Give the title its own dedicated line: `font-semibold text-foreground text-base sm:text-lg leading-snug line-clamp-1 hover:text-primary transition-colors`.
2. **Company Identity & High-Res Logo:**
   - Keep `CompanyLogo size="list"` (56x56px, `aspect-square size-14 shrink-0 rounded-[6px]`). It gives strong visual branding on the left edge.
   - Company name rendered in clean `font-medium text-foreground/90 text-sm`.
3. **Compensation (High Visual Priority):**
   - Prominently styled compensation badge/pill (`bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-md text-xs sm:text-sm`). Salary transparency is one of the top two decision drivers.
4. **Structured Location & Workplace Arrangement:**
   - Icon-paired pills or structured text: `<MapPin className="size-3.5" /> {location}` and `{workplaceType}` (`Hybrid` / `Remote` / `On-site`).
5. **Commitment & Seniority / Experience:**
   - Concise badges: `{commitment}` (`Full-time`), `{experience.industryBadge || experience.leadershipBadge}` (`3+ yrs YOE` or `Mid-level`).
6. **Skills Chips:**
   - Keep up to 3–4 skill badges (`variant="secondary"`, `text-[10px] font-normal`). Essential for candidates scanning tech stacks (React, TypeScript, Go, AWS).
7. **Social Proof & Activity Stats (`CardStats`):**
   - Retain views, saves, and applies counters in the bottom-left corner (`viewedCount`, `savedCount`, `appliedCount`).
8. **Multi-Role Collection Pills (`otherRoles`):**
   - Maintain the collection switching buttons when companies post multiple related roles in a single batch.

---

## 4. Concrete Layout Proposal (Without Match %)

### Desktop / Wide Layout Wireframe (~600px+ container)

```text
+-----------------------------------------------------------------------------------------------------------+
| [New Badge]                                                                                               |
|                                                                                                           |
| +-----------+  [Posted 2h ago]  •  [Public Co / Stage]  •  [Early Applicant]                              |
| |           |                                                                                             |
| |  COMPANY  |  Software Engineering AMTS (College Grad)                           $114K/yr - $153K/yr     |
| |   LOGO    |  Salesforce                                                                                 |
| |  (56x56)  |                                                                                             |
| |           |  [Pin] San Francisco, CA (+6 more)  •  [Laptop] Hybrid  •  [Briefcase] Full-time  •  [Cap] New Grad |
| +-----------+                                                                                             |
|                Skills: [TypeScript] [React] [Node.js] [GraphQL]                                           |
|                                                                                                           |
| [Optional: Roles at this company: ( AMTS - Backend ) ( AMTS - Frontend )]                                |
|-----------------------------------------------------------------------------------------------------------|
| (142 views • 18 saves • 6 applies)                                   [ Save ]  [ Apply Now ↗ ]  [ ··· ]   |
+-----------------------------------------------------------------------------------------------------------+
```

### Mobile / Narrow Layout Wireframe (<500px container)

```text
+-------------------------------------------------------------------------------------+
| [New]                                                                               |
| +-------+  Software Engineering AMTS                                                |
| | LOGO  |  Salesforce • [Posted 2h ago]                                             |
| +-------+  $114K/yr - $153K/yr                                                      |
|-------------------------------------------------------------------------------------|
| [Pin] San Francisco, CA (Hybrid)  •  [Briefcase] Full-time  •  [Cap] New Grad        |
| [TypeScript] [React] [Node.js]                                                      |
|-------------------------------------------------------------------------------------|
| (18 saves • 6 applies)                                 [ Save ]  [ Apply Now ↗ ]    |
+-------------------------------------------------------------------------------------+
```

### Detailed Zone Architecture

```
ZONE 1: HEADER & IDENTITY (Top)
├── Column A (Left): CompanyLogo (56x56px, rounded-[6px])
└── Column B (Main):
    ├── Row 1.1: Meta Bar (ScrapeTime "Posted 2h ago", NewBadge, Early applicant badge)
    ├── Row 1.2: Title & Comp Split:
    │   ├── Left: h3 Title (font-semibold, text-base sm:text-lg, truncate)
    │   └── Right: Compensation Badge (bold, emerald/primary tinted pill)
    └── Row 1.3: Company Name (font-medium text-sm text-foreground/80)

ZONE 2: STRUCTURED ATTRIBUTES & SKILLS (Middle)
├── Row 2.1: Scannable Facts Grid/Row:
│   ├── Item 1: Location & Workplace (MapPin icon + "San Francisco, CA" + "Hybrid" badge)
│   ├── Item 2: Commitment & Level (Briefcase icon + "Full-time" + "3+ yrs YOE" badge)
│   └── (Comp pill seamlessly docks here if screen is narrow)
└── Row 2.2: Skills Chips (variant="secondary", compact text-[10px], max 3-4 items)

ZONE 3: MULTI-ROLE SWITCHER (Conditional, when collection.jobs.length > 1)
└── Row 3.1: Compact sibling role pills (h-6 text-xs)

ZONE 4: FOOTER & ACTIONS (Bottom)
├── Left: CardStats (views, saves, applies)
└── Right: Clean Action Group:
    ├── Primary: "Apply Now" Button (bg-primary text-primary-foreground size="sm")
    ├── Secondary: "Save" / Bookmark Icon Button (outline size="sm")
    └── Overflow Menu: "···" DropdownMenu containing "Company Link" and "Hide Job"
```

---

## 5. Ordered Implementation Checklist for Follow-up Coding Agent

### Step 1: Update `src/components/job/JobBoardListRow.tsx`

- [ ] **Remove unused prose fields and states:**
  - Remove `const summary = currentJob.requirementsSummary?.trim() || "";`
  - Remove `const industry = company?.industries?.[0]?.trim() || "";`
  - Remove long `tagline` chaining in the JSX.
- [ ] **Restructure the Header Section (Lines 171–215):**
  - Unbundle the `<h3>` from the inline location/workplace badges.
  - Create a clean 2-column header layout:
    - Left: `<CompanyLogo size="list" />`
    - Right (`min-w-0 flex-1`):
      - Line 1: Meta indicators (`<ScrapeTime />`, `<NewBadge />` or pill)
      - Line 2: Flex row with `<h3>{title}</h3>` (`truncate flex-1`) and `{compensation}` (`shrink-0`)
      - Line 3: Clean company name (`<span className="font-medium text-sm">{companyName}</span>`)
- [ ] **Construct Dedicated Attributes Row (Below Header):**
  - Group structured facts together in a clean flex/grid row:
    - Location badge (`<MapPin className="size-3" /> {locationLabels.join(", ")}`)
    - Workplace badge (`{workplaceType}`)
    - Commitment badge (`{commitment}`)
    - Experience badge (`{experience.industryBadge || experience.leadershipBadge}`)
  - Follow with skills badges (`{skills.map(s => <Badge key={s} variant="secondary">...`)}
- [ ] **Delete Prose and Duplicate Blocks:**
  - Delete `{summary ? <p ...>{summary}</p> : null}` ([`L228`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L228))
  - Delete `@min-[520px]/row:hidden` duplicate compensation & scrape time block ([`L230-244`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L230-L244))
- [ ] **Refactor Footer Action Group (Lines 294–352):**
  - Retain `<CardStats />` on the bottom-left.
  - Replace the 4 wide buttons with:
    1. Primary `Apply Now` button (retaining `Send` icon and click stop-propagation).
    2. Compact `Save` / `Bookmark` button (retaining bookmark toggle and fill state).
    3. `DropdownMenu` with `MoreHorizontal` (`···`) icon trigger containing:
       - DropdownItem: `Company Link` (external link to `companyWebsite`)
       - DropdownItem: `Hide Job` (`EyeOff` icon + `handleHide`)

---

### Step 2: Synchronize `src/components/job/contents/ListJobCardContents.tsx`

- [ ] **Align Tracker List Card with Board List Card:**
  - Remove `{summary ? <p ...>{summary}</p> : null}` ([`L107`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/contents/ListJobCardContents.tsx#L107)).
  - Remove verbose `tagline` ([`L92-95`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/contents/ListJobCardContents.tsx#L92-L95)).
  - Unbundle `<h3>` from the inline location badges ([`L63-82`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/contents/ListJobCardContents.tsx#L63-L82)).
  - Place Location, Workplace, Commitment, and Experience into the dedicated attributes row above skills.

---

### Step 3: Update Skeleton in `src/components/job/JobBoardCardSkeleton.tsx`

- [ ] **Adjust `JobBoardListRowSkeleton`:**
  - Remove the skeleton paragraph block representing the removed 2-line summary.
  - Ensure the skeleton height matches the new compact ~170px card profile:
    - 56px logo skeleton
    - Single-line title skeleton + compensation pill skeleton
    - Structured attribute badge skeletons
    - Skills pill skeletons
    - Stats & action buttons skeleton row

---

### Step 4: Verification & Quality Assurance

- [ ] **Visual inspection in both light and dark themes:** Verify contrast of compensation pill, badges, and logo fallback monogram.
- [ ] **Responsive container-query testing:** Test card behavior at 350px (mobile), 550px (split view/half screen), and 900px+ (full list view).
- [ ] **Click propagation audit:** Confirm clicking anywhere on the card opens job details, while clicking "Apply", "Save", "More Menu", or sibling roles triggers their specific actions without unintentionally opening the drawer.

---

_End of Research Specification._
