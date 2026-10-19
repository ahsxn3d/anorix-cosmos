"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PLANETS } from "@/lib/planets";
import type { Ctl } from "./Explorer";
const Explorer = dynamic(() => import("./Explorer"), { ssr: false });
const speeds = [["Pause", 0], ["1 day/s", 1], ["1 month/s", 30], ["1 year/s", 365]] as const;
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const ctl = useRef<Ctl>({ speed: 30, focus: null, paused: false });
  const [focus, setFocus] = useState<string | null>(null), [sp, setSp] = useState(2), [vis, setVis] = useState(true), [ready, setReady] = useState(false), [boot, setBoot] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; if (reduce) { ctl.current.paused = true; setSp(0); }
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: "100px" }); io.observe(root.current!);
    const id = window.setTimeout(() => setBoot(true), 120); return () => { io.disconnect(); clearTimeout(id); };
  }, []);
  const pick = (id: string | null) => { ctl.current.focus = id; setFocus(id); };
  const setSpeed = (i: number) => { setSp(i); ctl.current.speed = speeds[i][1]; ctl.current.paused = speeds[i][1] === 0; };
  const P = PLANETS.find((p) => p.id === focus);
  return (
    <section ref={root} id="explore" className="relative h-[100svh] min-h-[620px] overflow-hidden bg-void text-star">
      <Image src="/img/poster.webp" alt="The solar system in Anorix Cosmos" fill priority sizes="100vw" className={`object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`} />
      {boot && <div className="absolute inset-0"><Explorer ctl={ctl} onPick={pick} running={vis} onReady={() => setReady(true)} /></div>}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,6,10,.75)_100%)]" />
      <div className="wrap pointer-events-none relative flex h-full flex-col justify-between pb-6 pt-28 md:pb-8">
        <div className={`max-w-[620px] transition-opacity duration-500 ${focus ? "max-md:opacity-0" : ""}`}>
          <p className="mono text-sun">Anorix Cosmos · 3D solar system explorer</p>
          <h1 className="display mt-4 text-[clamp(48px,7.4vw,120px)]" data-reveal="lines">Fly the solar system.</h1>
          <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-star/70">Drag to orbit, tap a world to fly there, and run time forward a year a second. Real textures, real orbital periods, in the browser.</p>
        </div>
        <div className="pointer-events-auto flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Time speed">
            <span className="mono mr-1 text-star/50">Time</span>
            {speeds.map(([l], i) => <button key={l} onClick={() => setSpeed(i)} aria-pressed={sp === i} className={`mono rounded-full border px-3 py-1.5 transition-colors ${sp === i ? "border-sun bg-sun text-void" : "border-star/20 text-star/75 hover:border-star/60"}`}>{l}</button>)}
            <span className="mono ml-auto hidden text-star/45 md:block">Sizes and distances compressed to fit</span>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0" role="tablist" aria-label="Planets">
            <button role="tab" aria-selected={!focus} onClick={() => pick(null)} className={`chip ${!focus ? "chip-on" : ""}`}><span className="h-2.5 w-2.5 rounded-full bg-sun" />System</button>
            {PLANETS.map((p) => <button key={p.id} role="tab" aria-selected={focus === p.id} onClick={() => pick(p.id)} className={`chip ${focus === p.id ? "chip-on" : ""}`}><span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />{p.name}</button>)}
          </div>
        </div>
      </div>
      <aside aria-live="polite" className={`absolute right-[clamp(16px,3.4vw,48px)] top-28 w-[min(340px,calc(100vw-32px))] rounded-[20px] border border-star/12 bg-void/70 p-6 backdrop-blur-md transition-[opacity,transform] duration-500 ease-[cubic-bezier(.16,1,.3,1)] max-md:top-24 ${P ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        {P && <>
          <div className="flex items-center justify-between"><p className="mono text-star/55">{P.type}</p><button onClick={() => pick(null)} className="mono text-star/60 hover:text-star" aria-label="Back to system">✕</button></div>
          <h2 className="display mt-2 text-[44px]">{P.name}</h2>
          <p className="mt-2 text-[14px] leading-relaxed text-star/70">{P.note}</p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-star/10 pt-4">
            {[["Radius", `${P.r.toLocaleString("en")} km`], ["From Sun", `${P.au} AU`], ["Day", P.day], ["Year", P.year], ["Moons", String(P.moons)], ["Axial tilt", `${P.tilt}°`]].map(([k, v]) => <div key={k}><dt className="mono text-star/45">{k}</dt><dd className="mono mt-0.5 text-[13px] text-star">{v}</dd></div>)}
          </dl>
        </>}
      </aside>
    </section>
  );
}
