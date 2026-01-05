# ChromeOS Update Viewer

A Chrome extension for monitoring ChromeOS update progress, status, and errors.

## Features

- ✅ **Manual Log Input**: Paste content from `/var/log/update_engine.log` to track update progress
- ✅ **Progress Tracking**: View download progress, bytes transferred, and operation status
- ✅ **Error Detection**: Identify and display update errors from logs
- ✅ **Update Size**: See total update size and downloaded bytes
- ✅ **Quick Check**: Button to open ChromeOS settings for update checks
- ✅ **Auto-Refresh**: Automatic refresh every 5 seconds during active updates
- ✅ **Persistent Storage**: Status saved between sessions

## Installation

1. Build the extension:
```bash
bun install
bun run build
```

2. In Chrome/ChromeOS:
   - Navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `build/` directory

## Usage

### Method 1: Paste Update Log (Recommended)

1. Open the extension popup
2. Click "Paste Update Log"
3. Open a terminal and copy the last ~100 lines of the update log:
```bash
tail -n 100 /var/log/update_engine.log
```
4. Paste the log content into the extension
5. Click "Parse Log" to view progress

### Method 2: Check for Updates

1. Click "Check for Updates" in the extension
2. This opens `chrome://os-settings/about`
3. Copy log lines from the terminal and paste into the extension

## Limitations

Due to Chrome extension security restrictions:

- ❌ Extensions **cannot** access `chrome://` URLs (including settings pages)
- ❌ Extensions **cannot** directly read files from the filesystem
- ✅ Users must **manually paste** log content for detailed monitoring

## Architecture

```
Popup UI
    ↓ (user pastes log)
Background Script
    ↓ (parses with regex)
Log Parser
    ↓ (extracts status)
Storage (chrome.storage.local)
```

## Log Parsing

The extension parses the last 50-100 lines of `update_engine.log` to extract:

- **Overall Progress**: "overall progress X%"
- **Download Stats**: "X/Y bytes downloaded (Z%)"
- **Operations**: "Completed X/Y operations (P%)"
- **Errors**: Lines marked as "ERROR"

## Building

```bash
# Install dependencies
bun install

# Build for production
bun run build

# Watch for changes
bun run dev

# Package extension
bun run pack
```

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **UI**: React 18.3.1 + TailwindCSS
- **Storage**: Chrome Extension Storage API
- **Manifest**: v3

## License

MIT
