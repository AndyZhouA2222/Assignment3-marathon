// ARC Raiders-style React components. Requires arc.css.
import {
  useEffect, useState,
  type CSSProperties, type ElementType, type ReactNode, type ButtonHTMLAttributes,
} from "react";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/* ---------------------------------- icons ---------------------------------- */
// Filled, rounded-geometric pictograms in one colour (currentColor), drawn on a 24px grid.
const gear = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 16, r = i % 2 ? 7.4 : 10;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}ZM12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Z`;
})();

export const AR_ICONS = {
  medical: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm5.5 4v3.5H7v3h3.5V17h3v-3.5H17v-3h-3.5V7h-3Z",
  shield: "M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-2.2 6h1.6v8H9.8V8Zm2.8 0h1.6v8h-1.6V8Z",
  weapon: "M17.6 2.4 21.6 6.4 9.2 18.8 4 20l1.2-5.2L17.6 2.4Z",
  wrench: "M21.3 6.6a5.3 5.3 0 0 1-7 5.4l-7.1 7.1a2.1 2.1 0 1 1-3-3l7.1-7.1a5.3 5.3 0 0 1 5.4-7l-3 3 .8 2.4 2.4.8 3-3c.2.5.4 1 .4 1.4Z",
  bolt: "M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6l1-8.5Z",
  aperture: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6.2 3.3 1.9v3.8L12 15.8l-3.3-1.9v-3.8L12 8.2Z",
  gear,
  factory: "M2 21V9.5l6 3.8V9.5l6 3.8V3h4.5v5H21v13H2Z",
  swap: "M16 3l5 4-5 4V8.2H4V5.8h12V3ZM8 13v2.8h12v2.4H8V21l-5-4 5-4Z",
  layers: "M12 2.5 21.5 8 12 13.5 2.5 8 12 2.5ZM4.6 11.3 12 15.6l7.4-4.3 2.1 1.2L12 18 2.5 12.5l2.1-1.2Zm0 4.5L12 20.1l7.4-4.3 2.1 1.2L12 22.5 2.5 17l2.1-1.2Z",
  arc: "M12 1.8 21 7v10l-9 5.2L3 17V7l9-5.2Zm0 6.6c-2.4 0-4.4 1.4-5.8 3.6 1.4 2.2 3.4 3.6 5.8 3.6s4.4-1.4 5.8-3.6c-1.4-2.2-3.4-3.6-5.8-3.6Zm0 1.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6Z",
  leaf: "M20.5 3.5C11 3.5 4.5 7.5 4.5 14.5c0 1.6.4 3.1 1.1 4.3L7.3 17c.6-3.8 4.4-7.3 8.7-8.7-3.6 2.2-6.4 5.4-7.6 9.6 1 .4 2.1.6 3.2.6 7 0 8.9-7.6 8.9-15Z",
  elevator: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm1.5 3.5v2h11v-2h-11Zm4.3 3.5v4.4l-1.9-1.9-1.5 1.5L12 18.6l4.6-4.6-1.5-1.5-1.9 1.9V10h-2.4Z",
  hatch: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 4.5h2.4v6.6l2.3-2.3 1.7 1.7L12 17.7l-5.2-5.2 1.7-1.7 2.3 2.3V6.5Z",
  coin: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13Zm0 2.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  cred: "M12 2 22 12 12 22 2 12 12 2Zm0 5.2L7.2 12 12 16.8 16.8 12 12 7.2Z",
  token: "M12 2 20.7 7v10L12 22l-8.7-5V7L12 2Zm-3 7v6h2.2v-2h1.6l1.4 2h2.4l-1.7-2.4A2.2 2.2 0 0 0 13.6 9H9Zm2.2 1.8h2.2a.4.4 0 0 1 0 .8h-2.2v-.8Z",
  ammo: "M5 9.5C5 6 6 4 7 3c1 1 2 3 2 6.5V21H5V9.5Zm5 0C10 6 11 4 12 3c1 1 2 3 2 6.5V21h-4V9.5Zm5 0C15 6 16 4 17 3c1 1 2 3 2 6.5V21h-4V9.5Z",
  backpack: "M9 2h6v2.2h.5A4.5 4.5 0 0 1 20 8.7V20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.7a4.5 4.5 0 0 1 4.5-4.5H9V2Zm-1 11v4.5h8V13H8Z",
  pin: "M12 2a7 7 0 0 1 7 7c0 5.2-7 13-7 13S5 14.2 5 9a7 7 0 0 1 7-7Zm0 4.4a2.6 2.6 0 1 0 0 5.2 2.6 2.6 0 0 0 0-5.2Z",
  user: "M12 2.8a4.6 4.6 0 1 1 0 9.2 4.6 4.6 0 0 1 0-9.2ZM3.5 21.2c0-4.3 3.8-7.4 8.5-7.4s8.5 3.1 8.5 7.4h-17Z",
  plus: "M10.6 4h2.8v6.6H20v2.8h-6.6V20h-2.8v-6.6H4v-2.8h6.6V4Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 4.5h2.4v5l3.6 2.1-1.2 2.1-4.8-2.8V6.5Z",
  heart: "M12 21s-8.5-5.3-8.5-11.4A4.9 4.9 0 0 1 12 6.5a4.9 4.9 0 0 1 8.5 3.1C20.5 15.7 12 21 12 21Z",
  chevron: "M8.6 4.5 16.1 12l-7.5 7.5-1.7-1.7L12.7 12 6.9 6.2l1.7-1.7Z",
  check: "M9.2 16.3 4.9 12l-1.8 1.8 6.1 6.1L21 8.1l-1.8-1.8L9.2 16.3Z",
} as const;
export type ArIconName = keyof typeof AR_ICONS;

export function ArIcon({ name, size, title, className, style }: { name: ArIconName; size?: number | string; title?: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path d={AR_ICONS[name]} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/* --------------------------------- tokens ---------------------------------- */
export const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
export type Rarity = typeof RARITIES[number];
const rarityVar = (r: Rarity) => `var(--ar-${r})`;
const ROMAN = ["", "I", "II", "III", "IV", "V"];

/* --------------------------------- layout ---------------------------------- */
export function ArRoot({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={cx("ar-root", className)} style={style}>{children}</div>;
}

/** Four-colour diagonal stripe motif. `slash` = small //// mark, `band` = full-width divider, `corner` = large bands entering from a corner. */
export function ArStripes({ variant = "slash", corner = "br", size, className, style }:
  { variant?: "slash" | "band" | "corner"; corner?: "tl" | "tr" | "bl" | "br"; size?: number; className?: string; style?: CSSProperties }) {
  const colors = ["var(--ar-stripe-blue)", "var(--ar-stripe-green)", "var(--ar-stripe-yellow)", "var(--ar-stripe-red)"];
  if (variant === "slash") {
    const h = size ?? 22, w = h * 1.25;
    return (
      <svg className={cx("ar-stripes", className)} style={style} width={w} height={h} viewBox="0 0 25 20" aria-hidden>
        {colors.map((c, i) => <path key={i} d={`M${i * 5 + 1} 20 L${i * 5 + 8} 0 H${i * 5 + 11} L${i * 5 + 4} 20 Z`} fill={c} />)}
      </svg>
    );
  }
  if (variant === "band") {
    return (
      <svg className={cx("ar-stripes ar-stripes--band", className)} style={style} viewBox="0 0 400 20" preserveAspectRatio="none" aria-hidden>
        {colors.map((c, i) => <rect key={i} x="0" y={i * 5} width="400" height="4" fill={c} />)}
      </svg>
    );
  }
  const s = size ?? 360, pos: CSSProperties = {
    width: s, height: s,
    [corner.includes("t") ? "top" : "bottom"]: 0, [corner.includes("l") ? "left" : "right"]: 0,
    transform: `scale(${corner.includes("l") ? -1 : 1}, ${corner.includes("t") ? -1 : 1})`,
  };
  return (
    <svg className={cx("ar-stripes ar-stripes--corner", className)} style={{ ...pos, ...style }} viewBox="0 0 100 100" aria-hidden>
      {colors.map((c, i) => <path key={i} d={`M${40 + i * 9} 100 L100 ${40 + i * 9} V${46 + i * 9} L${46 + i * 9} 100 Z`} fill={c} />)}
    </svg>
  );
}

export function ArWordmark({ children, href = "#", className }: { children: ReactNode; href?: string; className?: string }) {
  return <a className={cx("ar-wordmark", className)} href={href}>{children}<ArStripes size={18} /></a>;
}

type Link = { label: string; href: string };

/** Website header: cream band, dark uppercase links. */
export function ArSiteNav({ logo, links, current, actions }: { logo: ReactNode; links: Link[]; current?: string; actions?: ReactNode }) {
  return (
    <nav className="ar-sitenav" aria-label="Main">
      {typeof logo === "string" ? <ArWordmark>{logo}</ArWordmark> : logo}
      <ul className="ar-sitenav__links">
        {links.map(l => <li key={l.href}><a href={l.href} aria-current={l.href === current ? "page" : undefined}>{l.label}</a></li>)}
      </ul>
      {actions && <div className="ar-sitenav__actions">{actions}</div>}
    </nav>
  );
}

/** In-game hub tab bar (Stash, Workshop, Traders…), with currencies on the right. */
export function ArTabs({ tabs, value, onChange, end, label = "Hub" }: { tabs: string[]; value: string; onChange: (t: string) => void; end?: ReactNode; label?: string }) {
  return (
    <div className="ar-tabs">
      <div className="ar-tabs__list" role="tablist" aria-label={label}>
        {tabs.map(t => <button key={t} role="tab" className="ar-tab" aria-selected={t === value} onClick={() => onChange(t)}>{t}</button>)}
      </div>
      {end && <div className="ar-tabs__end">{end}</div>}
    </div>
  );
}

export function ArCurrency({ kind, value }: { kind: "coins" | "cred" | "tokens"; value: number }) {
  const icon: ArIconName = kind === "coins" ? "coin" : kind === "cred" ? "cred" : "token";
  return <span className={`ar-currency ar-currency--${kind}`}><ArIcon name={icon} title={kind} />{value.toLocaleString("en-US")}</span>;
}

export function ArSection({ tone = "night", eyebrow, title, lead, children, id, className, style }:
  { tone?: "night" | "panel" | "campaign" | "cream"; eyebrow?: ReactNode; title?: ReactNode; lead?: ReactNode; children?: ReactNode; id?: string; className?: string; style?: CSSProperties }) {
  return (
    <section id={id} className={cx("ar-section", `ar-section--${tone}`, className)} style={style}>
      {(eyebrow || title || lead) && (
        <header className="ar-section__head">
          {eyebrow && <p className="ar-eyebrow">{eyebrow}</p>}
          {title && <h2 className="ar-h2">{title}</h2>}
          {lead && <p className="ar-lead">{lead}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

export function ArSplit({ children }: { children: ReactNode }) {
  return <div className="ar-split">{children}</div>;
}

/** Bold uppercase title followed by a rule running to the edge. */
export function ArHeading({ children, as: Tag = "h3" }: { children: ReactNode; as?: ElementType }) {
  return <Tag className="ar-heading"><span className="ar-heading__text">{children}</span><span className="ar-heading__rule" aria-hidden /></Tag>;
}

export function ArPanel({ title, children, glass, className, style }: { title?: ReactNode; children: ReactNode; glass?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <section className={cx("ar-panel", glass && "ar-panel--glass", className)} style={style}>
      {title && <header className="ar-panel__head"><ArHeading>{title}</ArHeading></header>}
      <div className="ar-panel__body">{children}</div>
    </section>
  );
}

/* --------------------------------- controls -------------------------------- */
type BtnProps = { variant?: "primary" | "cream" | "ghost" | "outline" | "link"; size?: "md" | "lg"; href?: string; arrow?: boolean; children: ReactNode }
  & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function ArButton({ variant = "primary", size = "md", href, arrow, children, className, ...rest }: BtnProps) {
  const cls = cx("ar-btn", `ar-btn--${variant}`, size === "lg" && "ar-btn--lg", className);
  const inner = <>{children}{arrow && <ArIcon name="chevron" />}</>;
  return href ? <a className={cls} href={href}>{inner}</a> : <button className={cls} {...rest}>{inner}</button>;
}

export function ArToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="ar-toggle" onClick={() => onChange(!checked)}>
      <span className="ar-toggle__track" aria-hidden />{label}
    </button>
  );
}

export function ArRarity({ rarity, solid }: { rarity: Rarity; solid?: boolean }) {
  return <span className={cx("ar-rarity", solid && "ar-rarity--solid")} style={{ "--r": rarityVar(rarity) } as CSSProperties}>{rarity}</span>;
}

export function ArProgress({ label, value, max = 1, color, display }: { label: string; value: number; max?: number; color?: string; display?: string }) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <div className="ar-progress" style={color ? { "--c": color } as CSSProperties : undefined}>
      <div className="ar-progress__head"><span>{label}</span><span>{display ?? `${Math.round(pct)}%`}</span></div>
      <div className="ar-progress__track" role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <div className="ar-progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ---------------------------------- items ---------------------------------- */
export type Item = { id: string; name: string; rarity: Rarity; category: ArIconName; type?: string; tier?: number; qty?: number; image?: string; art?: ArIconName;
  description?: string; value?: number; weight?: number; stack?: number };

/** The signature stash tile: rarity glow and corner swoosh, dark bottom band with category glyph and Roman tier. */
export function ArItemTile({ item, selected, onSelect, className, style }: { item?: Item; selected?: boolean; onSelect?: (item: Item) => void; className?: string; style?: CSSProperties }) {
  if (!item) return <div className={cx("ar-tile ar-tile--empty", className)} style={style} aria-label="Empty slot" />;
  return (
    <button type="button" className={cx("ar-tile", `ar-tile--${item.rarity}`, className)} style={style} aria-pressed={onSelect ? !!selected : undefined}
      aria-label={`${item.name}, ${item.rarity}${item.qty ? `, ${item.qty} in stack` : ""}`} onClick={() => onSelect?.(item)}>
      <svg className="ar-tile__swoosh" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40.8A47.5 47.5 0 0 0 34.2 75H0Z" fill="currentColor" />
      </svg>
      <span className="ar-tile__art">{item.image ? <img src={item.image} alt="" /> : <ArIcon name={item.art ?? item.category} />}</span>
      {item.qty && item.qty > 1 && <span className="ar-tile__qty">x{item.qty}</span>}
      <span className="ar-tile__band"><ArIcon name={item.category} />{item.tier ? <span className="ar-tile__tier">{ROMAN[item.tier]}</span> : null}</span>
    </button>
  );
}

/** Stash grid; pads with empty slots up to `slots`. */
export function ArItemGrid({ items, slots, selected, onSelect, tile = 96 }: { items: Item[]; slots?: number; selected?: string; onSelect?: (i: Item) => void; tile?: number }) {
  const empty = Math.max(0, (slots ?? items.length) - items.length);
  return (
    <div className="ar-grid" style={{ "--ar-tile": `${tile}px` } as CSSProperties}>
      {items.map(i => <ArItemTile key={i.id} item={i} selected={i.id === selected} onSelect={onSelect} />)}
      {Array.from({ length: empty }, (_, k) => <ArItemTile key={`e${k}`} />)}
    </div>
  );
}

/** Item detail / tooltip card. */
export function ArItemCard({ item, actions }: { item: Item; actions?: ReactNode }) {
  return (
    <article className="ar-card" style={{ "--r": rarityVar(item.rarity) } as CSSProperties}>
      <header className="ar-card__head">
        <ArItemTile item={{ ...item, qty: undefined }} />
        <div>
          <ArRarity rarity={item.rarity} />
          <h3 className="ar-card__name">{item.name}</h3>
          {item.type && <div className="ar-card__type">{item.type}</div>}
        </div>
      </header>
      <div className="ar-card__body">
        {item.description && <p className="ar-card__desc">{item.description}</p>}
        <dl className="ar-stats">
          {item.value != null && <div className="ar-stats__row"><dt>Value</dt><dd><ArIcon name="coin" style={{ color: "var(--ar-gold)" }} />{item.value.toLocaleString("en-US")}</dd></div>}
          {item.weight != null && <div className="ar-stats__row"><dt>Weight</dt><dd>{item.weight.toFixed(1)} kg</dd></div>}
          {item.stack != null && <div className="ar-stats__row"><dt>Stack size</dt><dd>{item.qty ?? 1} / {item.stack}</dd></div>}
        </dl>
        {actions && <div className="ar-card__actions">{actions}</div>}
      </div>
    </article>
  );
}

/* --------------------------------- legend ---------------------------------- */
export type LegendItem = { icon: ArIconName; label: string; primary?: boolean; color?: string } | "gap";

export function ArIconChip({ icon, primary, color, size }: { icon: ArIconName; primary?: boolean; color?: string; size?: number }) {
  return (
    <span className={cx("ar-chip", primary && "ar-chip--primary", color && "ar-chip--tone")}
      style={{ ...(color ? { "--c": color } : {}), ...(size ? { width: size, height: size } : {}) } as CSSProperties}>
      <ArIcon name={icon} />
    </span>
  );
}

/** Map-legend style list: icon chip + label. Primary items get an inverted (cream) chip. */
export function ArLegend({ items }: { items: LegendItem[] }) {
  return (
    <ul className="ar-legend">
      {items.map((it, i) => it === "gap"
        ? <li key={i} className="ar-legend__gap" aria-hidden />
        : <li key={i} className="ar-legend__item"><ArIconChip icon={it.icon} primary={it.primary} color={it.color} />{it.label}</li>)}
    </ul>
  );
}

/* ----------------------------------- HUD ----------------------------------- */
/** HUD frame over a scene: `top` (compass, timer), `vitals` bottom-left, `weapon` bottom-right; stacks on phones. */
export function ArHud({ top, vitals, weapon, background, style }: { top?: ReactNode; vitals?: ReactNode; weapon?: ReactNode; background?: string; style?: CSSProperties }) {
  return (
    <div className="ar-hud" style={{ ...(background ? { backgroundImage: background } : {}), ...style }}>
      {top && <div className="ar-hud__top">{top}</div>}
      {vitals && <div className="ar-hud__bl">{vitals}</div>}
      {weapon && <div className="ar-hud__br">{weapon}</div>}
    </div>
  );
}

/** Shield (segmented blue) over health (cream). Values 0–1. */
export function ArVitals({ name, shield, health, segments = 5 }: { name?: string; shield: number; health: number; segments?: number }) {
  const on = Math.ceil(shield * segments - 0.001);
  return (
    <div className="ar-vitals">
      {name && <div className="ar-vitals__name">{name}</div>}
      <div className="ar-vitals__row">
        <ArIcon name="shield" title="Shield" />
        <div className="ar-segments">{Array.from({ length: segments }, (_, i) => <span key={i} className={cx("ar-segments__seg", i < on && "ar-segments__seg--on")} />)}</div>
        <span className="ar-vitals__value">{Math.round(shield * 100)}</span>
      </div>
      <div className="ar-vitals__row">
        <ArIcon name="heart" title="Health" />
        <div className={cx("ar-bar", health < 0.3 && "ar-bar--low")}><div className="ar-bar__fill" style={{ width: `${health * 100}%` }} /></div>
        <span className="ar-vitals__value">{Math.round(health * 100)}</span>
      </div>
    </div>
  );
}

export type CompassMarker = { bearing: number; icon: ArIconName; label?: string; color?: string };

/** Top-centre compass strip showing ±`span`/2 degrees around `heading`. */
export function ArCompass({ heading, markers = [], span = 150 }: { heading: number; markers?: CompassMarker[]; span?: number }) {
  const NAMES: Record<number, string> = { 0: "N", 45: "NE", 90: "E", 135: "SE", 180: "S", 225: "SW", 270: "W", 315: "NW" };
  const pos = (b: number) => { const d = ((b - heading + 540) % 360) - 180; return Math.abs(d) <= span / 2 ? 50 + (d / span) * 100 : null; };
  const ticks: ReactNode[] = [];
  for (let b = 0; b < 360; b += 5) {
    const x = pos(b); if (x == null) continue;
    const major = b % 15 === 0;
    ticks.push(<span key={`t${b}`} className={cx("ar-compass__tick", major && "ar-compass__tick--major")} style={{ left: `${x}%` }} />);
    if (NAMES[b]) ticks.push(<span key={`l${b}`} className="ar-compass__label" style={{ left: `${x}%` }}>{NAMES[b]}</span>);
    else if (b % 30 === 0) ticks.push(<span key={`l${b}`} className="ar-compass__label ar-compass__label--minor" style={{ left: `${x}%` }}>{b}</span>);
  }
  return (
    <div className="ar-compass" role="img" aria-label={`Heading ${Math.round(heading)} degrees`}>
      {ticks}
      {markers.map((m, i) => { const x = pos(m.bearing); return x == null ? null : (
        <span key={i} className="ar-compass__marker" style={{ left: `${x}%`, ...(m.color ? { "--c": m.color } : {}) } as CSSProperties}><ArIcon name={m.icon} />{m.label}</span>
      ); })}
      <span className="ar-compass__center" aria-hidden />
    </div>
  );
}

/** Extraction countdown: cream, amber under `warnAt` seconds, grey when closed. */
export function ArTimer({ seconds, label = "Extraction", warnAt = 300 }: { seconds: number; label?: string; warnAt?: number }) {
  const s = Math.max(0, Math.floor(seconds)), state = s === 0 ? "closed" : s <= warnAt ? "warning" : "open";
  const mm = String(Math.floor(s / 60)).padStart(2, "0"), ss = String(s % 60).padStart(2, "0");
  return (
    <div className={cx("ar-timer", state !== "open" && `ar-timer--${state}`)} role="timer" aria-label={`${label} ${state === "closed" ? "closed" : `${mm}:${ss}`}`}>
      <span className="ar-timer__label"><ArIcon name="hatch" />{state === "closed" ? `${label} closed` : label}</span>
      <span className="ar-timer__time">{mm}:{ss}</span>
    </div>
  );
}

export function ArWeapon({ name, ammo, reserve, category = "weapon" }: { name: string; ammo: number; reserve: number; category?: ArIconName }) {
  return (
    <div className="ar-weapon">
      <div className="ar-weapon__ammo">{ammo}<small> / {reserve}</small></div>
      <div className="ar-weapon__name"><ArIcon name={category} size={16} />{name}</div>
    </div>
  );
}

/** Seconds counting down once per second (stops at 0). */
export function useCountdown(start: number) {
  const [s, setS] = useState(start);
  useEffect(() => {
    if (s <= 0) return;
    const t = setTimeout(() => setS(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [s]);
  return s;
}

/* ----------------------------------- hub ----------------------------------- */
/** Bottom-right hub cluster: squad toggles, party slots and the big PLAY button. */
export function ArPlayDock({ party = [], maxParty = 3, onPlay, playLabel = "Play" }: { party?: string[]; maxParty?: number; onPlay?: () => void; playLabel?: string }) {
  const [fill, setFill] = useState(true), [cross, setCross] = useState(true);
  return (
    <div className="ar-dock">
      <div className="ar-dock__row">
        <ArToggle label="Fill squad" checked={fill} onChange={setFill} />
        <ArToggle label="Crossplay" checked={cross} onChange={setCross} />
      </div>
      <div className="ar-dock__row">
        <div className="ar-party">
          {Array.from({ length: maxParty }, (_, i) => party[i]
            ? <span key={i} className="ar-party__slot ar-party__slot--filled" title={party[i]}>{party[i].slice(0, 1)}</span>
            : <button key={i} type="button" className="ar-party__slot" aria-label="Invite to party"><ArIcon name="plus" /></button>)}
        </div>
        <ArButton variant="cream" size="lg" onClick={onPlay}>{playLabel}</ArButton>
      </div>
    </div>
  );
}

/* --------------------------------- website --------------------------------- */
export type NewsItem = { date: string; category: string; title: string; href: string; image?: string };

export function ArNewsGrid({ items }: { items: NewsItem[] }) {
  return (
    <div className="ar-news">
      {items.map(n => (
        <a key={n.href} className="ar-news__card" href={n.href}>
          <div className="ar-news__img" style={n.image ? { backgroundImage: `url("${n.image}")` } : undefined} />
          <span className="ar-news__meta">{n.category} · {n.date}</span>
          <span className="ar-news__title">{n.title}</span>
        </a>
      ))}
    </div>
  );
}

export function ArTraderCard({ name, role, quote, image, href }: { name: string; role: string; quote?: string; image?: string; href?: string }) {
  const Tag = href ? "a" : "article";
  return (
    <Tag className="ar-trader" {...(href ? { href } : {})}>
      <div className={cx("ar-trader__img", !image && "ar-trader__img--placeholder")} style={image ? { backgroundImage: `url("${image}")` } : undefined} />
      <div className="ar-trader__body">
        <span className="ar-trader__name">{name}</span>
        <span className="ar-trader__role">{role}</span>
        {quote && <p className="ar-trader__quote">“{quote}”</p>}
      </div>
    </Tag>
  );
}

export function ArFooter({ children, links = [] }: { children?: ReactNode; links?: Link[] }) {
  return (
    <footer className="ar-footer">
      <ArStripes variant="band" style={{ maxWidth: 160 }} />
      <div className="ar-footer__row">
        <span>{children}</span>
        <nav aria-label="Footer" style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>{links.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
      </div>
    </footer>
  );
}
