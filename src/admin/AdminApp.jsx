import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '../ds/core.jsx';
import { GROUPS, addGuest, changePassword, deleteGuest, guestLink, login, logout, requestPasswordReset, updateGuest, watchAdmin, watchGuests } from './api.js';
import './admin.css';

const GROUP_LABEL = Object.fromEntries(GROUPS.map((g) => [g.value, g.label]));
const GROUP_ORDER = Object.fromEntries(GROUPS.map((g, i) => [g.value, i]));

const STATUS = {
  yes: { label: 'Asiste', cls: 'is-yes' },
  no: { label: 'No asiste', cls: 'is-no' },
  pending: { label: 'Pendiente', cls: 'is-pending' },
};

const statusOf = (g) => (!g.rsvp ? 'pending' : g.rsvp.asiste ? 'yes' : 'no');

function authMessage(err) {
  switch (err?.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet.';
    case 'auth/weak-password':
      return 'La nueva contraseña es demasiado débil.';
    default:
      return 'Algo salió mal. Inténtalo de nuevo.';
  }
}

/* ------------------------------------------------------------------ Gate */

export default function AdminApp() {
  const [session, setSession] = useState(null); // null while loading

  useEffect(() => {
    document.title = 'Invitados · Raysa & Harold';
    return watchAdmin(setSession);
  }, []);

  let content;
  if (!session) content = null;
  else if (!session.user) content = <Login />;
  else if (!session.isAdmin) content = <NotAdmin email={session.user.email} />;
  else content = <Dashboard email={session.user.email} />;

  return <div className="adm">{content}</div>;
}

function Login() {
  const [mode, setMode] = useState('login'); // login | reset | sent
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const go = (next) => {
    setMode(next);
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'reset') {
        await requestPasswordReset(email);
        setMode('sent');
      } else {
        await login(email, password);
        return; // AdminApp swaps this screen out
      }
    } catch (err) {
      setError(mode === 'reset' && err?.code !== 'auth/invalid-email' ? 'No pudimos enviar el enlace. Inténtalo de nuevo.' : authMessage(err));
    }
    setBusy(false);
  };

  const heading = (
    <div>
      <div className="adm-eyebrow">Raysa &amp; Harold</div>
      <h1 className="adm-title">{mode === 'login' ? 'Invitados' : 'Contraseña'}</h1>
    </div>
  );

  if (mode === 'sent') {
    return (
      <div className="adm-login">
        <form onSubmit={(e) => e.preventDefault()}>
          {heading}
          <p style={{ margin: 0, textWrap: 'pretty' }}>
            Si <b>{email.trim()}</b> tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Ábrelo desde tu correo para confirmar el cambio.
          </p>
          <p className="adm-muted" style={{ margin: 0 }}>
            Puede tardar unos minutos; revisa también la carpeta de spam.
          </p>
          <Button fullWidth onClick={() => go('login')}>
            Volver a iniciar sesión
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="adm-login">
      <form onSubmit={submit}>
        {heading}
        {mode === 'reset' && (
          <p style={{ margin: 0, textWrap: 'pretty' }}>Escribe tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
        )}
        <label className="adm-field" style={{ textAlign: 'left' }}>
          Correo
          <input className="adm-input" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode === 'login' && (
          <label className="adm-field" style={{ textAlign: 'left' }}>
            Contraseña
            <input className="adm-input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
        )}
        {error && <div className="adm-error">{error}</div>}
        <Button type="submit" fullWidth disabled={busy}>
          {mode === 'reset' ? (busy ? 'Enviando…' : 'Enviar enlace') : busy ? 'Entrando…' : 'Entrar'}
        </Button>
        <button type="button" className="adm-text-btn" onClick={() => go(mode === 'login' ? 'reset' : 'login')}>
          {mode === 'login' ? '¿Olvidaste tu contraseña?' : 'Volver a iniciar sesión'}
        </button>
      </form>
    </div>
  );
}

