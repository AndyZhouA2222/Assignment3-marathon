// Marathon UI React components. Requires marathon.css.
import {
  useEffect, useMemo, useState,
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
          <span className="mt-thumb__img" style={t.image ? { backgroundImage: `url(${t.image})` } : undefined}>
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
