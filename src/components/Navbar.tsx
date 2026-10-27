const LINKS = [
  { href: "#live", label: "Live Feed (1s)" },
  { href: "#controls", label: "Pipeline & Models" },
  { href: "#evidence", label: "Evidence" },
];

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <a href="#top" className="flex items-center gap-3">
          <span className="relative flex h-8 w-8 items-center justify-center">
            <span className="pulse-red absolute inset-0 rounded-sm bg-f1red/80" />
            <span className="relative font-display text-sm font-bold tracking-widest text-white">F1</span>
          </span>
          <div className="leading-none">
            <div className="font-display text-lg tracking-[0.22em] text-white">F1 TRACKER</div>
            <div className="font-mono text-[9px] tracking-[0.26em] text-f1red">CHALLENGE 02 · SENTINEL</div>
          </div>
        </a>
        <nav className="hidden items-center gap-5 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-cond text-[13px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-f1red/40 bg-f1red/10 px-3 py-1 sm:flex">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-f1red" />
            <span className="font-mono text-[10px] tracking-widest text-f1red">LIVE 1s FEED & DEMO</span>
          </span>
          <a
            href="#live"
            className="bg-f1red px-3 py-1.5 font-display text-xs tracking-[0.16em] text-white transition hover:bg-red-700"
          >
            OPEN CONSOLE
          </a>
        </div>
      </div>
    </header>
  );
}