function NotAdmin({ email }) {
  return (
    <div className="adm-login">
      <form onSubmit={(e) => e.preventDefault()}>
        <h1 className="adm-title">Sin acceso</h1>
        <p style={{ margin: 0 }}>
          La cuenta <b>{email}</b> no tiene permiso para ver esta página.
        </p>
        <Button variant="outline" fullWidth onClick={logout}>
          Cerrar sesión
        </Button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------- Dashboard */

function Dashboard({ email }) {
  const [guests, setGuests] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); // guest, {} for new, or null
  const [changingPassword, setChangingPassword] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => watchGuests(setGuests, () => setLoadError('No se pudo cargar la lista de invitados.')), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const sorted = useMemo(
    () => (guests || []).slice().sort((a, b) => (GROUP_ORDER[a.grupo] ?? 9) - (GROUP_ORDER[b.grupo] ?? 9) || a.orden - b.orden),
    [guests],
  );

  const stats = useMemo(() => {
    const s = { invitations: sorted.length, seats: 0, yes: 0, yesPeople: 0, no: 0, pending: 0, pendingSeats: 0 };
    for (const g of sorted) {
      s.seats += g.pases;
      const st = statusOf(g);
      if (st === 'yes') {
        s.yes++;
        s.yesPeople += g.rsvp.personas;
      } else if (st === 'no') s.no++;
      else {
        s.pending++;
        s.pendingSeats += g.pases;
      }
    }
    return s;
  }, [sorted]);

  const visible = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    return sorted.filter(
      (g) =>
        (!group || g.grupo === group) &&
        (!status || statusOf(g) === status) &&
        (!q ||
          g.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .includes(q)),
    );
  }, [sorted, query, group, status]);

  const copyLink = async (g) => {
    try {
      await navigator.clipboard.writeText(guestLink(g.id));
      setToast(`Enlace de ${g.nombre} copiado`);
    } catch {
      setToast(guestLink(g.id));
    }
  };

  const downloadCsv = () => {
    const esc = (v) => `"${String(v ?? '').replaceAll('"', '""')}"`;
    const rows = [['Grupo', 'Nombre', 'Pases', 'Respuesta', 'Personas', 'Mensaje', 'Respondido', 'Enlace']];
    for (const g of sorted) {
      rows.push([
        GROUP_LABEL[g.grupo] || g.grupo,
        g.nombre,
        g.pases,
        STATUS[statusOf(g)].label,
        g.rsvp ? g.rsvp.personas : '',
        g.rsvp?.mensaje,
        g.rsvp?.respondidoEn?.toDate().toLocaleString('es-BO'),
        guestLink(g.id),
      ]);
    }
    const blob = new Blob(['﻿' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invitados-raysa-harold.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const nextOrden = (grupo) => Math.max(0, ...sorted.filter((g) => g.grupo === grupo).map((g) => g.orden)) + 1;

  return (
    <div className="adm-wrap">
      <header className="adm-header">
        <div>
          <div className="adm-eyebrow">Raysa &amp; Harold · 14.11.2026</div>
          <h1 className="adm-title">Invitados</h1>
        </div>
        <div className="adm-account">
          <span>{email}</span>
          <button type="button" className="adm-text-btn" onClick={() => setChangingPassword(true)}>
            Cambiar contraseña
          </button>
          <button type="button" className="adm-text-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <section className="adm-stats" aria-label="Resumen">
        <div className="adm-stat">
          <span>Invitaciones</span>
          <b>{stats.invitations}</b>
          <small>{stats.seats} pases en total</small>
        </div>
        <div className="adm-stat is-yes">
          <span>Asisten</span>
          <b>{stats.yesPeople}</b>
          <small>
            personas · {stats.yes} {stats.yes === 1 ? 'invitación' : 'invitaciones'}
          </small>
        </div>
        <div className="adm-stat is-no">
          <span>No asisten</span>
          <b>{stats.no}</b>
          <small>{stats.no === 1 ? 'invitación' : 'invitaciones'}</small>
        </div>
        <div className="adm-stat is-pending">
          <span>Pendientes</span>
          <b>{stats.pending}</b>
          <small>{stats.pendingSeats} pases sin responder</small>
        </div>
      </section>

      <div className="adm-toolbar">
        <input className="adm-input adm-search" type="search" placeholder="Buscar por nombre…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Buscar" />
        <select className="adm-select" value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Grupo">
          <option value="">Todos los grupos</option>
          {GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
        <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Respuesta">
          <option value="">Todas las respuestas</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v.label}
            </option>
          ))}
        </select>
        <div className="adm-toolbar-actions">
          <Button variant="outline" size="sm" icon="download" onClick={downloadCsv} disabled={!sorted.length}>
            CSV
          </Button>
          <Button size="sm" icon="plus" onClick={() => setEditing({})}>
            Agregar invitado
          </Button>
        </div>
      </div>

      <div className="adm-card">
        {loadError ? (
          <div className="adm-empty adm-error">{loadError}</div>
        ) : !guests ? (
          <div className="adm-empty">Cargando…</div>
        ) : !visible.length ? (
          <div className="adm-empty">{sorted.length ? 'Ningún invitado coincide con el filtro.' : 'Todavía no hay invitados.'}</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Invitado</th>
                <th>Grupo</th>
                <th>Pases</th>
                <th>Respuesta</th>
                <th>Personas</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => (
                <GuestRow key={g.id} guest={g} onCopy={copyLink} onEdit={setEditing} onDeleted={(n) => setToast(`${n} eliminado`)} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <GuestDialog
          guest={editing.id ? editing : null}
          defaultGroup={group || 'raysa'}
          nextOrden={nextOrden}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            setToast(msg);
          }}
        />
      )}
      {changingPassword && (
        <PasswordDialog
          onClose={() => setChangingPassword(false)}
          onSaved={() => {
            setChangingPassword(false);
            setToast('Contraseña actualizada');
          }}
        />
      )}
      {toast && (
        <div className="adm-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function GuestRow({ guest: g, onCopy, onEdit, onDeleted }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const st = STATUS[statusOf(g)];

  const remove = async () => {
    setBusy(true);
    try {
      await deleteGuest(g.id);
      onDeleted(g.nombre);
    } catch {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <tr>
      <td data-col="nombre">
        <div className="adm-name">{g.nombre}</div>
        {g.rsvp?.mensaje && <div className="adm-msg">“{g.rsvp.mensaje}”</div>}
      </td>
      <td data-col="grupo">
        <span className="adm-group">{GROUP_LABEL[g.grupo] || g.grupo}</span>
      </td>
      <td data-col="pases" data-label="Pases">
        <span className="adm-num">{g.pases}</span>
      </td>
      <td data-col="respuesta">
        <span className={`adm-badge ${st.cls}`}>{st.label}</span>
      </td>
      <td data-col="personas" data-label="Personas">
        {g.rsvp?.asiste ? <span className="adm-num">{g.rsvp.personas}</span> : <span className="adm-muted">—</span>}
      </td>
      <td data-col="actions">
        {confirming ? (
          <span className="adm-confirm">
            ¿Eliminar?
            <button type="button" className="adm-text-btn is-danger" onClick={remove} disabled={busy}>
              {busy ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
            <button type="button" className="adm-text-btn" onClick={() => setConfirming(false)} disabled={busy}>
              Cancelar
            </button>
          </span>
        ) : (
          <div className="adm-actions">
            <button type="button" className="adm-icon-btn" title="Copiar enlace" aria-label={`Copiar enlace de ${g.nombre}`} onClick={() => onCopy(g)}>
              <Icon name="link" size={20} />
            </button>
            <button type="button" className="adm-icon-btn" title="Editar" aria-label={`Editar ${g.nombre}`} onClick={() => onEdit(g)}>
              <Icon name="edit" size={20} />
            </button>
            <button type="button" className="adm-icon-btn is-danger" title="Eliminar" aria-label={`Eliminar ${g.nombre}`} onClick={() => setConfirming(true)}>
              <Icon name="trash" size={20} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

/* --------------------------------------------------------------- Dialogs */

function Dialog({ title, onClose, onSubmit, busy, submitLabel, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    d.showModal();
    return () => d.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="adm-dialog"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <h2>{title}</h2>
        {children}
        <div className="adm-dialog-actions">
          <Button variant="soft" size="sm" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={busy}>
            {busy ? 'Guardando…' : submitLabel}
          </Button>
        </div>
      </form>
    </dialog>
  );
}

function GuestDialog({ guest, defaultGroup, nextOrden, onClose, onSaved }) {
  const [nombre, setNombre] = useState(guest?.nombre || '');
  const [pases, setPases] = useState(String(guest?.pases || 1));
  const [grupo, setGrupo] = useState(guest?.grupo || defaultGroup);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const n = parseInt(pases, 10);
  const shrinksRsvp = guest?.rsvp?.asiste && n < guest.rsvp.personas;

  const save = async () => {
    if (!nombre.trim()) return setError('Escribe el nombre del invitado.');
    if (!(n >= 1 && n <= 20)) return setError('Los pases deben estar entre 1 y 20.');
    setBusy(true);
    setError('');
    try {
      const data = { nombre, pases: n, grupo };
      if (guest) {
        await updateGuest(guest, data);
        onSaved('Cambios guardados');
      } else {
        await addGuest(data, nextOrden(grupo));
        onSaved(`${nombre.trim()} agregado`);
      }
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.');
      setBusy(false);
    }
  };

  return (
    <Dialog title={guest ? 'Editar invitado' : 'Nuevo invitado'} onClose={onClose} onSubmit={save} busy={busy} submitLabel={guest ? 'Guardar' : 'Agregar'}>
      <label className="adm-field">
        Nombre como aparece en la invitación
        <input className="adm-input" value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={120} placeholder="Sr. Juan Pérez y Sra." autoFocus />
      </label>
      <label className="adm-field">
        Pases
        <input className="adm-input" type="number" inputMode="numeric" min={1} max={20} value={pases} onChange={(e) => setPases(e.target.value)} />
        {shrinksRsvp && <small>Confirmó {guest.rsvp.personas} personas; se ajustará a {n}.</small>}
      </label>
      <label className="adm-field">
        Grupo
        <select className="adm-select" value={grupo} onChange={(e) => setGrupo(e.target.value)}>
          {GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      {!guest && <small className="adm-muted">Se creará un enlace personal que podrás copiar desde la lista.</small>}
      {error && <div className="adm-error">{error}</div>}
    </Dialog>
  );
}

function PasswordDialog({ onClose, onSaved }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (next.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
    if (next !== repeat) return setError('Las contraseñas nuevas no coinciden.');
    if (next === current) return setError('La nueva contraseña debe ser distinta de la actual.');
    setBusy(true);
    setError('');
    try {
      await changePassword(current, next);
      onSaved();
    } catch (err) {
      setError(err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password' ? 'La contraseña actual no es correcta.' : authMessage(err));
      setBusy(false);
    }
  };

  return (
    <Dialog title="Cambiar contraseña" onClose={onClose} onSubmit={save} busy={busy} submitLabel="Actualizar">
      <label className="adm-field">
        Contraseña actual
        <input className="adm-input" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} autoFocus />
      </label>
      <label className="adm-field">
        Nueva contraseña
        <input className="adm-input" type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} />
        <small>Mínimo 8 caracteres.</small>
      </label>
      <label className="adm-field">
        Repite la nueva contraseña
        <input className="adm-input" type="password" autoComplete="new-password" required value={repeat} onChange={(e) => setRepeat(e.target.value)} />
      </label>
      {error && <div className="adm-error">{error}</div>}
    </Dialog>
  );
}
