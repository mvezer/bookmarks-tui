# Bookmarks TUI

<p align="center">
  <img src="https://github.com/mvezer/bookmarks-tui/blob/main/connector/icon/bookmarks-tui-connector-512px.png?raw=true" alt="Bookmarks TUI" width=30%/>
</p>

> It's a **work in progress** project — not yet available for public use, but you're welcome to play around with it :)

## What's this thing?
A terminal-based bookmark manager with two-way sync to Google Chrome. Search, create, edit, open and delete bookmarks without leaving your terminal. Pairs with the **Bookmarks TUI Connector** Chrome extension to keep your browser and terminal in sync.

---

## Features

- **Fuzzy search** — as-you-type filtering over all bookmark titles
- **Full CRUD** — create, edit, open and delete bookmarks directly from the TUI
- **Editor integration** — create and edit bookmarks in your `$EDITOR` (or in whicherever you configure in the `editor` setting)
- **Two-way Chrome sync** — bidirectional, near-real-time sync with Google Chrome via a companion extension
- **Import / export** — import from a Chrome-exported HTML file or JSON; export to HTML or JSON
- **Highly configurable** — keybindings, color schemes and general settings via a config file
- **12 built-in themes** — Catppuccin (Frappé, Mocha, Macchiato), Dracula, Gruvbox (dark/light), Monokai Pro, Nord Light, Tokyo Night (dark/light), Ayu (dark/light), and a built-in default
- **Custom themes** — define your own color scheme in the config file
- **Transparent background** — optional alpha blending for terminals with background images or blur

---

## Requirements

