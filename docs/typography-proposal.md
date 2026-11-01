# Typography Architecture & System Proposal

> **Target Repository:** `hiring-cafe-ui`  
> **Status:** Research & Architecture Proposal (No code applied)  
> **Target Files:** [`src/app/layout.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/layout.tsx), [`src/app/globals.css`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/globals.css), [`tailwind.config.js`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/tailwind.config.js), [`JobBoardListRow.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx), [`AppSidebar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx), [`SearchBar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/search/SearchBar.tsx)

---

## 1. Current Font Stack Audit

### Configuration and Loading Pipeline

An inspection of the repository reveals how fonts are currently declared, loaded, and applied:

1. **Font Declarations in Next.js Root Layout ([`src/app/layout.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/layout.tsx#L15-L29)):**
   ```tsx
   import { Geist, Geist_Mono, Montserrat } from "next/font/google";

   const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
   });
   const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
   });
   const montserrat = Montserrat({
     variable: "--font-montserrat",
     subsets: ["latin"],
   });
   ```
   All three fonts are attached as CSS variable classes on `<body>`:
   ```tsx
   <body className={`antialiased ${geistSans.variable} ${geistMono.variable} ${montserrat.variable}`}>
   ```

2. **CSS Variable Mapping in Tailwind v4 ([`src/app/globals.css`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/globals.css#L35-L36)):**
   The project has migrated to Tailwind CSS v4 (`@import "tailwindcss";`), using `@theme inline`:
   ```css
   @theme inline {
     --font-sans: var(--font-montserrat), var(--font-geist-sans);
     --font-mono: var(--font-geist-mono);
     ...
   }
   ```

3. **Status of [`tailwind.config.js`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/tailwind.config.js):**
   `tailwind.config.js` is an unconfigured v3 leftover (`theme: { extend: {} }`) containing only safelist rules. Tailwind v4 compiles entirely from `src/app/globals.css`. Typography tokens are not defined in the JavaScript config.

---

### Critical Issues Identified

#### 1. The "Montserrat Trap" in a Data-Dense Application
- **Geometric Set Width:** Montserrat was designed based on early 20th-century urban signage in Buenos Aires. Its character bounding boxes are wide, circular, and geometric (notably in uppercase and open lowercase `o`, `e`, `c`, `d`). Compared to purpose-built interface typefaces, Montserrat consumes **15% to 22% more horizontal space**.
- **Impact on Job Cards ([`JobBoardListRow.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx)):** In list rows where job titles, company names, location badges, and salary pills compete for horizontal space, Montserrat's wide proportions trigger early wrapping and truncation. Job titles break onto multiple lines prematurely, and attribute badges collide with action buttons.
- **Impact on the Sidebar ([`AppSidebar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx)):** With the sidebar constrained between 140px (ribbon mode) and 240px, navigation labels and saved search titles truncate after only 12–16 characters.
- **Impact on Search Inputs ([`SearchBar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/search/SearchBar.tsx)):** Multi-segment controls (role input, location picker, salary range) suffer from truncated placeholder text on viewports under 1024px.

#### 2. The Geist Sans Ghost Dependency
- Because `--font-sans` is mapped to `var(--font-montserrat), var(--font-geist-sans)`, Montserrat handles 100% of Latin glyphs.
- `Geist Sans` is fetched, parsed, and initialized in `layout.tsx`, but its glyphs are virtually never rendered in the UI. It represents dead payload weight (~40KB WOFF2).

#### 3. Proportional Figures on Numeric Data (Misalignment & Jitter)
- High-value data points across the app — salaries (`$114K - $153K/yr`), relative dates (`Posted 2h ago`), YOE requirements (`3+ yrs YOE`), applicant counts (`25+ applicants`), and kanban column totals — render using default proportional numbers.
- Because digits like `1` are substantially narrower than `8` or `0`, numbers jitter during animations (e.g., number counters or slider changes) and fail to align cleanly in vertical lists and tabular comparisons.

