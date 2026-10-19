# Anorix Cosmos

A 3D solar system explorer that runs in the browser. Drag to orbit, tap a planet (or a chip) to fly there,
and run time forward from paused to a year a second. Sizes and distances are compressed so everything fits on screen;
orbital periods and facts come from NASA.

## Stack
Next.js 16 · React 19 · three.js + @react-three/fiber · Tailwind CSS 4 · GSAP · Lenis

## Run
```bash
npm install
npm run dev      # http://localhost:3019
npm run build && npm start
```

## Structure
- `components/Explorer.tsx`: the 3D scene (Sun, planets, Moon, Saturn's ring, orbits, starfield, fly-to camera)
- `components/Hero.tsx`, `components/Sections.tsx`: page around the explorer
- `lib/planets.ts`: planet data (NASA Planetary Fact Sheet)
- `public/tex/`: textures (Solar System Scope, CC BY 4.0)

## Credits
See [CREDITS.md](CREDITS.md). Textures © Solar System Scope, CC BY 4.0. Data: NASA (public domain).

A concept project by Anorix.
