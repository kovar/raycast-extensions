# macOS Menu Bar Spacing

Adjust the gap between macOS menu bar items via hidden system preferences (`NSStatusItemSpacing` and `NSStatusItemSelectionPadding`).

## Features

- Set custom spacing and selection padding values
- Presets: Compact (6/12), Tight (4/8), Minimal (0/0)
- Reset to system defaults

Changes take effect after Control Center restarts.

## Local Development

### Prerequisites

- **Raycast** 1.26+ installed and signed in (required for dev commands)
- **Node.js** 22.14+ and **npm** 7+

### Setup

```bash
cd menu-bar-spacing
npm install
```

Use `npm` here — Raycast Store CI expects `package-lock.json`.

### Run in dev mode

```bash
npm run dev
```

This runs `ray develop`, which:

1. Imports the extension into Raycast if it isn't already
2. Starts development mode with hot reload on save
3. Puts your extension at the top of Raycast root search

Then open Raycast and run **Adjust Menu Bar Spacing**.

If `ray` isn't on your PATH globally, this still works via the local install:

```bash
npx ray develop
```

### While developing

- Edit files under `src/` — changes reload automatically (toggle in **Raycast → Settings → Advanced → Auto-reload on save**)
- **Lint:** `npm run lint` (or `npm run fix-lint` to auto-fix)
- **Tests:** `npm run test`
- **Production build check:** `npm run build` — run this before submitting to the Store

### First-time import (alternative)

If dev mode doesn't pick it up, you can manually import:

1. Open Raycast
2. Search **Import Extension**
3. Select this `menu-bar-spacing` directory

### Testing the command

Applying spacing writes macOS defaults and restarts Control Center — it changes your real menu bar. Use **Reset to Defaults** in the command to undo.

## License

MIT