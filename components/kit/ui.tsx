export function Arrow({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return <svg viewBox="0 0 16 16" className={className} aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
export function Marquee({ items, className = "", sep = "•" }: { items: string[]; className?: string; sep?: string }) {
  const all = [...items, ...items, ...items, ...items];
  return (
    <div className={`flex overflow-hidden ${className}`}>
      <div className="kit-marquee flex shrink-0 gap-10 pr-10">
        {all.map((w, i) => <span key={i} className="flex items-center gap-10 whitespace-nowrap">{w}<span aria-hidden className="opacity-50">{sep}</span></span>)}
      </div>
    </div>
  );
}
