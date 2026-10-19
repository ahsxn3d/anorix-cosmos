"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
declare global { interface Window { __lenis?: Lenis } }

/** One RAF loop (gsap.ticker) drives Lenis + ScrollTrigger. Declarative reveals via data-attributes.
 *  Rule: an element gets ONE transform driver. data-speed/data-clip-img own transform; reveals own their split children. */
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let lenis: Lenis | undefined;
    const tick = (t: number) => lenis?.raf(t * 1000);
    let idle = 0;
    if (!reduce) {
      lenis = new Lenis({ lerp: 0.12, smoothWheel: true, autoRaf: false });
      window.__lenis = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      lenis.on("scroll", (l: Lenis) => {
        if (Math.abs(l.velocity) < 1.5) return;
        root.classList.add("is-scrolling");
        clearTimeout(idle);
        idle = window.setTimeout(() => root.classList.remove("is-scrolling"), 160);
      });
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href")!;
      const el = id.length > 1 ? document.querySelector(id) : document.body;
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.4 }); else el.scrollIntoView();
    };
    document.addEventListener("click", onClick);

    let ctx: gsap.Context | undefined;
    const splits: SplitText[] = [];
    const run = () => {
      ctx = gsap.context(() => {
        const q = <T extends Element = HTMLElement>(s: string) => Array.from(document.querySelectorAll<T>(s)) as unknown as HTMLElement[];
        if (reduce) { q("[data-reveal],[data-fade]").forEach((el) => gsap.set(el, { autoAlpha: 1 })); return; }
        q('[data-reveal="lines"]').forEach((el) => {
          const s = new SplitText(el, { type: "lines", mask: "lines" }); splits.push(s);
          gsap.set(el, { autoAlpha: 1 });
          gsap.from(s.lines, { yPercent: 112, rotate: 2, duration: 1.2, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        });
        q('[data-reveal="chars"]').forEach((el) => {
          const s = new SplitText(el, { type: "words,chars", mask: "chars" }); splits.push(s);
          gsap.set(el, { autoAlpha: 1 });
          gsap.from(s.chars, { yPercent: 110, duration: 1.05, ease: "expo.out", stagger: { each: 0.03, from: el.dataset.from === "center" ? "center" : "start" }, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        });
        q('[data-reveal="words"]').forEach((el) => {
          const s = new SplitText(el, { type: "words", aria: "none" }); splits.push(s);
          gsap.set(el, { autoAlpha: 1 });
          gsap.fromTo(s.words, { opacity: 0.18 }, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true } });
        });
        q("[data-fade]").forEach((el) => {
          gsap.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 1.05, ease: "expo.out", delay: Number(el.dataset.delay ?? 0), scrollTrigger: { trigger: el, start: "top 92%", once: true } });
        });
        q("[data-clip]").forEach((el) => {
          gsap.fromTo(el, { clipPath: "inset(14% 10% 14% 10% round 24px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "expo.out", duration: 1.5, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
          const img = el.querySelector<HTMLElement>("[data-clip-img]");
          if (img) gsap.fromTo(img, { scale: 1.18, yPercent: -4 }, { scale: 1.04, yPercent: 4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        q("[data-speed]").forEach((el) => {
          const sp = Number(el.dataset.speed);
          gsap.fromTo(el, { yPercent: -sp * 50 }, { yPercent: sp * 50, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        q("[data-count]").forEach((el) => {
          const end = Number(el.dataset.count), dec = Number(el.dataset.dec ?? (end % 1 ? 1 : 0)), o = { v: 0 };
          gsap.to(o, { v: end, duration: 2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: () => { el.textContent = o.v.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec }); } });
        });
      });
      ScrollTrigger.refresh();
    };
    document.fonts.ready.then(run);
    // safety net: any late layout change (fonts, images, tab content) re-measures every trigger/pin,
    // so pinned sections never start at a stale offset (the cause of "jumping" sections)
    let lastH = document.documentElement.scrollHeight, rz = 0;
    const ro = new ResizeObserver(() => { const h = document.documentElement.scrollHeight; if (Math.abs(h - lastH) < 2) return; lastH = h; clearTimeout(rz); rz = window.setTimeout(() => ScrollTrigger.refresh(), 180); });
    ro.observe(document.body);
    return () => {
      ro.disconnect(); clearTimeout(rz);
      document.removeEventListener("click", onClick);
      ctx?.revert(); splits.forEach((s) => s.revert());
      if (lenis) { gsap.ticker.remove(tick); lenis.destroy(); }
    };
  }, []);
  return null;
}