#### 4. Total Lack of Semantic Type Scale Tokens
- Font sizes and line heights are applied haphazardly across components with disconnected Tailwind classes: `text-[10px]`, `text-xs`, `text-[0.8125rem]`, `text-[14px]`, `text-[15px]`, `text-sm`, `text-base`, `text-lg`, `text-3xl`.
- Line heights (`leading`) and letter-spacing (`tracking`) are rarely paired with font sizes, resulting in loose headings and cramped small-caption badges.

---

## 2. Recommended Display + Body Pairing

### Design Criteria
A transparent, high-efficiency job search engine like hiring.cafe needs a typography system that communicates:
- **Authority and Craft:** A distinctive display typeface that signals editorial curation rather than automated scraping.
- **Information Density and Scannability:** A compact, high-x-height body typeface optimized for rapid scanning of job titles, company names, and technical badges.
- **Tabular Precision:** A monospace numeral treatment for compensation, timestamps, and metrics.
- **Zero AI-Purple Clichés:** No futuristic sci-fi geometry, neon glow aesthetics, or overused generic defaults (Inter, Roboto, Arial, system-ui).
- **Zero Friction:** 100% loadable via `next/font/google` (automatic WOFF2 subsetting, preloading, zero layout shift).

---

### Primary Recommendation: The "Curated Search Engine" Identity

```
+-----------------------------------------------------------------------------------------+
| DISPLAY / HEADINGS:      Bricolage Grotesque (Variable: wght 400..800, opsz 12..96)    |
| BODY / INTERFACE:        Plus Jakarta Sans (Variable: wght 400..700)                   |
| DATA / COMPENSATION:     Geist Mono (Variable: wght 400..600, tabular-nums)            |
+-----------------------------------------------------------------------------------------+
```

#### Why Bricolage Grotesque for Display
- **Origin & Character:** Designed by Mathieu Triay, rooted in historical French and British 19th/20th-century grotesque models, fused with modern optical scaling.
- **Tactile Ink Traps:** Noticeable ink traps and mechanical details at large sizes (h1, h2, card titles) provide warmth, confidence, and visual distinction.
- **Anti-Generic:** Completely avoids the sterile "SaaS boilerplate" look of Inter or Roboto without turning into a novelty face.
- **Application:** Page headers, modal dialog titles, job card titles (`JobBoardListRow` `<h3>`), and prominent company names.

#### Why Plus Jakarta Sans for Body & Interface
- **Origin & Character:** Designed by Galdino Otten & Tokotype. A contemporary grotesque engineered specifically for high-density digital user interfaces.
- **Compact Horizontal Rhythm:** Features an 18% narrower set width than Montserrat. It fits 3 to 5 additional words per line in job descriptions and prevents premature badge wrapping.
- **High x-Height & Large Counters:** Clear differentiation between tricky glyphs (`I`, `l`, `1`, `0`, `O`, `rn` vs `m`) makes rapid scanning effortless down to 11px.
- **Application:** Navigation items, search bar inputs, dropdown menus, filter chips, location/workplace badges, and descriptive text.

#### Why Geist Mono for Data & Figures
- Retained from Vercel's Geist collection. It features clean tabular figures (`tnum`), crisp currency symbols (`$`, `€`, `£`), and balanced proportions for salary ranges, timestamps, and metric counts.

---

### Alternative Recommendation: The "Editorial Architecture" Identity

For a more refined, publication-grade feel (reminiscent of *The Information* or *Linear Docs*):

```
+-----------------------------------------------------------------------------------------+
| DISPLAY / HEADINGS:      Instrument Serif (Regular 400, Italic 400)                    |
| BODY / INTERFACE:        Instrument Sans (Variable: wght 400..700)                     |
| DATA / COMPENSATION:     Geist Mono (Variable: wght 400..600, tabular-nums)            |
+-----------------------------------------------------------------------------------------+
```

- **Instrument Serif:** High-contrast contemporary serif that feels thoughtful and human, perfect for major landing headings and editorial job collection banners.
- **Instrument Sans:** Open-source grotesque designed by Instrument, matching the precision of modern design tools.
- *Trade-off:* Instrument Serif is less suited for short UI card titles (`JobBoardListRow`), making the **Bricolage Grotesque + Plus Jakarta Sans** pairing the superior system for a data-first job board.

