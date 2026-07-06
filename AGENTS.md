# AGENTS.md — CarSite Project

## Project Type
- Next.js 15.5.19 (App Router) + Tailwind CSS
- Node.js **22.x LTS required** (NOT v26 — webpack/watchpack issue on Windows)
- Server: Windows Server 2019 (build 17763), Node.js v24.18.0

## Key Conventions
- Light theme always (ignore system preference)
- All data from DB (no hardcoded SEO/social)
- Brand logos must be visible on any background (transparent PNG + SVG)
- Hero images preload (no delay on slide switch)
- Category icons handle all image formats + dark/light compatible

## Commands
- `npm run dev` — development
- `npm run build` — production build (must pass before commit)
- `npm start` — start production server
- `npm run lint` — lint check

## Framework & Patterns
- Next.js 15 App Router, TypeScript strict
- Tailwind CSS for styling
- Font: Vazirmatn (Arabic/Persian)
- Example patterns: `src/app/admin/brands/page.tsx`, `src/components/ui/`

## HEIC Handling
- HEIC→JPEG conversion: child process via `scripts/heic-worker.js`
- Uses `heic-convert` (WASM), `sharp`, and `exifr`
- exifr reads EXIF orientation from HEIC → sharp rotates accordingly
- Worker spawned via `execFile(process.execPath, [workerScript, tmpFile, filepath])`
- Reason for child process: bypass libvips security limits + Next.js webpack WASM bundling issues
