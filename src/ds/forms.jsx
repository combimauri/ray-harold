import { useId, useState } from 'react';
import { Icon } from './core.jsx';

const labelStyle = { fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 500, color: 'var(--text-primary)' };
const noteStyle = { fontFamily: 'var(--font-body)', fontSize: 14 };

/* ----------------------------------------------------------- ChoiceGroup */

export function ChoiceGroup({ label, options = [], value, onChange, columns = 1, name, error, style }) {
  const gid = useId();
  const [focused, setFocused] = useState(null);
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {label && <legend style={{ ...labelStyle, padding: 0, marginBottom: 10 }}>{label}</legend>}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`, gap: 10 }}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <label
              key={o.value}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                minHeight: 64,
                padding: '12px 18px',
                boxSizing: 'border-box',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid ' + (on ? 'var(--azul-900)' : error ? 'var(--error)' : 'var(--border-field)'),
                background: on ? 'var(--azul-50)' : 'var(--lino-50)',
                boxShadow: focused === o.value ? '0 0 0 4px rgba(86,112,154,.18)' : 'none',
                cursor: 'pointer',
                transition: 'background var(--dur-fast),border-color var(--dur-fast)',
              }}
            >
              <input
                type="radio"
                name={name || gid}
                value={o.value}
                checked={on}
                onChange={() => onChange && onChange(o.value)}
                onFocus={() => setFocused(o.value)}
                onBlur={() => setFocused(null)}
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1, margin: 0 }}
              />
              <span
                aria-hidden="true"
                style={{
                  flex: 'none',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  boxSizing: 'border-box',
                  border: '1.5px solid ' + (on ? 'var(--azul-900)' : 'var(--lino-400)'),
                  background: on ? 'var(--azul-900)' : 'transparent',
                  color: 'var(--lino-50)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                {on && <Icon name="check" size={16} stroke={2.2} />}
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 18, fontWeight: 500, lineHeight: 1.3, color: 'var(--text-primary)' }}>{o.label}</span>
                {o.hint && <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{o.hint}</span>}
              </span>
            </label>
          );
        })}
      </div>
      {error && <span style={{ ...noteStyle, color: 'var(--error)' }}>{error}</span>}
    </fieldset>
  );
}

/* --------------------------------------------------------------- Stepper */

export function Stepper({ label, value, defaultValue = 1, min = 1, max = 10, onChange, unit, hint, style }) {
  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const v = controlled ? value : inner;
  const set = (n) => {
    n = Math.max(min, Math.min(max, n));
    if (!controlled) setInner(n);
    if (onChange) onChange(n);
  };
  const btn = (disabled) => ({
    width: 52,
    height: 52,
    flex: 'none',
    borderRadius: '50%',
    border: '1.5px solid var(--azul-900)',
    background: 'var(--lino-50)',
    color: 'var(--azul-900)',
    display: 'grid',
    placeItems: 'center',
    padding: 0,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.3 : 1,
  });
  const u = Array.isArray(unit) ? (v === 1 ? unit[0] : unit[1]) : unit;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, ...style }}>
      {label && <span style={labelStyle}>{label}</span>}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '10px 12px',
          background: 'var(--lino-50)',
          border: '1.5px solid var(--border-field)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <button type="button" aria-label="Quitar uno" disabled={v <= min} onClick={() => set(v - 1)} style={btn(v <= min)}>
          <Icon name="minus" size={22} />
        </button>
        <div aria-live="polite" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 40, lineHeight: 1, color: 'var(--text-primary)', fontVariantNumeric: 'lining-nums' }}>
            {v}
          </div>
          {u && <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{u}</div>}
        </div>
        <button type="button" aria-label="Agregar uno" disabled={v >= max} onClick={() => set(v + 1)} style={btn(v >= max)}>
          <Icon name="plus" size={22} />
        </button>
      </div>
      {hint && <span style={{ ...noteStyle, color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}

/* ------------------------------------------------------------- TextField */

export function TextField({ label, value, defaultValue, onChange, placeholder, hint, error, type = 'text', name, multiline = false, rows = 3, autoComplete, disabled = false, style }) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const border = error ? 'var(--error)' : focused ? 'var(--azul-500)' : 'var(--border-field)';
  const props = {
    id,
    name,
    value,
    defaultValue,
    placeholder,
    disabled,
    autoComplete,
    onChange: (e) => onChange && onChange(e.target.value, e),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    'aria-invalid': error ? true : undefined,
    'aria-describedby': hint || error ? id + '-d' : undefined,
    style: {
      width: '100%',
      boxSizing: 'border-box',
      minHeight: multiline ? undefined : 58,
      padding: multiline ? '14px 18px' : '0 18px',
      fontFamily: 'var(--font-body)',
      fontSize: 19,
      lineHeight: 1.4,
      color: 'var(--text-primary)',
      background: 'var(--lino-50)',
      border: '1.5px solid ' + border,
      borderRadius: 'var(--radius-md)',
      outline: 'none',
      boxShadow: focused ? '0 0 0 4px rgba(86,112,154,.16)' : 'none',
      transition: 'border-color var(--dur-fast),box-shadow var(--dur-fast)',
      resize: 'vertical',
      opacity: disabled ? 0.6 : 1,
    },
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      {multiline ? <textarea rows={rows} {...props} /> : <input type={type} {...props} />}
      {(error || hint) && (
        <span id={id + '-d'} style={{ ...noteStyle, lineHeight: 1.4, color: error ? 'var(--error)' : 'var(--text-muted)' }}>
          {error || hint}
        </span>
      )}
    </div>
  );
}