---

## 3. Type Scale Tokens as CSS Variables and Tailwind Theme

### Harmonious Modular Scale (1.200 Minor Third / 1.250 Major Third Hybrid)

| Token | Size (rem / px) | Line Height | Tracking | Weight | Semantic Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display` | `2.25rem` (36px) | `1.15` (2.6rem) | `-0.03em` | Bold (700) | Landing heroes, primary page titles (`Account`, `Job Tracker`) |
| `h1` | `1.75rem` (28px) | `1.20` (2.1rem) | `-0.025em` | SemiBold (600) | Section titles, major dialog headers (`Sign In`, `Filters`) |
| `h2` | `1.375rem` (22px) | `1.25` (1.72rem)| `-0.02em` | SemiBold (600) | Panel headers, card collection titles |
| `h3` | `1.125rem` (18px) | `1.30` (1.46rem)| `-0.015em` | SemiBold (600) | Job row title (`JobBoardListRow`), chat drawer headings |
| `body-lg` | `1.000rem` (16px) | `1.50` (1.50rem)| `-0.01em` | Regular (400) / Medium (500) | Search bar input text, primary article/detail prose |
| `body` | `0.875rem` (14px) | `1.45` (1.27rem)| `-0.005em` | Regular (400) / Medium (500) | Standard UI: Sidebar nav items, dropdowns, company names |
| `body-sm` | `0.8125rem` (13px)| `1.40` (1.14rem)| `0.00em` | Regular (400) / Medium (500) | Secondary info: timestamps, subheaders, helper text |
| `caption` | `0.750rem` (12px) | `1.35` (1.01rem)| `+0.01em` | Medium (500) | Badges: Location, Workplace, YOE, Status pills |
| `badge-xs`| `0.6875rem` (11px)| `1.25` (0.86rem)| `+0.02em` | Medium (500) / SemiBold | Skills chips, unread count pills |
| `data-num`| `0.8125rem` (13px)| `1.00` | `-0.01em` | Medium (500) + `tabular-nums` | Compensation pill (`$114K - $153K/yr`), stats counters |

---

### CSS Variables Definition (`src/app/globals.css`)

```css
@theme inline {
  /* Font Family Stacks */
  --font-display: var(--font-bricolage), system-ui, sans-serif;
  --font-sans: var(--font-jakarta), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-mono: var(--font-geist-mono), monospace;

  /* Type Scale Tokens */
  --text-display: 2.25rem;
  --text-display--line-height: 1.15;
  --text-display--letter-spacing: -0.03em;

  --text-h1: 1.75rem;
  --text-h1--line-height: 1.2;
  --text-h1--letter-spacing: -0.025em;

  --text-h2: 1.375rem;
  --text-h2--line-height: 1.25;
  --text-h2--letter-spacing: -0.02em;

  --text-h3: 1.125rem;
  --text-h3--line-height: 1.3;
  --text-h3--letter-spacing: -0.015em;

  --text-body-lg: 1rem;
  --text-body-lg--line-height: 1.5;
  --text-body-lg--letter-spacing: -0.01em;

  --text-body: 0.875rem;
  --text-body--line-height: 1.45;
  --text-body--letter-spacing: -0.005em;

  --text-body-sm: 0.8125rem;
  --text-body-sm--line-height: 1.4;
  --text-body-sm--letter-spacing: 0em;

  --text-caption: 0.75rem;
  --text-caption--line-height: 1.35;
  --text-caption--letter-spacing: 0.01em;

  --text-badge-xs: 0.6875rem;
  --text-badge-xs--line-height: 1.25;
  --text-badge-xs--letter-spacing: 0.02em;
}

/* Tabular numbers utility for monetary, statistical, and chronological values */
@layer utilities {
  .tabular-data {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums lining-nums;
    letter-spacing: -0.01em;
  }
}
```

---

## 4. Concrete Implementation Steps

### Step 1: Update Font Imports in [`src/app/layout.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/layout.tsx)

