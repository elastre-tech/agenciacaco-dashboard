# Dashboard Político 360 — Project Context

## Overview
White-label political campaign intelligence platform for CaCo Casa de Comunicação.
Two layers: Agency Panel (manages all workspaces) + Client Workspaces (9 operational modules each).

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Auth + PostgreSQL + Realtime + Storage + Edge Functions)
- Recharts (charts), Mapbox GL JS (maps), Lucide React (icons)
- Date-fns, Zustand (state), Zod (validation)

## Brand Identity (CaCo — default whitelabel theme)
- Primary: #FFD100 (yellow)
- Secondary: #1A1A1A (black)
- Background: #F8F8F6 (warm off-white)
- Surface: #FFFFFF
- Border: #E8E8E8
- Success: #22C55E | Warning: #F59E0B | Danger: #EF4444 | Info: #3B82F6
- Fonts: Plus Jakarta Sans (headings), DM Sans (body), JetBrains Mono (KPIs/numbers)

## Architecture

### Agency Panel (/agency)
- Dashboard: consolidated KPIs across all workspaces
- Workspaces: CRUD + creation wizard (7 steps)
- Team: manage agency members
- Settings: whitelabel config (logo, colors, fonts, domain)
- Integrations: guided setup per workspace

### Workspace (/w/[workspaceId])
9 modules:
1. Painel Geral 360 (/dashboard) — KPIs, budget distribution, intelligence alerts
2. Análise Territorial (/territory) — heatmap, QR codes, temporal density
3. Mobilização e CRM (/mobilization) — leads (hot/warm/cold), funnel, WhatsApp metrics
4. Eficiência e Finanças (/finance) — waste detector, reallocation simulator, CPL trends
5. Relatórios e Exportação (/reports) — generate PDF and Excel
6. Social Listening (/listening) — emerging terms, narratives, sentiment
7. Inteligência Competitiva (/competitors) — share of voice, digital dominance
8. Radar de Risco e Crise (/risk) — reputation thermometer, attack timeline, alerts
9. Histórico Eleitoral (/history) — past election results by municipality/zone/section, heatmap by region, cycle comparison (e.g. 2020 vs 2024). Data source: TSE open data (dadosabertos.tse.jus.br), free. ETL into Supabase, visualized with Mapbox.

### Roles
- agency_owner, agency_admin (agency-level)
- campaign_coordinator, intelligence_analyst, performance_manager, field_mobilizer (workspace-level)

## Data Strategy
NO external API connections yet. The platform runs on realistic seed data for a fictional campaign. Integrations (Meta Ads, Google Ads, WhatsApp) are architecturally prepared but not connected.

## Design Philosophy — MANDATORY RULES

YOU ARE NOT A LAYOUT GENERATOR. YOU ARE A SENIOR HUMAN DESIGNER.

### Non-Negotiable Principles
1. AVOID PERFECT SYMMETRY — prefer subtle, intentional asymmetries
2. AVOID OBVIOUS GRIDS — allow subtle rhythm breaks
3. AVOID GENERIC HIERARCHY — vary visual rhythm across sections
4. AVOID "TOO CLEAN" AESTHETICS — controlled friction is desirable

### Explicitly Forbidden Patterns
- Identical cards repeated endlessly with same heights
- Generic decorative icons used as filler
- Cliché hero sections with oversized CTAs
- Over-explanatory text and unnecessary animations
- If it feels "nice, correct, and forgettable" → redo it

### Typography Rules
- Contrast through WEIGHT and SPACE, not color
- Few sizes, used with intention
- Typographic silence where appropriate
- Never justify text

### Interaction Rules
- Nothing moves without a reason
- Nothing appears without user intent
- Hover, focus, click states must be subtle, clear, and human
- If an interaction doesn't improve understanding, remove it

### Mobile-First (Non-Theoretical)
- Mobile is the primary design, not an adaptation
- No double scroll, long modals, or cramped text

### The Final Test
"Does this feel like something someone would DEFEND out loud? Or does it feel like something that merely passed a checklist?"

## Code Quality Standards

### NEVER do:
- Unicode separator comments (══, ──, ━━)
- Block separators (====, ----)
- Numbered step comments (// 1. Do this, // 2. Do that)
- Obvious comments (// Create client, // Return response)
- console.log for debugging (only console.error in catch blocks)
- Inline mock data in component files (use dedicated seed/demo files)
- Inline SVGs when Lucide React has the icon
- Mixed naming conventions (pick one and stick to it)

### ALWAYS do:
- One component per file, one clear responsibility
- Comments explain WHY, never WHAT
- Consistent error handling with try/catch
- Environment variables for all URLs and keys
- TypeScript strict mode, no `any` types
- Files under 300 lines (split if bigger)

### File Naming
- Components: PascalCase (KPICard.tsx)
- Utilities/hooks: camelCase (useWorkspace.ts)
- Pages: page.tsx (Next.js convention)
- Constants/config: camelCase (permissions.ts)

## Component Patterns

### KPI Cards
- White background, border-radius 12px, shadow: 0 1px 3px rgba(0,0,0,0.08)
- Value in JetBrains Mono, bold, text-3xl
- Label in DM Sans, text-sm, color dark-300
- Trend badge: pill with arrow + percentage, green (up) or red (down)

### Sidebar
- Background: dark-700 (#1A1A1A)
- Agency logo top, workspace selector below
- Nav items: dark-200 text, hover → dark-600 bg, active → primary color + left bar 3px
- Icons: Lucide React, 18px

### Charts (Recharts)
- Container: white card with shadow
- Grid lines: nearly invisible (dark-50)
- Tooltips: dark-700 bg, white text, border-radius 8px
- Animations: easeInOut, 300ms
- Colors follow semantic palette (info blue, success green, etc)

### Tables
- Header: background-50, text-xs uppercase, dark-300
- Rows: alternating white/dark-50, hover → primary-50
- Padding: 12px 16px

### Buttons
- Primary: bg primary (#FFD100), text dark, hover darken 10%
- Secondary: bg dark-700, text white
- Outline: border dark-200, hover bg dark-50
- Border-radius: 8px, padding: 10px 20px
