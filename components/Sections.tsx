"use client";
import { useState } from "react";
import { PLANETS } from "@/lib/planets";
import { Arrow } from "./kit/ui";
export function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="wrap flex items-center justify-between pt-5">
        <a href="#explore" className="flex items-center gap-2.5 rounded-full bg-void/60 py-2 pl-2 pr-4 text-star ring-1 ring-star/10 backdrop-blur-md" aria-label="Anorix Cosmos home">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true"><circle cx="16" cy="16" r="5" fill="#ffb347" /><ellipse cx="16" cy="16" rx="13" ry="5" fill="none" stroke="#e8ecf5" strokeOpacity=".6" transform="rotate(-20 16 16)" /><circle cx="27" cy="12" r="2" fill="#5b8fd6" /></svg>
          <span className="display text-[17px]">Anorix Cosmos</span>
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-1 rounded-full bg-void/60 p-1.5 text-[14px] text-star ring-1 ring-star/10 backdrop-blur-md md:flex">
          {[["Explore", "#explore"], ["Planets", "#planets"], ["Scale", "#scale"], ["Features", "#features"]].map(([l, h]) => <a key={l} href={h} className="rounded-full px-4 py-2 transition-colors hover:bg-star/10">{l}</a>)}
          <a href="https://github.com/ahsxn3d/anorix-cosmos" className="ml-1 rounded-full bg-sun px-4 py-2 font-medium text-void transition-colors hover:bg-star">GitHub</a>
        </nav>
      </div>
    </header>
  );
}
export function Planets() {
  return (
    <section id="planets" className="bg-void py-[clamp(96px,11vw,170px)] text-star">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12"><p className="mono text-sun lg:col-span-3">01 · The planets</p><h2 className="display text-[clamp(40px,5.4vw,88px)] lg:col-span-9" data-reveal="lines">Eight worlds. Every number from NASA.</h2></div>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-[24px] border border-star/10 bg-star/10 sm:grid-cols-2 lg:grid-cols-4">
          {PLANETS.map((p, i) => (
            <li key={p.id} className="group relative bg-void p-6 transition-colors duration-500 hover:bg-[#0d1018]" data-fade data-delay={(i % 4) * 0.06}>
              <div className="flex items-center justify-between"><span className="mono text-star/45">0{i + 1}</span><span className="mono text-star/45">{p.type}</span></div>
              <div className="my-8 flex h-[120px] items-center justify-center"><span className="block rounded-full shadow-[inset_-14px_-10px_30px_rgba(0,0,0,.65)] transition-transform duration-700 group-hover:scale-110" style={{ width: 24 + Math.pow(p.r / 69911, 0.5) * 96, height: 24 + Math.pow(p.r / 69911, 0.5) * 96, backgroundImage: `url(/tex/${p.tex}.webp)`, backgroundSize: "200% 100%", backgroundPosition: "30% 50%" }} /></div>
              <h3 className="display text-[30px]">{p.name}</h3>
              <dl className="mono mt-4 grid grid-cols-2 gap-y-2 text-[12px]"><dt className="text-star/45">Radius</dt><dd className="text-right">{p.r.toLocaleString("en")} km</dd><dt className="text-star/45">Distance</dt><dd className="text-right">{p.au} AU</dd><dt className="text-star/45">Year</dt><dd className="text-right">{p.year}</dd><dt className="text-star/45">Moons</dt><dd className="text-right">{p.moons}</dd></dl>
            </li>
          ))}
        </ul>
        <p className="mono mt-4 text-star/45">Source: NASA Planetary Fact Sheet. Moon counts from NASA, as of August 2026.</p>
      </div>
    </section>
  );
}
export function Scale() {
  const [h, setH] = useState(4);
  const max = 69911;
  return (
    <section id="scale" className="bg-[#0a0c12] py-[clamp(96px,11vw,170px)] text-star">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12"><p className="mono text-sun lg:col-span-3">02 · True scale</p><h2 className="display text-[clamp(40px,5.4vw,88px)] lg:col-span-9" data-reveal="lines">The explorer cheats. Here is why.</h2></div>
        <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-star/70 lg:ml-[25%]">At true scale Earth would be a speck and Neptune would sit far off screen. So the explorer compresses sizes and distances. This strip shows the real sizes side by side.</p>
        <div className="mt-14 flex items-end gap-[1.2vw] overflow-x-auto pb-4 [scrollbar-width:none]">
          {PLANETS.map((p, i) => { const d = Math.max(4, (p.r / max) * 300); return (
            <button key={p.id} onMouseEnter={() => setH(i)} onFocus={() => setH(i)} onClick={() => setH(i)} className="group flex shrink-0 flex-col items-center gap-3" aria-label={`${p.name}, ${p.r.toLocaleString("en")} km radius`}>
              <span className={`block rounded-full ring-1 transition-[box-shadow] duration-500 ${h === i ? "ring-sun" : "ring-transparent"}`} style={{ width: `min(${d}px, ${d / 14}vw)`, height: `min(${d}px, ${d / 14}vw)`, minWidth: 4, minHeight: 4, backgroundImage: `url(/tex/${p.tex}.webp)`, backgroundSize: "200% 100%", boxShadow: "inset -10px -8px 24px rgba(0,0,0,.6)" }} />
              <span className={`mono transition-colors ${h === i ? "text-star" : "text-star/45"}`}>{p.name}</span>
            </button>); })}
        </div>
        <div className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-t border-star/10 pt-6"><p className="display text-[clamp(32px,3.6vw,56px)]">{PLANETS[h].name}</p><p className="mono text-star/70">{PLANETS[h].r.toLocaleString("en")} km radius · {(PLANETS[h].r / 6371).toFixed(2)}× Earth</p></div>
      </div>
    </section>
  );
}
const feats = [["Fly to any world", "Tap a planet or a chip and the camera flies there, with the facts that matter in a side panel."], ["Run time", "Pause, or play a day, a month or a year per second. Orbits keep their real periods relative to each other."], ["Real textures", "Planet maps from Solar System Scope, based on NASA mission imagery, wrapped on every sphere."], ["Light on the GPU", "Renders only while on screen, caps pixel density, and shows a still poster until the scene is ready."]];
export function Features() {
  return (
    <section id="features" className="bg-void py-[clamp(96px,11vw,170px)] text-star">
      <div className="wrap">
        <div className="grid gap-6 lg:grid-cols-12"><p className="mono text-sun lg:col-span-3">03 · Features</p><h2 className="display text-[clamp(40px,5.4vw,88px)] lg:col-span-9" data-reveal="lines">Built to be explored.</h2></div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {feats.map(([h, p], i) => <div key={h} className="rounded-[24px] border border-star/10 p-8 transition-colors duration-500 hover:border-sun/50" data-fade data-delay={i * 0.06}><p className="mono text-sun">0{i + 1}</p><h3 className="display mt-6 text-[clamp(28px,2.6vw,40px)]">{h}</h3><p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-star/65">{p}</p></div>)}
        </div>
        <p className="mono mt-8 text-star/45">Status: in development. Roadmap items (moons, dwarf planets, missions) are placeholders.</p>
      </div>
    </section>
  );
}
export function Footer() {
  return (
    <footer className="overflow-hidden bg-[#0a0c12] text-star">
      <div className="wrap py-[clamp(80px,9vw,140px)]">
        <h2 className="display max-w-[14ch] text-[clamp(48px,7vw,120px)]" data-reveal="lines">The sky, in a browser tab.</h2>
        <div className="mt-10 flex flex-wrap gap-3"><a href="#explore" className="btn bg-sun text-void hover:bg-star">Open the explorer <Arrow /></a><a href="https://github.com/ahsxn3d/anorix-cosmos" className="btn border border-star/25 hover:border-star">View on GitHub</a></div>
      </div>
      <div className="wrap flex flex-col justify-between gap-3 border-t border-star/10 py-8 text-[12px] text-star/55 md:flex-row"><span>© 2026 Anorix Cosmos by Anorix. Planet textures © Solar System Scope, CC BY 4.0. Facts: NASA.</span><span>Designed &amp; built by Anorix</span></div>
    </footer>
  );
}
