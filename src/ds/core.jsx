import { useEffect, useLayoutEffect, useRef, useState } from 'react';

/* ---------------------------------------------------------------- Doodle */

const DOODLES = {
  heart: {
    d: 'M24 40.5c-3-3-15.2-11.2-16.6-19.8C6.4 14.2 10.8 9.4 16 9.8c3.7.3 6.4 3 8 6.6 1.7-3.8 4.6-6.4 8.4-6.6 5.4-.2 9.4 4.9 8.2 11.3C39.1 29.6 27 37.6 24 40.5z',
    fill: true,
  },
  'heart-outline': {
    d: 'M24.6 16.6c1.6-3.9 4.6-6.6 8.2-6.8 5.4-.2 9.4 4.9 8.2 11.3C39.4 29.6 27.2 37.6 24 40.5c-3-3-15.2-11.2-16.6-19.8C6.4 14.2 10.8 9.4 16 9.8c3.9.3 6.6 3.2 8 7.4.3.9.6 1.8.9 2.4',
  },
  bow: {
    d: 'M24 22C19 13 8.5 10 7.5 17c-.7 5.6 9 7 16.5 5zM24 22c5-9 15.5-12 16.5-5 .7 5.6-9 7-16.5 5zM22.8 23.4c-2 5-5.4 10.6-9.2 15.4M25.2 23.4c2.4 5 5.2 10.4 9.8 14.8',
    knot: true,
  },
  sparkle: {
    d: 'M24 5c1.3 10 5.4 16.6 17 19-11.6 2.4-15.7 9-17 19-1.3-10-5.4-16.6-17-19C18.6 21.6 22.7 15 24 5z',
  },
  sparkles: {
    d: 'M20 9c1 8.4 4.4 13.8 13.6 15.8C24.4 26.8 21 32.2 20 40.6 19 32.2 15.6 26.8 6.4 24.8 15.6 22.8 19 17.4 20 9zM37.5 5.5c.5 3.6 1.9 5.9 5.6 6.8-3.7.9-5.1 3.2-5.6 6.8-.5-3.6-1.9-5.9-5.6-6.8 3.7-.9 5.1-3.2 5.6-6.8zM38 32c.4 2.6 1.4 4.1 3.8 4.8-2.4.7-3.4 2.2-3.8 4.8-.4-2.6-1.4-4.1-3.8-4.8 2.4-.7 3.4-2.2 3.8-4.8z',
  },
  'swirl-arrow': {
    d: 'M5 16c7-7 20-7 21 2 .6 6-7.6 8-8.4 3-.8-5.4 9.4-8.6 14.6-1.6 3.2 4.3 4.6 9.6 5.8 15M33 31.5l5 5 3.4-6.4',
  },
  squiggle: { d: 'M4 26c4-8 8-8 10 0s6 8 10 0 6-8 10 0 6 8 10 0' },
  notes: {
    d: 'M14 34V14l14-4v18M14 34a4 4 0 1 1-4-4 4 4 0 0 1 4 4zM28 28a4 4 0 1 1-4-4 4 4 0 0 1 4 4zM36 12l2 6 4-3',
  },
};

const DOODLE_ANIM = {
  float: 'hr-float 4s ease-in-out infinite',
  beat: 'hr-beat 1.6s ease-in-out infinite',
};

export function Doodle({ name = 'heart', size = 32, color = 'var(--line-ink)', fill, stroke = 1.8, rotate = 0, animate, title, style }) {
  const g = DOODLES[name] || DOODLES.heart;
  const f = fill !== undefined ? fill : g.fill ? color : 'none';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill={f}
      stroke={color}
      strokeWidth={(stroke * 48) / size > 4 ? 4 : (stroke * 48) / Math.max(size, 12)}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{
        display: 'block',
        flex: 'none',
        overflow: 'visible',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        animation: animate ? DOODLE_ANIM[animate] : undefined,
        transformOrigin: '50% 60%',
        ...style,
      }}
    >
      <path d={g.d} />
      {g.knot && <circle cx="24" cy="22" r="2.4" fill={color} stroke="none" />}
    </svg>
  );
}

/* ------------------------------------------------------------------ Icon */