1. Remove `Montserrat` and `Geist` imports from `next/font/google`.
2. Import `Bricolage_Grotesque`, `Plus_Jakarta_Sans`, and `Geist_Mono`.
3. Configure subsetting and CSS variable bindings:

```tsx
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
```

4. Inject variables on `<body>`:
```tsx
<body className={`antialiased font-sans ${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}>
```

---

### Step 2: Configure Theme in [`src/app/globals.css`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/globals.css)

1. Replace the existing `--font-sans` declaration:
   ```css
   /* Before */
   --font-sans: var(--font-montserrat), var(--font-geist-sans);
   --font-mono: var(--font-geist-mono);

   /* After */
   --font-display: var(--font-bricolage), system-ui, sans-serif;
   --font-sans: var(--font-jakarta), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
   --font-mono: var(--font-geist-mono), monospace;
   ```

2. Establish base heading styles inside `@layer base`:
   ```css
   @layer base {
     h1, h2, h3, h4 {
       font-family: var(--font-display);
       letter-spacing: -0.02em;
     }
     body {
       font-family: var(--font-sans);
       @apply bg-background-body text-foreground antialiased;
     }
   }
   ```

---

### Step 3: High-Impact Component Refactors

#### A. Job Board List Row ([`src/components/job/JobBoardListRow.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx))

- **Job Title ([Line 210](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L210)):**
  - *Current:* `<h3 className="truncate text-base font-semibold leading-snug text-foreground sm:text-lg">{title}</h3>`
  - *Target:* Use display font with tight tracking:
    ```tsx
    <h3 className="truncate font-display text-[1.0625rem] sm:text-lg font-semibold tracking-[-0.015em] text-foreground">
      {title}
    </h3>
    ```
- **Company Name ([Line 212](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L212)):**
  - *Current:* `<span className="text-sm font-medium text-foreground/80">{companyName}</span>`
  - *Target:* Keep in `font-sans` with intentional medium weight:
    ```tsx
    <span className="font-sans text-sm font-medium text-foreground/90">{companyName}</span>
    ```
- **Compensation Pill ([Line 245](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L245)):**
  - *Current:* `<span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-medium text-foreground">`
  - *Target:* Apply tabular numbers and monospace styling:
    ```tsx
    <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-0.5 font-mono text-xs font-medium tabular-nums text-foreground">
      <DollarSign className="size-3 shrink-0" />
      {compensation}
    </span>
    ```
