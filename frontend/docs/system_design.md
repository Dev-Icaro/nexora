# Nexora — Frontend System Design

This document is the authoritative reference for all UI/UX decisions in the Nexora frontend. Every LLM, agent, and developer implementing features must follow these guidelines to produce a consistent, on-brand experience.

---

## 1. Design Philosophy

Nexora is a **dark-first social media platform**. The design language is inspired by modern social apps: deep charcoal surfaces, warm amber/orange brand accents, and clean typographic hierarchy. Key principles:

- **Depth over flatness** — surfaces are layered with slightly different darkness levels, not flat same-color panels.
- **Warmth in accent** — the orange-amber brand color provides energy and personality against the dark canvas.
- **Restraint in decoration** — borders are barely-there (7% white opacity). Let contrast do the work.
- **Content-first** — the UI recedes; user-generated content (posts, avatars, images) is the star.
- **Responsive and accessible** — dark backgrounds with high-contrast text ensure readability. Focus rings use the brand color.

---

## 2. Color System

All colors are defined as CSS custom properties in `src/index.css`. Components must reference semantic tokens, never raw color values.

### 2.1 Semantic Tokens

| Token | Dark Value (oklch) | Light Value (oklch) | Purpose |
|---|---|---|---|
| `--background` | `oklch(0.11 0 0)` | `oklch(0.97 0.005 80)` | Page/app background |
| `--foreground` | `oklch(0.97 0 0)` | `oklch(0.15 0.005 80)` | Primary text |
| `--card` | `oklch(0.16 0 0)` | `oklch(1 0 0)` | Card and panel surfaces |
| `--card-foreground` | `oklch(0.97 0 0)` | `oklch(0.15 0.005 80)` | Text on cards |
| `--popover` | `oklch(0.16 0 0)` | `oklch(1 0 0)` | Dropdowns, tooltips |
| `--primary` | `oklch(0.72 0.17 55)` | `oklch(0.68 0.17 52)` | Brand orange — CTAs, active states |
| `--primary-foreground` | `oklch(0.99 0 0)` | `oklch(0.99 0 0)` | Text on primary buttons |
| `--secondary` | `oklch(0.20 0 0)` | `oklch(0.93 0.005 80)` | Secondary button bg, subtle fills |
| `--muted` | `oklch(0.20 0 0)` | `oklch(0.93 0.005 80)` | Muted backgrounds (inputs, hover bg) |
| `--muted-foreground` | `oklch(0.55 0 0)` | `oklch(0.50 0.005 80)` | Placeholder text, metadata, timestamps |
| `--accent` | `oklch(0.22 0 0)` | `oklch(0.93 0.005 80)` | Hover/active state highlights |
| `--destructive` | `oklch(0.63 0.22 25)` | `oklch(0.58 0.22 25)` | Errors, delete actions, notification badges |
| `--border` | `oklch(1 0 0 / 7%)` | `oklch(0.88 0.005 80)` | Subtle dividers and outlines |
| `--input` | `oklch(1 0 0 / 10%)` | `oklch(0.88 0.005 80)` | Input field backgrounds |
| `--ring` | `oklch(0.72 0.17 55)` | `oklch(0.68 0.17 52)` | Focus ring — matches primary |

### 2.2 Sidebar Tokens

| Token | Dark Value | Purpose |
|---|---|---|
| `--sidebar` | `oklch(0.13 0 0)` | Left navigation panel bg (slightly darker than card) |
| `--sidebar-foreground` | `oklch(0.97 0 0)` | Nav text |
| `--sidebar-primary` | `oklch(0.72 0.17 55)` | Active nav item accent |
| `--sidebar-accent` | `oklch(0.22 0 0)` | Nav item hover bg |
| `--sidebar-border` | `oklch(1 0 0 / 7%)` | Sidebar dividers |

### 2.3 Usage Rules

- **Never use raw hex or rgb() values** — always reference a semantic token via Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.).
- **Layer surfaces correctly** — background < sidebar < card < popover (each step is ~0.03–0.05 lighter in oklch lightness).
- **Use opacity modifiers for borders** — `border-border` renders as the near-invisible border token.
- **The orange accent is never used for large background areas** — only for interactive elements, icons, focus rings, and active states.

---

## 3. Typography

Font: **Geist Variable** (loaded via `@fontsource-variable/geist`). It is a clean, geometric sans-serif that matches the modern dark-UI aesthetic.

### 3.1 Type Scale

