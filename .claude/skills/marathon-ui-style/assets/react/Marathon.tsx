// Marathon UI React components. Requires marathon.css.
import {
  useEffect, useMemo, useRef, useState,
  type AnchorHTMLAttributes, type ButtonHTMLAttributes, type CSSProperties, type ReactNode,
} from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

type Tone = "acid" | "magenta" | "ultra" | "orange";

/* ---------- hooks ---------- */

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_<>[]";

/** Decodes text from random glyphs into the final string. */
export function useScramble(text: string, duration = 600, enabled = true) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (reduced || !enabled) { setOut(text); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const fixed = Math.floor(p * text.length);
      setOut(text.split("").map((ch, i) =>
        i < fixed || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join(""));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduced, enabled]);
  return out;
}

/* ---------- root & type ---------- */

export function MtRoot({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("mt-root", className)}>{children}</div>;
}

export function MtEyebrow({ children, accent }: { children: ReactNode; accent?: boolean }) {
  return <p className={cx("mt-eyebrow", accent && "mt-eyebrow--accent")}>{children}</p>;
}

export function MtTitle({ children, size = "h1", as: Tag = "h2", scramble }: {
  children: string; size?: "mega" | "h1" | "h2"; as?: "h1" | "h2" | "h3"; scramble?: boolean;
}) {
  const text = useScramble(children, 600, !!scramble);
  return (
    <Tag className={cx("mt-title", size === "mega" && "mt-title--mega", size === "h2" && "mt-title--h2")} aria-label={children}>
      <span aria-hidden>{text}</span>
    </Tag>
  );
}

/* ---------- button & tag ---------- */