const ICONS = {
  pin: (<><path d="M12 21s-7-6.2-7-11.6A7 7 0 0 1 19 9.4C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.6" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  bus: (<><rect x="4.5" y="3.5" width="15" height="14" rx="3" /><path d="M4.5 10.5h15M7.5 17.5V20M16.5 17.5V20" /><circle cx="8.5" cy="14" r=".9" /><circle cx="15.5" cy="14" r=".9" /></>),
  map: <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6zM9 4v14M15 6v14" />,
  music: (<><path d="M9 17.5V5.5l10-2v12" /><circle cx="6.5" cy="17.5" r="2.5" /><circle cx="16.5" cy="15.5" r="2.5" /></>),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8.5 5v14M15.5 5v14" />,
  arrow: <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />,
  down: <path d="M12 5v14M6.5 13.5 12 19l5.5-5.5" />,
  external: (<><path d="M14 4h6v6M20 4l-8.5 8.5" /><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  envelope: (<><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3.5 6.5l8.5 6.5 8.5-6.5" /></>),
  arch: (<><path d="M6 20.5V10a6 6 0 0 1 12 0v10.5M3.5 20.5h17" /><circle cx="14.6" cy="14.5" r=".8" /></>),
  rings: (<><circle cx="9" cy="14.5" r="5.5" /><circle cx="15" cy="14.5" r="5.5" /><path d="M13 6.5l2-2.5 2 2.5-2 1.8z" /></>),
  glasses: <path d="M4.5 3h5l-.4 5.2a2.1 2.1 0 0 1-4.2 0zM7 10.4V19M4.5 19.5h5M14.5 3h5l-.4 5.2a2.1 2.1 0 0 1-4.2 0zM17 10.4V19M14.5 19.5h5" />,
  dinner: (<><circle cx="12.5" cy="12" r="5.8" /><circle cx="12.5" cy="12" r="3.2" /><path d="M3 4v4.5c0 1 .7 1.6 1.5 1.6S6 9.5 6 8.5V4M4.5 10.1V20M21.5 4c-1.5 1-2 3.5-2 6h2v10" /></>),
  disco: (<><circle cx="12" cy="14" r="6.5" /><path d="M12 2.5v5M5.5 14h13M12 7.5v13M8.2 8.8c1.6 3.2 1.6 7.2 0 10.4M15.8 8.8c-1.6 3.2-1.6 7.2 0 10.4" /></>),
  link: <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  trash: <path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5" />,
  download: <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />,
  logout: <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 16.5 5.5 12 10 7.5M5.5 12H15" />,
  key: (<><circle cx="8" cy="15" r="4" /><path d="M11 12l8.5-8.5M16.5 6.5l2.5 2.5M14 9l2 2" /></>),
  whatsapp: (<><path d="M4 20l1.2-4A8 8 0 1 1 8.3 19z" /><path d="M9 9.2c0 3 2.8 5.8 5.8 5.8l1-1.4-1.8-1-1 .8c-.9-.4-2-1.5-2.4-2.4l.8-1-1-1.8z" /></>),
};

export function Icon({ name = 'heart', size = 22, stroke = 1.6, color = 'currentColor', title, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', flex: 'none', ...style }}
    >
      {ICONS[name] || ICONS.heart}
    </svg>
  );
}

/* ---------------------------------------------------------------- Button */

const BUTTON_VARIANTS = {
  primary: { bg: 'var(--azul-900)', hov: 'var(--azul-700)', fg: 'var(--lino-50)', bd: 'var(--azul-900)' },
  gold: { bg: 'var(--oro-400)', hov: 'var(--oro-500)', fg: 'var(--azul-900)', bd: 'var(--oro-400)' },
  outline: { bg: 'transparent', hov: 'var(--lino-200)', fg: 'var(--azul-900)', bd: 'var(--azul-900)' },
  soft: { bg: 'var(--lino-200)', hov: 'var(--lino-300)', fg: 'var(--azul-900)', bd: 'var(--lino-200)' },
  link: { bg: 'transparent', hov: 'transparent', fg: 'var(--azul-700)', bd: 'transparent' },
};

const BUTTON_SIZES = {
  sm: { h: 40, px: 18, fs: 14, ic: 16 },
  md: { h: 52, px: 26, fs: 16, ic: 18 },
  lg: { h: 60, px: 34, fs: 17, ic: 20 },
};

export function Button({ variant = 'primary', size = 'md', icon, iconRight, disabled = false, fullWidth = false, href, target, type = 'button', onClick, children, style }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);
  const v = BUTTON_VARIANTS[variant] || BUTTON_VARIANTS.primary;
  const s = BUTTON_SIZES[size] || BUTTON_SIZES.md;
  const link = variant === 'link';
  const st = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: s.h,
    padding: link ? '0 4px' : `0 ${s.px}px`,
    width: fullWidth ? '100%' : 'auto',
    boxSizing: 'border-box',
    background: hover && !disabled ? v.hov : v.bg,
    color: v.fg,
    border: `1.5px solid ${v.bd}`,
    borderRadius: 'var(--radius-pill)',
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: s.fs,
    letterSpacing: '.02em',
    lineHeight: 1.2,
    textAlign: 'center',
    textDecoration: link ? 'underline' : 'none',
    textUnderlineOffset: 5,
    textDecorationThickness: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transform: down && !disabled ? 'translateY(1px)' : 'none',
    transition: 'background var(--dur-fast) var(--ease-soft),transform var(--dur-fast)',
    ...style,
  };
  const events = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setDown(false);
    },
    onMouseDown: () => setDown(true),
    onMouseUp: () => setDown(false),
  };
  const inner = (
    <>
      {icon && <Icon name={icon} size={s.ic} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={s.ic} />}
    </>
  );
  if (href && !disabled) {
    return (
      <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} onClick={onClick} style={st} {...events}>
        {inner}
      </a>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={st} {...events}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------------ IllustrationSlot */

export function IllustrationSlot({ src, alt = '', label = 'Ilustración', ratio = '1 / 1', width = '100%', blend = true, compact = false, style }) {
  // Fall back to the dashed placeholder when the image is missing or fails to load.
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => setFailedSrc(src)}
        style={{ display: 'block', width, aspectRatio: ratio, objectFit: 'contain', mixBlendMode: blend ? 'multiply' : 'normal', ...style }}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={alt || label}
      style={{
        width,
        aspectRatio: ratio,
        boxSizing: 'border-box',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--azul-300)',
        background: 'rgba(238,230,214,.55)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? 4 : 8,
        padding: compact ? 6 : 16,
        textAlign: 'center',
        color: 'var(--azul-600)',
        ...style,
      }}
    >
      <Doodle name="sparkles" size={compact ? 18 : 30} color="var(--oro-500)" />
      {!compact && (
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--hand-sm)', lineHeight: 1.2, textWrap: 'balance', maxWidth: 260 }}>
          {label}
        </span>
      )}
      {!compact && (
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, letterSpacing: 'var(--tracking-caps)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Ilustración pendiente
        </span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------- MusicToggle */

let ytPromise = null;
function loadYT() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytPromise) return ytPromise;
  ytPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prev) prev();
      resolve(window.YT);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  });
  return ytPromise;
}