| Role | Tailwind Class | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| Display | `text-3xl font-bold` | 30px | 700 | tight | Page titles, empty state headlines |
| Heading 1 | `text-2xl font-semibold` | 24px | 600 | tight | Section headers, profile name |
| Heading 2 | `text-xl font-semibold` | 20px | 600 | snug | Card titles, dialog headings |
| Heading 3 | `text-base font-semibold` | 16px | 600 | normal | Sub-section labels |
| Body | `text-sm` | 14px | 400 | relaxed | Post body text, descriptions |
| Small / Meta | `text-xs text-muted-foreground` | 12px | 400 | normal | Timestamps, counts, locations |
| Label | `text-xs font-medium` | 12px | 500 | normal | Input labels, badge text |

### 3.2 Rules

- **Username/handle**: `font-semibold` on display name, `text-muted-foreground text-xs` on the handle/subtitle.
- **Counts** (followers, likes): `font-bold` with `text-sm` for the number, `text-xs text-muted-foreground` for the label.
- **Post content**: `text-sm leading-relaxed` for readability.
- **Truncation**: Single-line truncation uses `truncate`. Multi-line uses `line-clamp-3`.
- **No underlines on links** by default — use `text-primary hover:underline` only when needed.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Follow Tailwind's default scale. Preferred values for this design:

| Usage | Value |
|---|---|
| Inline icon gap | `gap-2` (8px) |
| Card inner padding | `p-4` (16px) or `p-5` (20px) |
| Section vertical gap | `gap-4` or `gap-6` |
| Sidebar item padding | `px-3 py-2` |
| Between avatar and text | `gap-3` (12px) |
| List item gap | `gap-1` (4px) |

### 4.2 App Layout Pattern

The primary layout is a **3-column fixed sidebar** structure:

```
┌─────────────┬──────────────────────┬─────────────┐
│  Left Nav   │      Main Feed       │  Right Panel│
│  (240px)    │     (flex-grow)      │  (320px)    │
│  sidebar bg │     background bg    │  background │
└─────────────┴──────────────────────┴─────────────┘
```

- Left sidebar: fixed width `w-60`, `bg-sidebar`, full height, no border-right (depth alone separates it).
- Main feed: `flex-1 min-w-0`, centered content with `max-w-2xl mx-auto px-4`.
- Right panel: fixed width `w-80`, hidden on mobile/tablet.

### 4.3 Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| `< md` (768px) | Single column. Both sidebars hidden. Nav in bottom bar or `Sheet`. |
| `md` (768px) | Left sidebar visible. Right panel hidden. |
| `lg` (1024px) | Full 3-column layout. |

---

## 5. Border & Radius

### 5.1 Radius Scale

Configured via `--radius: 1rem` (16px). Tailwind maps to:

| Utility | Value | Usage |
|---|---|---|
| `rounded-sm` | 12px | Small interactive chips |
| `rounded-md` | 14px | Badges, small buttons |
| `rounded-lg` | 16px | Cards, panels, dialogs |
| `rounded-xl` | 20px | Large featured cards |
| `rounded-full` | 9999px | Avatars, pills, notification badges |

### 5.2 Borders

- **Card borders**: `border border-border` — the very subtle 7% white overlay at dark mode creates a glass-like definition.
- **Input borders**: Same — `border border-input` at rest, `ring-2 ring-ring` on focus.
- **No solid decorative borders** — avoid `border-white` or `border-gray-*` raw values.
- **Dividers**: Use `<Separator />` component or `border-t border-border`.

---

## 6. Component Patterns

All base components live in `src/components/ui/` (shadcn/ui). Theme automatically applies via CSS variables.

### 6.1 Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Sizes — use Tailwind size utilities
<Avatar className="size-8">   {/* 32px — list items, comments */}
<Avatar className="size-10">  {/* 40px — sidebar contact list */}
<Avatar className="size-12">  {/* 48px — post header */}
<Avatar className="size-16">  {/* 64px — profile card */}
<Avatar className="size-20">  {/* 80px — large profile */}

// Always provide a fallback with initials
<AvatarFallback className="bg-primary/20 text-primary font-semibold">JC</AvatarFallback>
```

**Story ring**: Active story avatars get `ring-2 ring-primary ring-offset-2 ring-offset-background`.

### 6.2 Card

```tsx
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

// Standard post card
<Card className="bg-card border-border">
  <CardHeader className="p-4 pb-0">...</CardHeader>
  <CardContent className="p-4">...</CardContent>
  <CardFooter className="p-4 pt-0">...</CardFooter>
</Card>
```

- Cards do **not** need `shadow-*` in dark mode — the surface contrast is enough.
- Hover state: `hover:bg-accent/50 transition-colors` for interactive cards.

### 6.3 Badge

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Primary</Badge>         // orange filled
<Badge variant="secondary">General</Badge>       // muted bg
<Badge variant="destructive">13</Badge>          // red — notification count
<Badge variant="outline">design</Badge>          // outline — hashtag style
```