type BtnVariant = "primary" | "ghost" | "link";
type BtnProps =
  | ({ href: string; variant?: BtnVariant; arrow?: boolean } & AnchorHTMLAttributes<HTMLAnchorElement>)
  | ({ href?: undefined; variant?: BtnVariant; arrow?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>);

export function MtButton({ variant = "primary", arrow, className, children, ...rest }: BtnProps) {
  const cls = cx("mt-btn", `mt-btn--${variant}`, className);
  const body = <>{children}{arrow && <span aria-hidden>→</span>}</>;
  if (rest.href !== undefined)
    return <a className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>{body}</a>;
  return <button className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>{body}</button>;
}

export function MtTag({ children, tone = "acid", outline }: { children: ReactNode; tone?: Tone; outline?: boolean }) {
  return <span className={cx("mt-tag", outline ? "mt-tag--outline" : `mt-tag--${tone}`)}>{children}</span>;
}

/* ---------- nav ---------- */

export function MtNav({ logo, links, current, actions }: {
  logo: ReactNode; links: { label: string; href: string }[]; current?: string; actions?: ReactNode;
}) {
  return (
    <nav className="mt-nav">
      <a className="mt-nav__logo" href="/">{logo}</a>
      <ul className="mt-nav__links">
        {links.map(l => (
          <li key={l.href}><a href={l.href} aria-current={l.href === current ? "page" : undefined}>{l.label}</a></li>
        ))}
      </ul>
      <div className="mt-nav__actions">{actions}</div>
    </nav>
  );
}

/* ---------- section ---------- */

type Corner = "tl" | "tr" | "bl" | "br";

export function MtSection({ tone = "dark", eyebrow, title, titleSize = "h1", meta, children, id }: {
  tone?: "dark" | "bone" | "acid" | "ultra"; eyebrow?: ReactNode; title?: string;
  titleSize?: "mega" | "h1" | "h2"; meta?: Partial<Record<Corner, ReactNode>>; children?: ReactNode; id?: string;
}) {
  return (
    <section id={id} className={cx("mt-section", `mt-section--${tone}`)}>
      {meta && (Object.keys(meta) as Corner[]).map(k =>
        <span key={k} className={`mt-section__meta mt-section__meta--${k}`} aria-hidden>{meta[k]}</span>)}
      {eyebrow && <MtEyebrow>{eyebrow}</MtEyebrow>}
      {title && <MtTitle size={titleSize}>{title}</MtTitle>}
      {children}
    </section>
  );
}

/** Two columns that stack on mobile; `reverse` swaps sides on desktop. */
export function MtSplit({ children, reverse }: { children: [ReactNode, ReactNode]; reverse?: boolean }) {
  return <div className={cx("mt-split", reverse && "mt-split--reverse")}><div>{children[0]}</div><div>{children[1]}</div></div>;
}

/* ---------- news ---------- */

export function MtNewsList({ items }: { items: { source: string; date: string; title: string; href: string }[] }) {
  return (
    <ul className="mt-news">
      {items.map(n => (
        <li key={n.href} className="mt-news__item">
          <a href={n.href}>
            <span className="mt-news__meta">{n.source} · {n.date}</span>
            <span className="mt-news__title">{n.title}</span>
            <span aria-hidden>→</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ---------- thumbnails ---------- */

export function MtThumbRail({ items, selected, onSelect }: {
  items: { label: string; image?: string }[]; selected: number; onSelect: (i: number) => void;
}) {
  return (
    <div className="mt-thumbs" role="group">
      {items.map((t, i) => (
        <button key={i} className="mt-thumb" aria-pressed={i === selected} onClick={() => onSelect(i)}>
          <span className="mt-thumb__img" style={t.image ? { backgroundImage: `url("${t.image}")` } : undefined}>
            <span className="mt-thumb__num">{String(i + 1).padStart(2, "0")}</span>
          </span>
          <span className="mt-thumb__label">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- data ---------- */

/** Decorative barcode; bars derive from `seed` so it stays stable across renders. */
export function MtBarcode({ seed = "MARATHON", bars = 36 }: { seed?: string; bars?: number }) {
  const widths = useMemo(() => {
    let h = 0;
    for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return Array.from({ length: bars }, () => { h = (h * 1103515245 + 12345) >>> 0; return 1 + (h >>> 16) % 3; });
  }, [seed, bars]);
  let x = 0;
  const total = widths.reduce((a, w) => a + w * 2, 0);
  return (
    <svg className="mt-barcode" viewBox={`0 0 ${total} 24`} preserveAspectRatio="none" aria-hidden>
      {widths.map((w, i) => { const r = <rect key={i} x={x} y={0} width={w} height={24} fill="currentColor" />; x += w * 2; return r; })}
    </svg>
  );
}

export function MtDataCard({ label, value, unit, tag, children }: {
  label: string; value: ReactNode; unit?: string; tag?: ReactNode; children?: ReactNode;
}) {
  return (
    <div className="mt-card">
      <div className="mt-card__head"><MtEyebrow>{label}</MtEyebrow>{tag ?? <MtBarcode seed={label} />}</div>
      <div><span className="mt-card__value">{value}</span>{unit && <span className="mt-card__unit">{unit}</span>}</div>
      {children}
    </div>
  );
}

export function MtProgress({ value, segments = 16, label }: { value: number; segments?: number; label?: string }) {
  const on = Math.round(Math.max(0, Math.min(1, value)) * segments);
  return (
    <div className="mt-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100}
      aria-valuenow={Math.round(value * 100)} aria-label={label}>
      {Array.from({ length: segments }, (_, i) =>
        <span key={i} className={cx("mt-progress__seg", i < on && "mt-progress__seg--on")} />)}
    </div>
  );
}

/* ---------- bands & decor ---------- */

export function MtMarquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const row = [...items, ...items];
  return (
    <div className="mt-marquee" aria-label={items.join(" ")}>
      <div className="mt-marquee__track" style={{ "--mt-marquee-speed": `${speed}s` } as CSSProperties} aria-hidden>
        {row.map((t, i) => <span key={i} className="mt-marquee__item">{t}</span>)}
      </div>
    </div>
  );
}

export const MtStripes = () => <div className="mt-stripes" aria-hidden />;
export const MtRule = () => <hr className="mt-rule" />;
export const MtCrosshair = ({ style }: { style?: CSSProperties }) =>
  <span className="mt-crosshair" style={style} aria-hidden />;

/* ================= in-game patterns (lobby, vault, HUD, transfer, codex, exfil) ================= */

/* ---------- pixel glyphs ---------- */

// 7×7 bitmaps: the game's small pixelated icons. "#" = filled cell.
export const MT_PIXEL_ICONS = {
  weapon: [".......", "######.", "#######", "####...", "##.....", "##.....", "......."],
  mod: ["..#.#..", ".#####.", "##...##", ".#...#.", "##...##", ".#####.", "..#.#.."],
  core: ["...#...", "..###..", ".##.##.", "##...##", ".##.##.", "..###..", "...#..."],
  implant: [".#####.", "#.....#", "#.###.#", "#.#.#.#", "#.###.#", "#.....#", ".#####."],
  consumable: ["..###..", "..#.#..", ".#####.", ".##.##.", ".#...#.", ".##.##.", ".#####."],
  key: [".###...", "#...#..", "#...#..", ".#####.", "....#.#", "....###", "......."],
  light: [".......", "..#....", ".###...", ".###...", ".###...", ".###...", "......."],
  heavy: [".#.#...", "#####..", "#####..", "#####..", "#####..", "#####..", "......."],
  volt: ["...##..", "..##...", ".####..", "...##..", "..##...", ".##....", "......."],
  shotgun: [".......", ".##.##.", ".##.##.", ".##.##.", ".##.##.", ".......", "......."],
  cross: ["#.....#", ".#...#.", "..#.#..", "...#...", "..#.#..", ".#...#.", "#.....#"],
  fits: ["...#...", "..#....", ".#.....", "#######", ".#.....", "..#....", "...#..."],
  bang: ["..##...", "..##...", "..##...", "..##...", ".......", "..##...", "..##..."],
  skull: [".#####.", "#######", "#.##.##", "#######", ".#.#.#.", ".#####.", "......."],
} as const;
export type MtPixelIconName = keyof typeof MT_PIXEL_ICONS;

export function MtPixelIcon({ name, size = 14, title }: { name: MtPixelIconName; size?: number; title?: string }) {
  const rows = MT_PIXEL_ICONS[name];
  return (
    <svg className="mt-pixel" viewBox="0 0 7 7" width={size} height={size} shapeRendering="crispEdges"
      role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {rows.flatMap((row, y) => row.split("").map((c, x) => c === "#" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null))}
    </svg>
  );
}

/* ---------- lobby tabs ---------- */

export function MtTabBar({ tabs, value, onChange, end, label = "Lobby" }: {
  tabs: string[]; value: string; onChange: (t: string) => void; end?: ReactNode; label?: string;
}) {
  return (
    <div className="mt-tabbar">
      <div className="mt-tabbar__list" role="tablist" aria-label={label}>
        {tabs.map((t, i) => (
          <button key={t} role="tab" aria-selected={t === value} className="mt-tabbar__tab" onClick={() => onChange(t)}>
            <span className="mt-tabbar__idx" aria-hidden>{String(i + 1).padStart(2, "0")}</span>{t}
          </button>
        ))}
      </div>
      {end && <div className="mt-tabbar__end">{end}</div>}
    </div>
  );
}

/* ---------- vault items ---------- */

export const MT_RARITIES = ["standard", "enhanced", "deluxe", "superior", "prestige"] as const;
export type MtRarity = typeof MT_RARITIES[number];

export type MtItem = {
  id: string; name: string; code: string; rarity: MtRarity; icon: MtPixelIconName; qty?: number;
  /** weapons: ammo type shown bottom-right */ ammo?: "light" | "heavy" | "volt" | "shotgun";
  /** mods: fits an equipped weapon (←) or nothing (X), shown bottom-left */ fits?: boolean;
  type?: string; stats?: { k: string; v: string; highlight?: boolean }[]; value?: number;
};

/** Square, hard-cornered vault tile: code and count in the corners, rarity bar and corner flag, ammo / fit glyphs. */
export function MtItemTile({ item, selected, onSelect }: { item?: MtItem; selected?: boolean; onSelect?: (i: MtItem) => void }) {
  if (!item) return <div className="mt-item mt-item--empty" aria-label="Empty cell" />;
  return (
    <button type="button" className={`mt-item mt-item--${item.rarity}`} aria-pressed={onSelect ? !!selected : undefined}
      aria-label={`${item.name}, ${item.rarity}${item.qty ? `, ${item.qty}` : ""}`} onClick={() => onSelect?.(item)}>
      <span className="mt-item__code">{item.code}</span>
      {item.qty && item.qty > 1 && <span className="mt-item__qty">×{item.qty}</span>}
      <span className="mt-item__glyph"><MtPixelIcon name={item.icon} size={36} /></span>
      {item.fits !== undefined && <span className="mt-item__fit" title={item.fits ? "Fits equipped weapon" : "Fits nothing equipped"}><MtPixelIcon name={item.fits ? "fits" : "cross"} size={10} /></span>}
      {item.ammo && <span className="mt-item__ammo" title={`${item.ammo} ammo`}><MtPixelIcon name={item.ammo} size={12} /></span>}
    </button>
  );
}

export function MtItemGrid({ items, cells, selected, onSelect }: { items: MtItem[]; cells?: number; selected?: string; onSelect?: (i: MtItem) => void }) {
  const empty = Math.max(0, (cells ?? items.length) - items.length);
  return (
    <div className="mt-items">
      {items.map(i => <MtItemTile key={i.id} item={i} selected={i.id === selected} onSelect={onSelect} />)}
      {Array.from({ length: empty }, (_, k) => <MtItemTile key={`e${k}`} />)}
    </div>
  );
}

export function MtRarityChip({ rarity }: { rarity: MtRarity }) {
  return <span className={`mt-rarity mt-rarity--${rarity}`}>{rarity}</span>;
}

/** Mono key/value table with hairlines; `highlight` rows get the acid fill. */
export function MtSpecTable({ rows, title }: { rows: { k: string; v: ReactNode; highlight?: boolean }[]; title?: string }) {
  return (
    <table className="mt-spec">
      {title && <caption>{title}</caption>}
      <tbody>{rows.map(r => <tr key={r.k} className={r.highlight ? "mt-spec__hl" : undefined}><th scope="row">{r.k}</th><td>{r.v}</td></tr>)}</tbody>
    </table>
  );
}

/* ---------- hold to confirm ---------- */

/** Sell / remove / switch actions confirm on a held press (pointer or Space/Enter). */
export function MtHoldButton({ children, duration = 1200, onConfirm }: { children: ReactNode; duration?: number; onConfirm: () => void }) {
  const [p, setP] = useState(0);
  const raf = useRef(0);
  const stop = () => { cancelAnimationFrame(raf.current); raf.current = 0; setP(0); };
  const start = () => {
    if (raf.current) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const v = Math.min(1, (now - t0) / duration);
      setP(v);
      if (v < 1) raf.current = requestAnimationFrame(tick);
      else { raf.current = 0; setP(0); onConfirm(); }
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  return (
    <button type="button" className="mt-hold" style={{ "--p": p } as CSSProperties}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop}
      onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); start(); } }}
      onKeyUp={e => { if (e.key === " " || e.key === "Enter") stop(); }}>
      <span className="mt-hold__label">{children}</span><span className="mt-hold__hint" aria-hidden>HOLD</span>
    </button>
  );
}

/* ---------- HUD ---------- */

/** Segmented shield / health with numbers beside the bars (the game's small shield readout was a common complaint). */
export function MtVitals({ shield, health, heat }: { shield: number; health: number; heat?: number }) {
  const row = (label: string, v: number, cls: string, segs: number) => (
    <div className={`mt-vitals__row ${cls}`}>
      <span className="mt-vitals__label">{label}</span>
      <MtProgress value={v} segments={segs} label={label} />
      <span className="mt-vitals__num">{Math.round(v * 100)}</span>
    </div>
  );
  return (
    <div className="mt-vitals">
      {row("SHLD", shield, "mt-vitals__row--shield", 10)}
      {row("HLTH", health, "mt-vitals__row--health", 10)}
      {heat !== undefined && row("HEAT", heat, "mt-vitals__row--heat", 20)}
    </div>
  );
}

/* ---------- factions ---------- */

export function MtFactionCard({ short, name, slogan, accent = "var(--mt-acid)", rank, progress = 0 }: {
  short: string; name: string; slogan: string; accent?: string; rank?: number; progress?: number;
}) {
  return (
    <article className="mt-faction" style={{ "--mt-accent": accent } as CSSProperties}>
      <div className="mt-faction__head"><span className="mt-faction__short">{short}</span>{rank !== undefined && <span className="mt-faction__rank">RANK {String(rank).padStart(2, "0")}</span>}</div>
      <div className="mt-faction__name">{name}</div>
      <p className="mt-faction__slogan">{slogan}</p>
      <MtProgress value={progress} segments={12} label={`${name} reputation`} />
    </article>
  );
}

/* ---------- transfer / loading ---------- */

/** Symmetric pixel creature (the loading screens' moth), stable per seed. */
export function MtPixelMoth({ seed = "moth", cols = 23, rows = 13, size = 240 }: { seed?: string; cols?: number; rows?: number; size?: number }) {
  const cells = useMemo(() => {
    let h = 2166136261;
    for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
    const rnd = () => { h = (Math.imul(h, 1103515245) + 12345) >>> 0; return (h >>> 8) / 16777216; };
    const half = Math.ceil(cols / 2), out: [number, number][] = [];
    for (let y = 0; y < rows; y++) for (let x = 0; x < half; x++) {
      const dx = (half - 1 - x) / (half - 1); // 0 = body column, 1 = wing tip
      // wings sweep up and out: the upper wing's centre rises toward the tip
      const upper = dx > 0.12 && (dx / 1.05) ** 2 + ((y - rows * (0.42 - 0.22 * dx)) / (rows * 0.26)) ** 2 < 1;
      const lower = dx > 0.12 && (dx / 0.62) ** 2 + ((y - rows * (0.7 + 0.08 * dx)) / (rows * 0.2)) ** 2 < 1;
      const body = dx === 0 && y >= 2 && y <= rows - 2, antenna = (y === 0 && x === half - 3) || (y === 1 && x === half - 2);
      if (body || antenna || ((upper || lower) && rnd() < 0.66)) { out.push([x, y]); if (x !== cols - 1 - x) out.push([cols - 1 - x, y]); }
    }
    return out;
  }, [seed, cols, rows]);
  return (
    <svg className="mt-moth" viewBox={`0 0 ${cols} ${rows}`} width={size} height={size * rows / cols} shapeRendering="crispEdges" aria-hidden>
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" />)}
    </svg>
  );
}

/** Full-bleed ultramarine transfer screen: status log revealed line by line, progress readout. */
export function MtTransfer({ lines, progress, destination, seed }: { lines: string[]; progress: number; destination: string; seed?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? lines.length : 1);
  useEffect(() => {
    if (reduced) { setShown(lines.length); return; }
    if (shown >= lines.length) return;
    const t = setTimeout(() => setShown(n => n + 1), 700);
    return () => clearTimeout(t);
  }, [shown, lines.length, reduced]);
  return (
    <section className="mt-transfer" aria-live="polite">
      <div className="mt-transfer__head"><span>TRANSFER // {destination}</span><span>{String(Math.round(progress * 100)).padStart(3, "0")}%</span></div>
      <MtPixelMoth seed={seed ?? destination} />
      <ol className="mt-transfer__log">
        {lines.slice(0, shown).map((l, i) => <li key={i}><span aria-hidden>{String(i + 1).padStart(2, "0")}</span>{l}</li>)}
      </ol>
      <MtProgress value={progress} segments={32} label="Transfer progress" />
    </section>
  );
}

/* ---------- codex ---------- */

export function MtCodexCard({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <article className="mt-codex">
      <header className="mt-codex__head"><span>CODEX // {id}</span><span>{title}</span></header>
      <div className="mt-codex__body">{children}<span className="mt-codex__cursor" aria-hidden /></div>
    </article>
  );
}

/* ---------- exfil result ---------- */

export function MtExfilResult({ status, loot, currency = "CR" }: {
  status: "exfiltrated" | "lost"; loot: { name: string; rarity: MtRarity; qty: number; value: number }[]; currency?: string;
}) {
  const total = loot.reduce((a, l) => a + l.qty * l.value, 0);
  return (
    <section className={`mt-exfil mt-exfil--${status}`}>
      <div className="mt-exfil__status">{status === "exfiltrated" ? "Exfiltrated" : "Runner lost"}</div>
      <table className="mt-exfil__ledger">
        <thead><tr><th>Item</th><th>Rarity</th><th>Qty</th><th>{currency}</th></tr></thead>
        <tbody>{loot.map(l => <tr key={l.name}><td>{l.name}</td><td><MtRarityChip rarity={l.rarity} /></td><td>{l.qty}</td><td>{(l.qty * l.value).toLocaleString("en-US")}</td></tr>)}</tbody>
        <tfoot><tr><td colSpan={3}>Total</td><td>{total.toLocaleString("en-US")}</td></tr></tfoot>
      </table>
    </section>
  );
}