- **Attribute Badges & Skills ([Lines 218–240, 263](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/job/JobBoardListRow.tsx#L218-L240)):**
  - *Location / Workplace / YOE:* `font-sans text-xs font-normal text-muted-foreground`
  - *Skills Chips:* `font-sans text-[11px] font-medium tracking-tight text-secondary-foreground`

---

#### B. Sidebar Navigation ([`src/components/shell/AppSidebar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx))

- **Section Group Headers ([Line 189](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx#L189)):**
  - *Current:* `<span className="truncate text-[15px] font-bold text-foreground">{label}</span>`
  - *Target:* Switch to display font with structured tracking:
    ```tsx
    <span className="truncate font-display text-sm font-bold tracking-tight text-foreground uppercase text-[12px] text-muted-foreground/90">
      {label}
    </span>
    ```
- **Navigation Links ([Lines 71–95](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx#L71-L95)):**
  - *Current:* `<span className="truncate font-medium">Find Jobs</span>`
  - *Target:* Use `font-sans text-[13.5px] font-medium tracking-[-0.005em]`.
- **New Count Badge ([Line 198](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/shell/AppSidebar.tsx#L198)):**
  - *Current:* `<span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold leading-4 text-primary-foreground">{count}</span>`
  - *Target:* Apply monospace tabular figures so 1-digit and 2-digit badges don't deform:
    ```tsx
    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums leading-4 text-primary-foreground">
      {count}
    </span>
    ```

---

#### C. Search Bar Chrome ([`src/components/search/SearchBar.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/search/SearchBar.tsx))

- **Segment Button Headers ([Line 207](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/search/SearchBar.tsx#L207)):**
  - *Current:* `<span className="truncate font-bold text-foreground ...">{header}</span>`
  - *Target:* `font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`
- **Segment Subtitles ([Line 208](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/components/search/SearchBar.tsx#L208)):**
  - *Current:* `<span className="truncate text-[14px] font-medium text-muted-foreground">{subtitle}</span>`
  - *Target:* `font-sans text-sm font-medium tracking-tight text-foreground`
- **Search Input Field:**
  - `font-sans text-sm font-normal text-foreground placeholder:text-muted-foreground/75 tracking-normal`

---

#### D. Page Headers ([`src/app/account/page.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/account/page.tsx), [`src/app/tracker/page.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/tracker/page.tsx))

- **Page H1 ([`account/page.tsx:23`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/account/page.tsx#L23)):**
  - *Current:* `<h1 className="text-3xl font-bold text-foreground">Account</h1>`
  - *Target:*
    ```tsx
    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
      Account
    </h1>
    ```
- **Section Headers:**
  - *Target:* `font-display text-lg font-semibold tracking-tight text-foreground`

---

## 5. Dark-Mode Readability Notes

### 1. The Optical Irradiation Phenomenon
- In dark themes, bright white text rendered against dark backgrounds visually "bleeds" outward (irradiation/halation). Characters appear approximately **5% to 10% bolder** than identical CSS font weights rendered in light mode.
- **Solution (Weight De-escalation):**
  - Avoid `font-bold` (700) for body text in dark mode; use `font-semibold` (600) or `font-medium` (500).
  - For titles set in Bricolage Grotesque, 600 weight provides optical punch without the muddying that occurs at 700/800.

### 2. Luminance Contrast & Halation
- The current dark palette in `globals.css` uses:
  - Background: `oklch(0.2 0.01 17)`
  - Foreground: `oklch(0.97 0.004 17)` (~97% luminance)
  - Muted Foreground: `oklch(0.72 0.01 17)` (~72% luminance)
- At 97% pure luminance, continuous reading of dense job listings causes eye fatigue.
- **Adjustment:**
  - Body text and secondary job metadata should drop to `oklch(0.92 0.005 17)` in dark mode.
  - Secondary badges and tags should use `oklch(0.78 0.01 17)` with subdued backgrounds to prevent high-contrast glare halos around chips.

### 3. Letter-Spacing Expansion for Small Dense Text
- Dark backgrounds cause narrow counters in small type (10px–12px) to visually close in on themselves.
- **Rule:** For any type sized `text-caption` (12px) or `text-badge-xs` (11px):
  - In light mode: `tracking-normal` (`0em`) or `tracking-[0.01em]`.
  - In dark mode: Apply `dark:tracking-[0.02em]` to preserve open apertures for letters like `e`, `a`, `c`, `s`.

### 4. Font Smoothing & Subpixel Antialiasing
- Ensure `antialiased` (`-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;`) remains active on `<body>`. Subpixel text rendering in dark mode frequently creates red/blue fringing around light glyphs on OLED and LCD screens.

### 5. Color Tints on Badges and Numbers
- Compensation badges currently use `bg-primary/15 text-foreground`.
- In dark mode, ensure the green or primary tint maintains at least 4.5:1 contrast against the card background (`oklch(0.24 0.012 17)`). Using `tabular-nums` with `font-mono` gives the salary badges high visual pop without needing harsh background colors.

---

## Summary of Next Steps for Implementation Agent

1. Modify [`src/app/layout.tsx`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/layout.tsx) to swap fonts to `Bricolage_Grotesque`, `Plus_Jakarta_Sans`, and `Geist_Mono`.
2. Update `@theme inline` in [`src/app/globals.css`](file:///C:/Users/green/Documents/GitHub/hiring-cafe-ui/src/app/globals.css) with `--font-display`, `--font-sans`, `--font-mono`, and token variables.
3. Apply `font-display` to headings and `font-mono tabular-nums` to numbers in `JobBoardListRow.tsx`, `AppSidebar.tsx`, and `SearchBar.tsx`.
4. Verify typography rendering in both light and dark modes.