function Bars() {
  return (
    <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 3, height: 18, width: 20, justifyContent: 'center' }}>
      {[0, 0.25, 0.5].map((d) => (
        <span
          key={d}
          style={{ width: 3, height: 18, borderRadius: 2, background: 'currentColor', transformOrigin: '50% 100%', animation: `hr-eq .9s ease-in-out ${d}s infinite` }}
        />
      ))}
    </span>
  );
}

export function MusicToggle({ videoId, playing, defaultPlaying = false, onChange, start = 0, volume = 60, fixed = false, label, style }) {
  const controlled = playing !== undefined;
  const [inner, setInner] = useState(defaultPlaying);
  const on = controlled ? playing : inner;
  const host = useRef(null);
  const player = useRef(null);
  const ready = useRef(false);
  const want = useRef(on);
  useEffect(() => {
    want.current = on;
  }, [on]);

  useEffect(() => {
    const hostEl = host.current;
    if (!videoId || !hostEl) return;
    let dead = false;
    const el = document.createElement('div');
    hostEl.appendChild(el);
    loadYT().then((YT) => {
      if (dead) return;
      player.current = new YT.Player(el, {
        width: 200,
        height: 200,
        videoId,
        playerVars: { autoplay: 0, controls: 0, loop: 1, playlist: videoId, start, playsinline: 1, rel: 0 },
        events: {
          onReady: (e) => {
            ready.current = true;
            try {
              e.target.setVolume(volume);
            } catch {
              /* ignore */
            }
            if (want.current) e.target.playVideo();
          },
        },
      });
    });
    return () => {
      dead = true;
      try {
        if (player.current) player.current.destroy();
      } catch {
        /* ignore */
      }
      player.current = null;
      ready.current = false;
      hostEl.innerHTML = '';
    };
  }, [videoId]);

  useEffect(() => {
    const p = player.current;
    if (!p || !ready.current) return;
    try {
      if (on) p.playVideo();
      else p.pauseVideo();
    } catch {
      /* ignore */
    }
  }, [on]);

  const toggle = () => {
    const next = !on;
    if (!controlled) setInner(next);
    if (onChange) onChange(next);
    const p = player.current;
    if (p && ready.current) {
      try {
        if (next) p.playVideo();
        else p.pauseVideo();
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <>
      {videoId && (
        <div
          ref={host}
          aria-hidden="true"
          style={{ position: 'fixed', left: 0, bottom: 0, width: 200, height: 200, opacity: 0, pointerEvents: 'none', zIndex: -1, overflow: 'hidden' }}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        aria-label={on ? 'Pausar música' : 'Reproducir música'}
        style={{
          position: fixed ? 'fixed' : 'relative',
          right: fixed ? 20 : undefined,
          bottom: fixed ? 20 : undefined,
          zIndex: fixed ? 60 : undefined,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          height: 52,
          minWidth: 52,
          padding: label ? '0 20px 0 16px' : 0,
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-pill)',
          border: '1.5px solid var(--azul-900)',
          background: on ? 'var(--azul-900)' : 'var(--lino-50)',
          color: on ? 'var(--lino-50)' : 'var(--azul-900)',
          boxShadow: 'var(--shadow-paper)',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          fontWeight: 500,
          animation: on ? 'hr-pulse 2.4s ease-out infinite' : 'none',
          transition: 'background var(--dur-fast),color var(--dur-fast)',
          ...style,
        }}
      >
        {on ? <Bars /> : <Icon name="music" size={20} />}
        {label && <span>{label}</span>}
      </button>
    </>
  );
}

/* ---------------------------------------------------------------- Reveal */

export function Reveal({ delay = 0, y = 18, once = true, as: Tag = 'div', children, style }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setOn(true);
            if (once) io.disconnect();
          } else if (!once) setOn(false);
        }),
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once]);
  const tr = `var(--dur-slow) var(--ease-soft) ${delay}ms`;
  return (
    <Tag
      ref={ref}
      style={{ opacity: on ? 1 : 0, transform: on ? 'none' : `translateY(${y}px)`, transition: `opacity ${tr},transform ${tr}`, ...style }}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------------------------------- SquiggleFrame */

function framePath(w, h, inset, R, seed) {
  const pts = [];
  const x0 = inset;
  const y0 = inset;
  const L = w - 2 * inset;
  const H = h - 2 * inset;
  const st = 5;
  R = Math.min(R, L / 2, H / 2);
  const add = (x, y) => pts.push([x, y]);
  for (let x = x0 + R; x < x0 + L - R; x += st) add(x, y0);
  for (let a = -Math.PI / 2; a < 0; a += 0.2) add(x0 + L - R + R * Math.cos(a), y0 + R + R * Math.sin(a));
  for (let y = y0 + R; y < y0 + H - R; y += st) add(x0 + L, y);
  for (let a = 0; a < Math.PI / 2; a += 0.2) add(x0 + L - R + R * Math.cos(a), y0 + H - R + R * Math.sin(a));
  for (let x = x0 + L - R; x > x0 + R; x -= st) add(x, y0 + H);
  for (let a = Math.PI / 2; a < Math.PI; a += 0.2) add(x0 + R + R * Math.cos(a), y0 + H - R + R * Math.sin(a));
  for (let y = y0 + H - R; y > y0 + R; y -= st) add(x0, y);
  for (let a = Math.PI; a < 1.5 * Math.PI; a += 0.2) add(x0 + R + R * Math.cos(a), y0 + R + R * Math.sin(a));
  const n = pts.length;
  const cum = [0];
  for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = cum[n - 1] + Math.hypot(pts[0][0] - pts[n - 1][0], pts[0][1] - pts[n - 1][1]);
  const k1 = Math.max(2, Math.round(tot / 210));
  const k2 = Math.max(5, Math.round(tot / 64));
  const out = pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n];
    const b = pts[(i + 1) % n];
    const nx = b[1] - a[1];
    const ny = -(b[0] - a[0]);
    const l = Math.hypot(nx, ny) || 1;
    const u = (cum[i] / tot) * 2 * Math.PI;
    const o = 1.9 * Math.sin(k1 * u + seed) + 1 * Math.sin(k2 * u + seed * 2.3);
    return [p[0] + (nx / l) * o, p[1] + (ny / l) * o];
  });
  return 'M' + out.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + 'Z';
}

