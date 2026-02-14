# Rover

A desktop pet Chrome extension. Rover lives in your browser — walking, sleeping, chasing your cursor, and reacting to the websites you visit.

## Features

- **Behaviors** — idle, walk, sleep, chase, and more
- **Physics Engine** — gravity, bounce, and friction; drag and throw Rover around
- **Page Reactions** — reacts differently on Twitter, YouTube, GitHub, Netflix, etc.
- **AI Chat** — right-click Rover to chat (powered by Gemini)
- **Popup Controls** — toggle on/off, select AI model, configure API key

## Install

```bash
git clone https://github.com/hanriiver/-rover.git
cd -rover
npm install
npm run build
```

Then load the extension in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `src` folder

## Project Structure

```
src/
├── pet/            # Core — Pet, Physics, SpriteManager, DragHandler
├── behaviors/      # Behavior classes + BehaviorManager
├── interactions/   # Mouse tracking, password detection, page detection
├── ui/             # SpeechBubble, ChatPanel, Effects
├── popup/          # Extension popup (settings UI)
├── sprites/        # GIF animations
├── content.js      # Content script (entry point)
└── background.js   # Service worker (AI API calls)
```

## Tech Stack

Vanilla JavaScript · Chrome Extension Manifest V3 · esbuild
