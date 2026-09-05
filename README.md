# Godfather: Shadows of the Village

A local pass-and-play social deduction party game for 8–16 players. Vue 3 + TypeScript + Pinia + Tailwind, packaged for Android with Capacitor. Fully offline, no server, no accounts.

## What's implemented

- **Engine** (`src/engine/`): role data, a deterministic role-balancer for 8–16 players, a night-resolution pipeline (roleblocks → control → protection → attacks → armor → poison → deaths/chains → info), a voting/execution resolver, and a centralized win-condition checker. All 15 original roles (Killer, Assassin, Alchemist, Puppeteer, Sheriff, Doctor, Prophet, Bartender, Blacksmith, Grumpy Grandma, Politician, Gossip, Medium, Cupid, Clown) are implemented with real effects on game state, not just descriptions.
- **App** (`src/views/`, `src/stores/`): home, player setup with a live role-composition preview, pass-and-play hold-to-reveal, a narrator-guided night flow, day/voting screens, a full role library, how-to-play, and settings. State persists to `localStorage` so an accidental close doesn't lose the game.
- **Tests** (`tests/engine.test.ts`): verified against every player count 8–16, plus targeted checks for Doctor protection, roleblocking, Grandma's revenge, lover heartbreak chains, Clown execution wins, and once-per-game role consumption. Run with `npm run test:engine` — this ran clean in the build sandbox.

## Honest limitations (read this before assuming otherwise)

This project was built in a sandboxed environment **with no network access**. That means:

- `npm install` was never run here — dependencies in `package.json` are pinned but unverified against the real npm registry. Run `npm install` yourself first.
- The Vue app itself (`npm run build`, `npm run dev`) has **not been compiled or visually tested** — only the dependency-free engine (`src/engine/`) was compiled and executed, using the TypeScript compiler already present in the sandbox. Expect to fix minor type or import issues on first build.
- `android/` was **not generated** — that requires `npx cap add android`, which needs the npm registry. Run it yourself (see below).
- No APK exists. Nothing in this repo claims one does.
- Blacksmith's "every other night" cooldown and a poison "cure" mechanic are simplified — the engine tracks poison and armor per-application rather than a full cooldown ledger, since no cure role existed in the source game.

## Setup

```bash
npm install
npm run test:engine   # verifies the game engine
npm run dev            # local web preview
npm run build           # production web bundle -> dist/
```

## Android

```bash
npx cap add android     # generates android/ (first time only)
npx cap sync android
npx cap open android    # opens Android Studio
```

From Android Studio: **Build > Build Bundle(s)/APK(s) > Build APK(s)** for a debug APK, or **Generate Signed Bundle/APK** for a release AAB.

### Release signing

1. Generate a keystore: `keytool -genkey -v -keystore release.keystore -alias godfather -keyalg RSA -keysize 2048 -validity 10000`
2. In `android/app/build.gradle`, add a `signingConfigs.release` block referencing the keystore path, alias, and passwords (use environment variables or `gradle.properties`, never commit the keystore).
3. Set `buildTypes.release.signingConfig = signingConfigs.release`.

### CI

`.github/workflows/build-android.yml` installs dependencies, runs the engine tests, builds the web bundle, adds the Android platform, and assembles a debug APK on every push to `main`. It does not sign a release build — do that locally or add secrets-based signing to the workflow yourself.

## Project structure

```
src/
  engine/      deterministic game rules, no Vue dependency
  stores/      Pinia store wrapping the engine + localStorage persistence
  views/       one file per screen
  components/  HoldToReveal, ConfirmModal
  router/      hash-based routing (works inside a Capacitor WebView)
tests/
  engine.test.ts   run with `npm run test:engine`
```
