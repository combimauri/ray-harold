import { Fragment, useEffect, useState } from 'react';
import { Button, Doodle, Icon, IllustrationSlot } from './core.jsx';

const eyebrowStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontWeight: 500,
  letterSpacing: 'var(--tracking-caps)',
  textTransform: 'uppercase',
  color: 'var(--text-accent)',
};

/* ------------------------------------------------------------- Countdown */

export function Countdown({ target, labels = ['Días', 'Horas', 'Minutos', 'Segundos'], doneLabel = '¡Hoy es el gran día!', size = 'md', style }) {
  const t = new Date(target).getTime();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const s = Math.max(0, Math.floor((t - now) / 1000));
  if (!s) {
    return (
      <div style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--hand-lg)', textAlign: 'center', color: 'var(--azul-700)', ...style }}>
        {doneLabel}
      </div>
    );
  }
  const v = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
  const fs = size === 'sm' ? 34 : 48;
  return (
    <div
      role="timer"
      aria-label={v[0] + ' días restantes'}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: size === 'sm' ? 4 : 8, color: 'var(--text-primary)', ...style }}
    >
      {v.map((n, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span aria-hidden="true" style={{ fontFamily: 'var(--font-display)', fontSize: fs, lineHeight: 1, color: 'var(--oro-500)', transform: 'translateY(-.06em)' }}>
              :
            </span>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: fs * 1.35 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: fs, lineHeight: 1, fontVariantNumeric: 'tabular-nums lining-nums' }}>
              {String(n).padStart(2, '0')}
            </span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              {labels[i]}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------- NameGroup */

export function NameGroup({ title, people = [], joiner = '&', align = 'center', size = 'md', style }) {
  const fs = size === 'sm' ? 19 : 23;
  const c = align === 'center';
  const ps = people.map((p) => (typeof p === 'string' ? { name: p } : p));
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'flex-start', textAlign: c ? 'center' : 'left', gap: joiner ? 4 : 10, ...style }}
    >
      {title && <span style={{ ...eyebrowStyle, marginBottom: 6 }}>{title}</span>}
      {ps.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && joiner && (
            <span aria-hidden="true" style={{ fontFamily: 'var(--font-script)', fontSize: fs * 1.3, lineHeight: 0.9, color: 'var(--oro-600)' }}>
              {joiner}
            </span>
          )}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: fs,
              fontWeight: 500,
              letterSpacing: 'var(--tracking-names)',
              lineHeight: 1.25,
              color: 'var(--text-primary)',
              textWrap: 'balance',
            }}
          >
            {p.name}
            {p.deceased && (
              <span title="En memoria" aria-label="(en memoria)" style={{ color: 'var(--oro-600)', marginLeft: '.3em', fontWeight: 400 }}>
                †
              </span>
            )}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- NamesLockup */

const LOCKUP_SIZES = { md: 'var(--display-md)', lg: 'var(--display-lg)', xl: 'var(--display-xl)' };