- [Bun](https://bun.sh) v1.3.14 or later

---

## Installation

### From source

```bash
git clone https://github.com/mvezer/bookmarks-tui
cd bookmarks-tui
bun install
```

Run the TUI

```bash
bun start
```

Or build a self-contained binary:

```bash
bun run build:tui
# produces ./bookmarks-tui
```

---

## Usage

### TUI mode

```bash
bookmarks-tui [options]
```

Launches the interactive terminal UI.

### CLI flags

| Flag | Description |
|---|---|
| `-h, --help` | Show usage and exit |
| `-c, --configPath <path>` | Path to a config file |
| `--colorScheme <name>` | Override the active color scheme |
| `-t, --transparent` | Enable transparent background |
| `-b, --browserCommand <cmd>` | Command used to open URLs (e.g. `firefox`) |
| `-d, --disableHttpServer` | Disable the Chrome sync HTTP server |
| `-e, --editor <editor>` | Editor command for creating/editing bookmarks |

### Import / export

```bash
# Import from a Chrome-exported bookmarks HTML file
bookmarks-tui import -f ~/Downloads/bookmarks.html

# Import from JSON
bookmarks-tui import -F json -f ~/Downloads/bookmarks.json

# Export to an HTML file
bookmarks-tui export -f ~/bookmarks_backup.html

# Export to stdout as JSON (pipe-friendly)
bookmarks-tui export -F json | jq -r '.bookmarks[] | "\(.title)\t\(.url)"'
```

---

## Keybindings

### Default keybinds

| Key | Action |
|---|---|
| `↑` / `↓` | Navigate bookmarks |
| `Return` | Open selected bookmark in browser |
| `Ctrl+N` | New bookmark (opens editor) |
| `Ctrl+E` | Edit selected bookmark (opens editor) |
| `Alt+D` | Delete selected bookmark |
| `Ctrl+U` / `Ctrl+D` | Half page up / down |
| `Ctrl+B` / `Ctrl+F` | Full page up / down |
| `PageUp` / `PageDown` | Full page up / down |
| `Home` / `End` | Jump to top / bottom |
| `Escape` | Reset search |
| `Alt+H` | Toggle help overlay |
| `Alt+C` | Toggle debug console |
| `Ctrl+Q` | Quit |

### Dialogs

| Key | Action |
|---|---|
| `y` | Confirm |
| `n` / `Escape` | Cancel |

All keybindings can be remapped in the config file.

---

## Configuration

The app searches for a config file in the following locations (first match wins):

```
~/.config/bookmarks-tui/bookmarks-tui.toml   (or .yaml / .json)
~/bookmarks-tui.toml                          (or .yaml / .json)
```

A custom path can be passed with `-c <path>`.

### Example (`bookmarks-tui.toml`)

```toml
[general]
colorScheme          = "catppuccin_mocha"  # built-in or custom theme name
editor               = "nvim"              # defaults to $EDITOR
browserCommand       = "xdg-open"          # command used to open URLs
transparentBackground = false              # enable for terminal transparency
disableHttpServer    = false               # set true to disable Chrome sync

# --- custom keybindings (optional, overrides defaults) ---
[[keymap]]
key    = "ctrl+q"
action = "quit"

[[keymap]]
key    = "return"
action = "bookmarkAction"

# --- custom color scheme (optional) ---
[colorSchemes.my_theme]
background             = "#1e1e2e"
foreground             = "#cdd6f4"
border                 = "#a6adc8"
searchBackground       = "#a6adc8"
searchForeground       = "#1e1e2e"
searchBorder           = "#a6adc8"
statusBackground       = "#1e1e2e"
statusForeground       = "#cdd6f4"
statusBorder           = "#a6adc8"
selectedBackground     = "#585b70"
selectedForeground     = "#94e2d5"
deleteDialogBackground = "#1e1e2e"
deleteDialogForeground = "#cdd6f4"
deleteDialogBorder     = "#f38ba8"
dialogBackground       = "#1e1e2e"
dialogForeground       = "#cdd6f4"
dialogBorder           = "#a6adc8"
errorToastBackground   = "#1e1e2e"
errorToastForeground   = "#f38ba8"
errorToastBorder       = "#f38ba8"
infoToastBackground    = "#1e1e2e"
infoToastForeground    = "#94e2d5"
infoToastBorder        = "#94e2d5"
```

### Available keymap actions

`nextBookmark`, `previousBookmark`, `quit`, `toggleConsole`, `halfPageUp`, `halfPageDown`, `pageUp`, `pageDown`, `bookmarkAction`, `deleteBookmark`, `editBookmark`, `newBookmark`, `dialogYes`, `dialogNo`, `dialogCancel`, `help`, `resetSearch`, `goToTop`, `goToBottom`

### Built-in color schemes

| Name | Style |
|---|---|
| `default` | Dark (alias for `ayu_dark`) |
| `ayu_dark` | Dark, near-black background |
| `ayu_light` | Light, clean white background |
| `catppuccin_frappe` | Dark, blue-purple base |
| `catppuccin_mocha` | Dark, deep purple base |
| `catppuccin_macchiato` | Dark, slate base |
| `dracula` | Dark, purple accents |
| `gruvbox_dark` | Dark, warm retro |
| `gruvbox_light` | Light, warm retro |
| `monokai_pro` | Dark, warm charcoal |
| `nord_light` | Light, cool arctic |
| `tokyo_night` | Dark, deep navy |
| `tokyo_night_light` | Light, muted grey |

---

## Chrome Extension (Bookmarks TUI Connector)

The companion Chrome extension provides **bidirectional, near-real-time sync** between Chrome's native bookmarks and the TUI's local database.

### How it works

- A background service worker polls the TUI's local HTTP API (`http://localhost:31531`) every 5 seconds
- **Chrome → TUI:** bookmarks created, edited or deleted in Chrome are detected and pushed to the TUI
- **TUI → Chrome:** bookmarks created, edited or deleted in the TUI are pushed to Chrome
- Bookmarks created from the TUI are placed in a dedicated **"Bookmarks TUI"** folder in the Chrome Bookmarks Bar
- Deduplication uses a content hash (`title + url`) to avoid re-syncing identical bookmarks
- The extension icon turns inactive when the TUI is not running

### Installing the extension (local/unpacked)

The extension is **not yet available on the Chrome Web Store**.

1. Build it:
   ```bash
   bun run build:connector
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **"Load unpacked"**
5. Select the `connector/` directory

The extension will start syncing automatically whenever the TUI app is running.

### Extension popup

Clicking the extension icon shows a live status panel:

- Total bookmarks tracked
- Changes received / processed / sent
- Pending changes queued
- Host status: **alive** (green) / **offline** (red) / **unknown** (yellow)

---

## Data storage

Bookmarks are stored in a SQLite database at:

```
~/.config/bookmarks/bookmarks.db
```

The database is created automatically on first run. No manual setup is required.

---

## Development

```bash
# Run with file watching
bun dev

# Run tests (more tests are coming...)
bun test

# Build TUI binary
bun run build:tui

# Build Chrome extension
bun run build:connector
```

### Monorepo structure

```
bookmarks-tui/
├── common/       @bookmarks-tui/common — shared types and utilities
├── tui-app/      The terminal application
└── connector/    The Chrome extension
```

---

## Tech stack

| | |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| TUI framework | [@opentui/core](https://github.com/opentui/opentui) — Yoga flex layout, native Zig renderer |
| Fuzzy search | [fuse.js](https://fusejs.io) |
| Database | `bun:sqlite` (built-in SQLite) |
| Config formats | TOML, YAML, JSON |
| Extension | Chrome Manifest V3 |