Notification count badge (absolute positioned):
```tsx
<div className="relative">
  <Icon />
  <Badge variant="destructive" className="absolute -top-1 -right-1 size-5 justify-center p-0 text-[10px]">
    13
  </Badge>
</div>
```

### 6.4 Input & Search

```tsx
import { Input } from '@/components/ui/input';

// Standard input
<Input placeholder="What is happening!?" className="bg-muted border-0 rounded-full px-4" />

// Search with icon
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <Input placeholder="Search..." className="pl-9 bg-muted border-0 rounded-full" />
</div>
```

### 6.5 Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

<Tabs defaultValue="primary">
  <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-4 h-auto p-0">
    <TabsTrigger
      value="primary"
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground text-muted-foreground pb-2"
    >
      Primary
    </TabsTrigger>
    <TabsTrigger value="general" ...>General</TabsTrigger>
  </TabsList>
  <TabsContent value="primary">...</TabsContent>
</Tabs>
```

### 6.6 Skeleton (Loading)

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Post card skeleton
<div className="space-y-3">
  <div className="flex items-center gap-3">
    <Skeleton className="size-10 rounded-full" />
    <div className="space-y-1.5">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
  <Skeleton className="h-48 w-full rounded-xl" />
  <Skeleton className="h-3 w-full" />
  <Skeleton className="h-3 w-4/5" />
</div>
```

### 6.7 Dropdown Menu

```tsx
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem>Save post</DropdownMenuItem>
    <DropdownMenuItem className="text-destructive">Report</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

---

## 7. Iconography

Library: **Lucide React** (configured in shadcn). Import directly from `lucide-react`.

### 7.1 Icon Sizes

| Context | Class | Size |
|---|---|---|
| Inline with text | `size-4` | 16px |
| Navigation items | `size-5` | 20px |
| Action buttons | `size-5` | 20px |
| Empty states | `size-12` | 48px |
| Standalone prominent | `size-6` | 24px |

### 7.2 Rules

- Icons in nav items are always paired with a text label on desktop, icon-only on mobile with a `Tooltip`.
- Use `text-muted-foreground` for inactive icons, `text-primary` for active/highlighted icons.
- Never scale icons with raw `w-*`/`h-*` — use `size-*` for consistent square dimensions.

---

## 8. Motion & Animation

Powered by **tw-animate-css** (imported in `index.css`).

### 8.1 Principles

- Transitions should be **fast and subtle** — 150–200ms for hover states, 300ms for panel open/close.
- **Easing**: `ease-out` for elements entering, `ease-in` for elements leaving.
- No bouncy or playful animations on core UI — reserve personality for loading states or empty states.

### 8.2 Standard Utilities

```tsx
// Hover color transitions
className="transition-colors duration-150"

// Hover opacity
className="transition-opacity duration-150"

// Enter/exit for overlays (Dialogs, Sheets use Radix built-in animation)
// tw-animate-css provides: animate-in, animate-out, fade-in, fade-out, slide-in-from-left, etc.

// Example: fade in a popover
className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
```

---

## 9. Dark Mode

The app runs in **dark mode by default**. Apply the `.dark` class to the `<html>` element on mount:

```tsx
// In main.tsx or App.tsx
document.documentElement.classList.add('dark');
```

Future: persist user preference in `localStorage` and respect `prefers-color-scheme`.

- Never hard-code dark-specific styles — always use the CSS variable tokens so light mode works when toggled.
- Test all new components in both `:root` (light) and `.dark` states.

---

## 10. Accessibility

- **Color contrast**: All text on dark backgrounds must meet WCAG AA (4.5:1 for small text). `oklch(0.97 0 0)` on `oklch(0.11 0 0)` exceeds this.
- **Focus rings**: Provided automatically via `outline-ring/50` in `@layer base`. Do not remove `:focus-visible` outlines.
- **Icon-only buttons**: Always wrap in `<Tooltip>` and add `aria-label` to the button.
- **Images**: All `<img>` elements and `<AvatarImage>` must have meaningful `alt` text.
- **Interactive lists**: Use `role="list"` and `role="listitem"` for feed items when appropriate.
- **Reduced motion**: Respect `prefers-reduced-motion` — Radix UI handles this for its components automatically.

---

## 11. File & Component Conventions

- **UI primitives**: `src/components/ui/` — never modified directly unless upgrading shadcn.
- **Feature components**: `src/components/<feature>/` — e.g., `src/components/feed/PostCard.tsx`.
- **Layout components**: `src/components/layout/` — e.g., `Sidebar.tsx`, `AppShell.tsx`.
- **One component per file** — named export matches filename (PascalCase).
- **No default props** — use TypeScript default parameters.
- **No inline styles** — Tailwind utilities only, extended with CSS variables when needed.