export function NamesLockup({ first = 'Raysa', second = 'Harold', fullNames, size = 'lg', layout = 'stacked', color = 'var(--text-primary)', style }) {
  const fs = LOCKUP_SIZES[size] || LOCKUP_SIZES.lg;
  const stacked = layout === 'stacked';
  const name = { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: fs, lineHeight: 1, letterSpacing: '.01em', color };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18, ...style }}>
      <h1
        aria-label={first + ' y ' + second}
        style={{
          margin: 0,
          display: 'flex',
          flexDirection: stacked ? 'column' : 'row',
          alignItems: stacked ? 'center' : 'baseline',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <span style={name}>{first}</span>
        <span
          aria-hidden="true"
          style={{
            fontFamily: 'var(--font-script)',
            fontWeight: 400,
            fontSize: `calc(${fs} * 1.1)`,
            lineHeight: 0.7,
            color: 'var(--oro-600)',
            display: 'block',
            margin: stacked ? '.02em 0 .1em' : '0 .22em',
            transform: stacked ? 'translateX(.4em)' : 'translateY(.1em)',
          }}
        >
          &amp;
        </span>
        <span style={name}>{second}</span>
      </h1>
      {fullNames && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, ...eyebrowStyle, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <span>{fullNames[0]}</span>
          <span>{fullNames[1]}</span>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------- CalendarStrip */

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const WEEKDAYS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];

export function CalendarStrip({ date = '2026-11-14', highlight = 'outline', showMonth = true, caption, style }) {
  const [y, m, d] = date.split('-').map(Number);
  const dow = (new Date(y, m - 1, d).getDay() + 6) % 7;
  const days = Array.from({ length: 7 }, (_, i) => new Date(y, m - 1, d - dow + i).getDate());
  const filled = highlight === 'filled';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%', ...style }}>
      {showMonth && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-script)', fontSize: 'var(--script-sm)', lineHeight: 1, color: 'var(--azul-700)', padding: '0 .15em' }}>
            {MONTHS[m - 1]}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500, letterSpacing: 'var(--tracking-caps)', color: 'var(--text-accent)' }}>{y}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', width: '100%', maxWidth: 400 }}>
        {days.map((n, i) => {
          const sel = i === dow;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: sel ? 'var(--text-accent)' : 'var(--text-muted)',
                }}
              >
                {WEEKDAYS[i]}
              </span>
              <span style={{ position: 'relative', display: 'grid', placeItems: 'center', width: 44, height: 44 }}>
                {sel && (
                  <Doodle
                    name={filled ? 'heart' : 'heart-outline'}
                    size={64}
                    color={filled ? 'var(--azul-700)' : 'var(--oro-500)'}
                    stroke={2}
                    animate="beat"
                    style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -32, marginTop: -34 }}
                  />
                )}
                <span
                  style={{
                    position: 'relative',
                    fontFamily: 'var(--font-display)',
                    fontSize: sel ? 30 : 26,
                    fontWeight: sel ? 600 : 500,
                    lineHeight: 1,
                    color: sel && filled ? 'var(--lino-50)' : 'var(--text-primary)',
                    fontVariantNumeric: 'lining-nums',
                  }}
                >
                  {n}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      {caption && <div style={{ ...eyebrowStyle, fontSize: 14, color: 'var(--text-secondary)' }}>{caption}</div>}
    </div>
  );
}

/* ------------------------------------------------------------ PhotoFrame */

export function PhotoFrame({ src, alt = '', caption, variant = 'polaroid', rotate = -2, ratio = '4 / 5', width = '100%', placeholder = 'Foto de los novios', style }) {
  const pol = variant === 'polaroid';
  const tape = variant !== 'plain';
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = failedSrc === src;
  return (
    <figure
      style={{
        margin: 0,
        width,
        boxSizing: 'border-box',
        position: 'relative',
        transform: rotate ? `rotate(${rotate}deg)` : undefined,
        background: pol ? '#FFFDF8' : 'transparent',
        padding: pol ? '12px 12px 0' : 0,
        borderRadius: pol ? 4 : 'var(--radius-md)',
        boxShadow: tape ? 'var(--shadow-photo)' : 'none',
        ...style,
      }}
    >
      {tape && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -13,
            left: '50%',
            width: 100,
            height: 26,
            transform: 'translateX(-50%) rotate(-4deg)',
            background: 'rgba(224,200,145,.75)',
            boxShadow: '0 1px 2px rgba(80,60,25,.12)',
            zIndex: 1,
          }}
        />
      )}
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          onError={() => setFailedSrc(src)}
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: ratio,
            objectFit: 'cover',
            borderRadius: pol ? 2 : 'var(--radius-md)',
            filter: 'saturate(.92) sepia(.06)',
          }}
        />
      ) : (
        <div
          role="img"
          aria-label={placeholder}
          style={{
            width: '100%',
            aspectRatio: ratio,
            borderRadius: pol ? 2 : 'var(--radius-md)',
            background: 'var(--lino-200)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            color: 'var(--azul-600)',
          }}
        >
          <Doodle name="heart-outline" size={32} color="var(--oro-500)" />
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 18 }}>{placeholder}</span>
        </div>
      )}
      {(caption || pol) && (
        <figcaption
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: 22,
            lineHeight: 1.2,
            textAlign: 'center',
            color: 'var(--azul-700)',
            padding: pol ? '12px 4px 16px' : '12px 0 0',
            minHeight: pol ? 48 : undefined,
            boxSizing: 'border-box',
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ----------------------------------------------------------- ScriptTitle */

const SCRIPT_SIZES = { sm: 'var(--script-sm)', md: 'var(--script-md)', lg: 'var(--script-lg)' };

export function ScriptTitle({ eyebrow, children, size = 'md', align = 'center', ornament, color = 'var(--azul-700)', as: Tag = 'h2', style }) {
  const c = align === 'center';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'flex-start', textAlign: align, gap: 0, ...style }}>
      {eyebrow && <span style={eyebrowStyle}>{eyebrow}</span>}
      <Tag
        style={{
          margin: 0,
          fontFamily: 'var(--font-script)',
          fontWeight: 400,
          fontSize: SCRIPT_SIZES[size] || SCRIPT_SIZES.md,
          lineHeight: 1.2,
          color,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 .2em',
        }}
      >
        {children}
        {ornament && <Doodle name={ornament} size={24} color="var(--oro-500)" style={{ marginTop: -10 }} />}
      </Tag>
    </div>
  );
}