function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}

export function SquiggleFrame({ ornament = 'bows', color = 'var(--line-ink)', ornamentColor, double = false, stroke = 1.6, padding = '44px 28px', background = 'transparent', children, style }) {
  const [ref, sz] = useElementSize();
  const oc = ornamentColor || color;
  const corner = (key, pos, rot) => (
    <div key={key} style={{ position: 'absolute', ...pos, transform: `rotate(${rot}deg)` }}>
      <Doodle name="bow" size={40} color={oc} />
    </div>
  );
  return (
    <div ref={ref} style={{ position: 'relative', padding, background, borderRadius: 'var(--radius-lg)', boxSizing: 'border-box', ...style }}>
      {sz.w > 0 && (
        <svg
          width={sz.w}
          height={sz.h}
          style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={framePath(sz.w, sz.h, 6, 24, 0)} />
          {double && <path d={framePath(sz.w, sz.h, 13, 18, 2)} strokeWidth={stroke * 0.7} opacity=".55" />}
        </svg>
      )}
      {ornament === 'bows' && [
        corner('tl', { left: -12, top: -14 }, -18),
        corner('tr', { right: -12, top: -14 }, 18),
        corner('bl', { left: -12, bottom: -18 }, -160),
        corner('br', { right: -12, bottom: -18 }, 160),
      ]}
      {ornament === 'hearts' && (
        <>
          {['left', 'right'].map((s) => (
            <div key={s} style={{ position: 'absolute', [s]: -3, top: '50%', transform: 'translateY(-50%)' }}>
              <Doodle name="heart" size={16} color={oc} />
            </div>
          ))}
          <div style={{ position: 'absolute', left: '50%', top: -1, transform: 'translate(-50%,-50%)' }}>
            <Doodle name="heart" size={14} color={oc} />
          </div>
          <div style={{ position: 'absolute', left: '50%', bottom: -1, transform: 'translate(-50%,50%)' }}>
            <Doodle name="heart" size={14} color={oc} />
          </div>
        </>
      )}
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  );
}

