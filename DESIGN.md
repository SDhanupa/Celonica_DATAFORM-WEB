---
name: Ceylonica management
description: Scoped Ceylonica workspace for review queues, data collections, tools, and administrator accounts.
colors:
  primary: "#087f5b"
  primary-dark: "#066447"
  primary-light: "#e6f3ec"
  canvas: "#f3f4f2"
  surface: "#ffffff"
  text: "#202923"
  text-muted: "#606b64"
  divider: "#e9ede9"
  input-border: "#dce3dd"
  table-head: "#fafbf9"
  nav-hover: "#edf4ee"
  role-super: "#176247"
  role-super-bg: "#e9f4ed"
  role-admin: "#315b79"
  role-admin-bg: "#eaf1f6"
  role-moderator: "#815e19"
  role-moderator-bg: "#f8f2e2"
typography:
  headline:
    fontFamily: "'DM Sans', 'Noto Sans Sinhala', 'Noto Sans Tamil', sans-serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)"
    fontWeight: 500
    letterSpacing: "-0.035em"
  title:
    fontSize: "1.15rem"
    fontWeight: 600
  body:
    fontSize: "0.9375rem"
    fontWeight: 400
  body-small:
    fontSize: "0.875rem"
    fontWeight: 400
  table-label:
    fontSize: "12px"
    fontWeight: 500
rounded:
  input: "12px"
  nav-item: "14px"
  paper: "16px"
  dialog: "20px"
  panel: "24px"
  topbar: "32px"
spacing:
  compact: "8px"
  small: "12px"
  medium: "16px"
  panel: "24px"
  wide: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
  input:
    textColor: "{colors.text}"
    rounded: "{rounded.input}"
  navigation-selected:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.nav-item}"
  chip-super:
    backgroundColor: "{colors.role-super-bg}"
    textColor: "{colors.role-super}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "24px"
---

# Design System: Ceylonica management

## Overview

**Creative North Star: "Rounded management workspace"**

This document records the implemented management interface: white rounded surfaces, a pale gray canvas, emerald actions, and compact navigation. Its scope is AdminLayout and the workspace overview, tool catalogue, data collections, Location API, and administrator directory. The public site retains its incumbent theme.

The supplied visual reference establishes the direction. The source remains authoritative for exact tokens and behavior; product facts and delivery constraints live in PRODUCT.md.

**Key Characteristics:**

- White rounded surfaces on a pale gray canvas.
- Emerald actions and selected navigation.
- Compact navigation with responsive workspace and directory views.

## Colors

### Primary

Emerald marks the primary action, selected navigation, and featured GN-division and total-administrator summaries. Deep emerald supplies the selected-navigation hover state. The light emerald token is available from the scoped theme.

### Neutral

The pale canvas separates white surfaces. Dark green-gray carries content; muted green-gray carries secondary copy and input placeholders. Placeholders use full opacity (`1`) in AdminLayout. Light neutral borders separate fields, rows, and navigation groups.

### Semantic role accents

Super Admin uses green, Admin uses blue, and Moderator uses ochre, each with a pale companion background. Keep role labels and status text visible alongside color. These are account classifications, not additional brand palettes.

**The Scope Rule.** Apply these emerald tokens inside AdminLayout; preserve the public theme in frontend/src/theme/theme.ts.

## Typography

The inherited stack is DM Sans, Noto Sans Sinhala, Noto Sans Tamil, then sans-serif. The page headline uses the responsive headline token; section headings use title. Body and body-small support explanatory text and directory names. Table labels use the compact table-label token.

Account-summary values use tabular numerals, weight 500, line height 1.15, and sizes of 32px below `sm` and 40px from `sm`. Workspace overview values use tabular numerals, weight 500, and sizes of 28px below `sm` and 36px from `sm`. Navigation labels use 13px, weight 400 normally and 600 when selected. Buttons inherit the base component override's weight 700 and sentence case. The existing GlobalSearchBar retains its own Inter typography and result colors.

## Layout

The MUI spacing unit is 8px. AdminLayout has 12px outer padding below `md` and 24px from `md`; main content has a 1600px maximum width. Content starts 24px below the top bar on small screens and 32px from `md`. Sidebar-to-content gap is 24px at `md` and 32px at `lg`.

At `md` (900px), the sticky desktop sidebar appears, initially 64px wide and expandable to 248px. It sits 112px from the viewport top with its own scroll area. Below `md`, a menu control opens a 288px drawer. Navigation items have a 44px minimum height.

In the account view, below `sm` (600px), the top-bar search wraps onto a full-width second row, summaries stack as compact horizontal cards, and administrator records become cards with wrapping email addresses. At `sm`, summaries form three columns and the directory uses a horizontally scrollable table with a 710px minimum width. Search and role filters wrap as needed.