/* --------------------------------------------------------------- InfoRow */

export function InfoRow({ icon = 'pin', label, children, action, align = 'left', style }) {
  const c = align === 'center';
  return (
    <div
      style={{ display: 'flex', flexDirection: c ? 'column' : 'row', alignItems: c ? 'center' : 'flex-start', textAlign: c ? 'center' : 'left', gap: c ? 10 : 16, ...style }}
    >
      <span
        style={{ flex: 'none', width: 48, height: 48, borderRadius: '50%', background: 'var(--azul-50)', color: 'var(--azul-700)', display: 'grid', placeItems: 'center' }}
      >
        <Icon name={icon} size={22} />
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: c ? 'center' : 'flex-start', gap: 3, minWidth: 0, paddingTop: c ? 0 : 2 }}>
        {label && <span style={eyebrowStyle}>{label}</span>}
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 18, lineHeight: 1.45, color: 'var(--text-primary)', textWrap: 'pretty' }}>{children}</div>
        {action && <div style={{ marginTop: 10 }}>{action}</div>}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Timeline */

export function Timeline({ items = [], style }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', ...style }}>
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <li key={i} style={{ display: 'grid', gridTemplateColumns: '62px 18px minmax(0,1fr)', columnGap: 14 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 23,
                lineHeight: 1,
                paddingTop: 17,
                textAlign: 'right',
                color: 'var(--text-primary)',
                fontVariantNumeric: 'tabular-nums lining-nums',
              }}
            >
              {it.time}
            </span>
            <span aria-hidden="true" style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: 8,
                  top: i ? 0 : 28,
                  bottom: last ? undefined : 0,
                  height: last ? 28 : undefined,
                  borderLeft: '1.5px dashed var(--azul-300)',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 2,
                  top: 22,
                  width: 13,
                  height: 13,
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                  background: 'var(--lino-50)',
                  border: '2px solid var(--oro-500)',
                }}
              />
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, padding: '0 0 18px' }}>
              {it.icon && (
                <span
                  style={{
                    flex: 'none',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: 'var(--lino-50)',
                    border: '1px solid var(--border-hairline)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--azul-700)',
                  }}
                >
                  {typeof it.icon === 'string' ? <Icon name={it.icon} size={24} /> : it.icon}
                </span>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, lineHeight: 1.3, color: 'var(--text-primary)' }}>{it.title}</span>
                {it.note && <span style={{ fontSize: 14, lineHeight: 1.4, color: 'var(--text-muted)' }}>{it.note}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* --------------------------------------------------------------- MapCard */

export function MapCard({ href, embedSrc, embedTitle, illustration, title, address, buttonLabel = 'Abrir en Google Maps', style }) {
  let media;
  if (embedSrc) {
    media = (
      <iframe
        src={embedSrc}
        title={embedTitle || title || 'Mapa'}
        loading="lazy"
        allowFullScreen
        style={{ border: 0, width: '100%', height: '100%', display: 'block', filter: 'sepia(.2) saturate(.85)' }}
      />
    );
  } else if (typeof illustration === 'string') {
    media = <IllustrationSlot src={illustration} ratio="4 / 3" style={{ height: '100%', objectFit: 'cover' }} />;
  } else {
    media = illustration || (
      <IllustrationSlot label="Mapa ilustrado o fachada del lugar" ratio="auto" style={{ height: '100%', border: 'none', borderRadius: 0 }} />
    );
  }
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--oro-400)',
        padding: 10,
        boxShadow: 'var(--shadow-paper)',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '4 / 3', background: 'var(--lino-200)' }}>{media}</div>
      {(title || address) && (
        <div style={{ padding: '0 10px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {title && <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600, lineHeight: 1.15, color: 'var(--text-primary)' }}>{title}</span>}
          {address && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.45, color: 'var(--text-secondary)', textWrap: 'pretty' }}>{address}</span>
          )}
        </div>
      )}
      {href && (
        <div style={{ padding: '0 6px 6px' }}>
          <Button href={href} target="_blank" fullWidth icon="pin" iconRight="external">
            {buttonLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
