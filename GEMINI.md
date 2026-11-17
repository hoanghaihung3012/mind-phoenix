# Mind Phoenix — Antigravity Agent Guidelines & Project Architecture

Mind Phoenix (`mindphoenix.xyz`) is a 2D animated educational platform featuring interactive web games, classroom tools, and learning materials for curious minds.

---

## 1. Project Philosophy & Stack

- **Zero-Build Architecture**: Pure Vanilla JavaScript (ES Modules), HTML5 Canvas, Web Audio API, and CSS3. No Webpack, Vite, or Babel compilation step is required.
- **Static Hosting**: Deployed directly to GitHub Pages / custom domain with root `index.html`.
- **Zero-Dependency Core**: All client code runs natively in modern web browsers without external runtime dependencies.
- **Bilingual by Design**: All games, tools, and pages support Vietnamese (`vi`) and English (`en`).
- **Clean Architecture & Separation of Concerns**: Shared domain logic and infrastructure reside in `shared/core/`, completely decoupling feature modules in `games/` and `tools/`.

---

## 2. Directory Structure

```text
mind-phoenix/
├── index.html               # Main homepage (services, channel links, showcase)
├── dev-server.mjs           # Zero-dependency local development HTTP server
├── package.json             # NPM scripts (test, dev, start)
├── CNAME / sitemap.xml      # SEO and custom domain configuration
├── assets/                  # Mascots, icons, and Open Graph social cards
├── shared/                  # Clean Architecture: Shared Core & Infrastructure
│   ├── core/
│   │   ├── audio.mjs        # Central Web Audio API sound & music engine
│   │   ├── i18n.mjs         # Central internationalization engine
│   │   ├── participants.mjs # Student names, TXT parsing, validation & shuffling
│   │   └── game-utils.mjs   # Seedable RNG, math questions, scoring & leaderboard
│   └── styles/
│       └── language.css     # Shared language toggle and topbar navigation styles
├── games/                   # Feature layer: Interactive learning games
│   ├── apple-catch/         # Math & fruit catching game
│   ├── breakout/            # Brick breaker with quiz bricks & physics
│   ├── code-the-bot/        # Block-based coding puzzle with robot Cmd
│   ├── duck-race/           # Classroom duck racing tool
│   ├── math-chain/          # Fast-paced mental math bubble merge puzzle
│   ├── math-challenge/      # Elementary arithmetic & quick math challenges
│   ├── shadow-puzzle/       # 7-piece tangram silhouette puzzle
│   ├── sky-jump/            # Vertical platformer with math gates
│   ├── audio.mjs            # Facade re-exporting shared/core/audio.mjs
│   ├── audio.test.mjs       # Audio engine unit tests
│   ├── i18n.mjs / test      # Game-level translation binding & unit tests
│   ├── translations.mjs     # Bilingual dictionary for games
│   └── questions-en.mjs     # English quiz banks & question decks
├── tools/                   # Feature layer: Classroom & teacher tools
│   ├── formula-sandbox/     # Primary school math formulas & metric converter
│   ├── spin-wheel/          # Classroom lucky draw wheel (uses shared participants & audio)
│   ├── timer/               # Multi-duration visual countdown timer (uses shared audio)
│   ├── youtube-dashboard/   # Channel subscriber & analytics view
│   └── i18n.mjs / test      # Tools localization facade & unit tests
├── pages/                   # Legal & compliance pages (Privacy, Terms)
└── .agent/                  # Antigravity agent configuration
    └── skills/              # Specialized design, UI/UX, and creative skills
```

---

## 3. Development Commands

Always run these standard commands when developing or verifying changes:

- **Run All Unit Tests**:
  ```bash
  npm test
  # Or directly:
  node --test 'games/**/*.test.mjs' 'tools/**/*.test.mjs'
  ```
- **Run Game Tests Only**:
  ```bash
  npm run test:games
  ```
- **Run Tool Tests Only**:
  ```bash
  npm run test:tools
  ```
- **Start Local Dev Server**:
  ```bash
  npm run dev
  # Runs on http://localhost:3000/
  ```

---

## 4. Coding & Engineering Standards

### A. Shared Core Layer (`shared/`)
- When creating shared helpers, utility algorithms, or common data formats, place them inside `shared/core/`.
- Never create direct cross-dependencies where a tool imports private files from a sibling game (e.g. `tools/` must not import from `games/duck-race/`). Instead, both must import from `shared/core/`.

### B. Web Audio API Patterns
- **Lazy Unlocking**: Web Audio contexts MUST be unlocked on user interaction (click/touch). Never attempt to play audio on initial page load.
- **Node Cleanup**: Always call `.disconnect()` on finished audio source and filter nodes to avoid memory leaks.
- **Page Visibility & Mute**: Pause looping audio and cancel queued sound effects when the tab is hidden (`visibilitychange`) or when the user toggles mute.
- **Audio Tests**: Verify any audio logic against `games/audio.test.mjs`.

### C. Internationalization (i18n)
- Every user-facing UI string, quiz question, prompt, or button label MUST exist in both English (`en`) and Vietnamese (`vi`).
- Maintain translations in `games/translations.mjs` and `games/questions-en.mjs` for games, and `tools/i18n.mjs` for tools.
- Preserves HTML markup, inline spans, and accessible `aria-label` attributes across language switches.

### D. Game Loop & Canvas
- Use `requestAnimationFrame` with delta time clamping to prevent physics tunneling when frames drop.
- Ensure all games are playable across both mobile touch screens and desktop keyboards.
- Game scores and leaderboards should sanitize input and handle offline fallback gracefully.
