# Crafted Edge — Design System (Single Source of Truth)

`crafted-edge-tokens.css` is the **canonical** set of brand design tokens for everything Crafted Edge: this corporate site, the portfolio, and products (Risiti, Wellness, CV suite).

## How it works (and why it's safe to adopt)

- All variables are **namespaced `--ce-*`** so this file can be dropped into any repo **without colliding** with that repo's existing CSS variables. Loading it changes nothing on its own.
- **Adopt gradually:** load this file first, then migrate rules to reference `--ce-*`, preview the deploy, and only then delete the local duplicate tokens. Nothing breaks in one step.
- Each surface sets its own `--ce-accent` + display font (corporate amber `#e89240` / Instrument Serif; portfolio orange `#ff5c00` / Syne) while sharing the same primitives, scale, and **JetBrains Mono**.

## Rollout status
- ✅ **Risiti** consumes these tokens (`/static/crafted-edge/tokens.css`).
- 🔵 **This corporate site** — tokens added here as the canonical home; migrating existing `style.css` rules to `--ce-*` is a follow-up, preview-gated step.
- 🔵 **Portfolio (meshack.\*)** — documented variant; sync this file and theme `--ce-accent:#ff5c00` when ready.

Keep this file as the one place brand values change. Other repos sync a copy.