/* ----------------------------------------------------------- WavyDivider */

function buildWave(variant, w, h, gap) {
  const mid = h / 2;
  const segs = [];
  let cur = [];
  const push = (x, y) => {
    if (gap && x > w / 2 - gap && x < w / 2 + gap) {
      if (cur.length) segs.push(cur);
      cur = [];
      return;
    }
    cur.push([x, y]);
  };
  if (variant === 'loops') {
    const P = 48;
    const r = P / (2 * Math.PI);
    const d = r * 1.6;
    const a = mid - 2;
    for (let t = -2 * Math.PI; ; t += 0.09) {
      const x = r * t - d * Math.sin(t);
      if (x > w + 4) break;
      push(x, mid - a * Math.cos(t));
    }
  } else if (variant === 'wave') {
    const P = 40;
    const a = Math.max(2, mid - 6);
    for (let x = 0; x <= w; x += 2) push(x, mid + a * Math.sin((x / P) * 2 * Math.PI));
  } else {
    for (let x = 0; x <= w; x += 3) push(x, mid + 1.3 * Math.sin(x / 31) + 0.8 * Math.sin(x / 13 + 1));
  }
  if (cur.length) segs.push(cur);
  return segs.map((s) => 'M' + s.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L'));
}

export function WavyDivider({ variant = 'loops', height = 28, color = 'var(--line-gold)', stroke = 1.6, ornament, ornamentColor, animate = false, style }) {
  const [ref, { w }] = useElementSize();
  const [on, setOn] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const el = ref.current;
    if (!('IntersectionObserver' in window)) {
      setOn(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [animate, ref]);
  const gap = ornament ? height * 0.9 : 0;
  const paths = w ? buildWave(variant, w, height, gap) : [];
  return (
    <div ref={ref} role="separator" style={{ position: 'relative', width: '100%', height, ...style }}>
      {w > 0 && (
        <svg width={w} height={height} style={{ display: 'block', overflow: 'visible' }} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
          {paths.map((d, i) => (
            <path
              key={i}
              d={d}
              pathLength="1"
              style={
                animate
                  ? { strokeDasharray: 1, strokeDashoffset: on ? 0 : 1, transition: 'stroke-dashoffset var(--dur-draw) var(--ease-soft)' }
                  : undefined
              }
            />
          ))}
        </svg>
      )}
      {ornament && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
            opacity: on ? 1 : 0,
            transition: 'opacity var(--dur-slow) var(--ease-soft) .6s',
          }}
        >
          <Doodle name={ornament} size={height * 1.35} color={ornamentColor || color} />
        </div>
      )}
    </div>
  );
}