At 1350px, the directory gains a 260px side column. Below that width the supporting cards sit beneath it, in two columns from `sm` and one below. `lg` is 1200px. These breakpoints are inherited MUI defaults except the explicit 1350px directory threshold.

Workspace section tabs use URL views and scroll controls, including on mobile. Overview totals form two columns below `lg` and four from `lg`; review and access panels stack below `lg` and split 1.2:1 above. Common tasks use one column below `md` and three from `md`. Tool groups use one column below `lg` and two from `lg`, with wrapping filter/tag chips. Collection rows stack their title above counts on narrow screens and use a four-column grid from `md`.

Location API extends the same scoped system: 24px rounded panels with 16px padding below `md` and 24px above; project-access and preview panels stack below `lg` and split 1.2:1 from `lg`. Fields and key controls wrap; coordinate inputs stack below `sm`. JSON/request examples scroll within their panels, and preview output is capped at 380px high. The fifth workspace tab uses the existing mobile scroll controls.

## Elevation & Depth

The workspace-summary, directory, and their supporting Paper panels use zero elevation; tonal separation carries their structure. The top bar retains the base AppBar shadow (`0 4px 18px rgba(23, 43, 58, 0.09)`) and the drawer retains its base side shadow. Existing menus and dialogs keep their overlay elevation. Location API panels retain the inherited Paper elevation. Do not generalize these panels into a globally shadowless theme.

Admin buttons explicitly remove shadows, while retaining the base hover translation (`translateY(-1px)`) and 160ms ease transition for transform, shadow, and background color. Account-menu transitions remain 200ms ease.

## Shapes

Use the frontmatter's radii by component: fields, navigation items, generic rounded Paper, dialogs, page panels/buttons, and top bar. The directory table clips within its rounded panel. Circular avatars and small status dots remain distinct from the rounded rectangular panels.

## Components

- **Primary action:** filled emerald, white label, 40px minimum height; Add Admin opens registration. Pending mutations disable relevant controls.
- **Fields:** outlined with the input-border token. AdminLayout supplies an emerald caret and a 2px emerald keyboard-focus outline offset 3px. Placeholders use text-muted at full opacity.
- **Navigation:** nine core destinations for super admins and a searchable, role-filtered catalogue of 23 tools in six groups; emerald selected state, deep emerald selected hover, and a pale neutral-green hover for other items. Collapsed items retain tooltips and accessible labels.
- **Role chips:** compact labeled chips distinguish Super Admin, Admin, and Moderator. Account state remains separate text, with a status dot in the table.
- **Summary cards:** overview shows current GN, category, question, and industry-survey totals; accounts retain the emerald total and white active/inactive cards. Queue and collection counts come from the aggregate endpoint; account counts and role shares derive from fetched administrators. Unknown values show an em dash and zero remains a meaningful empty count. Refresh errors preserve and explicitly label the previous summary.
- **Tool catalogue:** search names, descriptions, tags, and groups; filter with labeled chips and recover from no matches with Clear filters. Placeholder modules appear in an Unavailable modules disclosure, with their underlying routes preserved.
- **Data collections:** search by name/slug and filter by records, review needs, or empty status. Open records links retain the category query parameter; unavailable category links are labeled.
- **Directory:** search by name/email, role filter, status tabs, refresh, editable roles, and activation controls. Preserve progress, load-error/retry, mutation feedback, and empty-filter recovery.
- **Dialogs:** registration and role editing preserve existing fields, required-value checks, GraphQL mutations, and disabled saving states.

- **Location API:** reuse existing outlined fields, emerald actions, status chips, alerts, and dialogs. Project keys display prefix, expiry, state, and usage; creation reveals a one-time secret with reveal/copy controls, and revocation requires confirmation. The expiry selector defaults to 30 days and offers explicit Never expires, 7, 30, and 90 days. Active keys expose Change expiry in the same wrapping action row; its existing-style dialog preserves the secret, explains the effect of permanent access, and retains pending/error states. Expired or revoked keys cannot use that action. GN/coordinate previews retain pending, error, and scrollable-response states. This is an extension of the existing system, with no new design tokens.

Implementation sources: `frontend/src/theme/adminTheme.ts`, `frontend/src/theme/theme.ts`, `frontend/src/components/AdminLayout.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `frontend/src/pages/AdminsPage.tsx`, `frontend/src/pages/AdminWorkspacePage.tsx`, `frontend/src/config/adminTools.ts`, and `frontend/src/pages/LocationApiPage.tsx`.

## Do's and Don'ts

### Do:

- Do keep the emerald theme scoped to AdminLayout.
- Do use returned aggregates for workspace summaries and returned administrator records for account counts and role shares.
- Do retain visible keyboard focus, readable placeholders, and text labels for status.

### Don't:

- Don't replace the incumbent public theme with these management tokens.
- Don't present fabricated trends, counts, or notifications as account data.
- Don't remove role checks or change authentication and mutation contracts for visual consistency.
