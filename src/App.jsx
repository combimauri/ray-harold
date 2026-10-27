import { useEffect, useRef, useState } from 'react';
import { Button, Doodle, Icon, IllustrationSlot, MusicToggle, Reveal, SquiggleFrame, WavyDivider } from './ds/core.jsx';
import { CalendarStrip, Countdown, InfoRow, MapCard, NameGroup, NamesLockup, PhotoFrame, ScriptTitle, Timeline } from './ds/content.jsx';
import { ChoiceGroup, Stepper, TextField } from './ds/forms.jsx';
import { fetchGuest, saveRsvp } from './firebase.js';

const IMG = {
  ilusPortada: '/assets/ilus-portada.webp',
  ilusSaludando: '/assets/ilus-bienvenida.webp',
  ilusPastel: '/assets/ilus-torta.webp',
  fotoOutro: '/assets/foto-tortoni.jpg',
};

const BRIDE_PARENTS = ['Aida Campos Arias'];
const GROOM_PARENTS = [{ name: 'Willma Norma Estrada Salinas', deceased: true }, 'Jaime Remy Rojas Arze'];
const ALL_PARENTS = [...BRIDE_PARENTS, ...GROOM_PARENTS];
const FAMILY = [
  'José Christhian Herbas Campos y Karla Escobar',
  'Cristian Marcelo Rojas Estrada',
  'Romeo Rojas Estrada y Silvana Avilés',
  'Randy Rojas Estrada',
  'Megan Rojas Solis',
];
const ITINERARY = [
  { time: '16:30', title: 'Recepción', icon: 'arch' },
  { time: '17:00', title: 'Ceremonia civil', icon: 'rings' },
  { time: '17:30', title: 'Primer baile como esposos', icon: 'music' },
  { time: '17:45', title: 'Brindis', icon: 'glasses' },
  { time: '18:30', title: 'Cena', icon: 'dinner' },
  { time: '19:30', title: 'Fiesta', icon: 'disco' },
];
const CHOICE_OPTIONS = [
  { value: 'si', label: 'Sí, asistiré' },
  { value: 'no', label: 'No podré asistir' },
];
const UNIT_LABELS = ['persona', 'personas'];
// Each guest gets a personal link: /?i=<id> (see scripts/enlaces.csv).
function useGuest() {
  const [id] = useState(() => new URLSearchParams(window.location.search).get('i'));
  const [state, setState] = useState(() => ({ status: id ? 'loading' : 'missing', guest: null }));
  useEffect(() => {
    if (!id) return;
    let alive = true;
    fetchGuest(id)
      .then((guest) => alive && setState({ status: guest ? 'ready' : 'missing', guest }))
      .catch(() => alive && setState({ status: 'error', guest: null }));
    return () => {
      alive = false;
    };
  }, [id]);
  return state;
}

const sectionStyle = {
  padding: 'var(--space-9) var(--gutter)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 'var(--space-6)',
  textAlign: 'center',
};

const cardStyle = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'var(--surface-card)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-paper)',
  padding: '32px 22px',
};

function Divider() {
  return (
    <div style={{ padding: '0 var(--gutter)' }}>
      <WavyDivider animate />
    </div>
  );
}

function Cover({ nombre, stage, onOpen }) {
  return (
    <section
      data-screen-label="01 Portada"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--lino-200)',
        transition: 'transform 1.1s var(--ease-curtain)',
        transform: stage === 'opening' ? 'translateY(-100%)' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--content-max)',
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          background: 'var(--texture-paper),var(--surface-page)',
          boxShadow: 'var(--shadow-lift)',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px var(--gutter)',
          textAlign: 'center',
        }}
      >
        <div style={{ margin: 'auto 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--hand-lg)', color: 'var(--oro-700)', lineHeight: 1, minHeight: '1em' }}>
            {nombre ? `Hola, ${nombre}` : '¡Hola!'}
          </span>
          <IllustrationSlot src={IMG.ilusPortada} alt="Raysa y Harold corriendo con copas" ratio="1100 / 1200" width="min(72%,300px)" />
          <NamesLockup first="Raysa" second="Harold" size="lg" />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, letterSpacing: '.14em' }}>14 · 11 · 2026</span>
          <Button size="lg" iconRight="arrow" onClick={onOpen}>
            Abrir invitación
          </Button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
            <Icon name="music" size={16} />
            Con música, sube el volumen
          </span>
        </div>
      </div>
    </section>
  );
}

function Rsvp({ guest }) {
  const saved = guest.rsvp;
  const [ans, setAns] = useState(saved ? (saved.asiste ? 'si' : 'no') : '');
  const [n, setN] = useState(saved?.asiste ? saved.personas : guest.pases);
  const [msg, setMsg] = useState(saved?.mensaje || '');
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(!!saved);

  const count = Math.min(n, guest.pases);

  const submit = async (e) => {
    e.preventDefault();
    if (!ans) {
      setErr('Elige una opción para continuar.');
      return;
    }
    setSending(true);
    try {
      await saveRsvp(guest.id, { asiste: ans === 'si', personas: count, mensaje: msg.trim() });
      setDone(true);
    } catch {
      setErr('No pudimos enviar tu respuesta. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => setDone(false);

  if (done) {
    return (
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
        <Doodle name="heart" size={44} color="var(--oro-500)" animate="beat" />
        <span style={{ fontFamily: 'var(--font-script)', fontSize: 'var(--script-md)', lineHeight: 1.1, color: 'var(--azul-700)' }}>¡Gracias, {guest.nombre}!</span>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, textWrap: 'pretty' }}>
          {ans === 'si' ? 'Ya te anotamos. Te esperamos el 14 de noviembre a las 16:30.' : 'Gracias por avisarnos. Te vamos a extrañar.'}
        </p>
        <Button variant="link" onClick={reset}>
          Cambiar mi respuesta
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ ...cardStyle, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5 }}>
        Hola, <b style={{ fontWeight: 600 }}>{guest.nombre}</b>. Tu invitación es para:
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '18px 16px 16px',
          border: '2px dashed var(--oro-500)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--surface-page)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 600, lineHeight: 1, color: 'var(--oro-700)' }}>{guest.pases}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 500, letterSpacing: '.22em', textTransform: 'uppercase' }}>
          {guest.pases === 1 ? 'persona' : 'personas'}
        </span>
      </div>
      <ChoiceGroup
        value={ans}
        onChange={(v) => {
          setAns(v);
          setErr('');
        }}
        error={err}
        options={CHOICE_OPTIONS}
      />
      {ans === 'si' && guest.pases > 1 && (
        <Stepper label="¿Cuántas personas asistirán?" value={count} onChange={setN} max={guest.pases} unit={UNIT_LABELS} />
      )}
      <TextField label="Mensaje para los novios (opcional)" multiline rows={2} value={msg} onChange={setMsg} />
      <Button type="submit" variant="gold" size="lg" fullWidth disabled={sending}>
        {sending ? 'Enviando…' : 'Enviar confirmación'}
      </Button>
    </form>
  );
}

function RsvpUnavailable({ status }) {
  const text = {
    loading: 'Cargando tu invitación…',
    missing: 'Para confirmar tu asistencia, abre el enlace personal que te enviamos.',
    error: 'No pudimos cargar tu invitación. Revisa tu conexión y recarga la página.',
  }[status];
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <Doodle name="heart-outline" size={36} color="var(--oro-500)" />
      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.5, textWrap: 'pretty' }}>{text}</p>
    </div>
  );
}

export default function App() {
  const { status, guest } = useGuest();
  const nombre = guest?.nombre;
  const [stage, setStage] = useState('cover'); // cover → opening → open
  const [music, setMusic] = useState(false);
  const timer = useRef();

  useEffect(() => {
    document.body.style.overflow = stage === 'open' ? '' : 'hidden';
  }, [stage]);

  useEffect(
    () => () => {
      document.body.style.overflow = '';
      clearTimeout(timer.current);
    },
    [],
  );

  const openInvitation = () => {
    setMusic(true);
    setStage('opening');
    timer.current = setTimeout(() => setStage('open'), 1150);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--lino-200)' }}>
      {stage !== 'open' && <Cover nombre={nombre} stage={stage} onOpen={openInvitation} />}

      <main
        style={{
          maxWidth: 'var(--content-max)',
          margin: '0 auto',
          minHeight: '100vh',
          background: 'var(--texture-paper),var(--surface-page)',
          boxShadow: 'var(--shadow-lift)',
          overflow: 'hidden',
        }}
      >
        <section data-screen-label="02 Invitación" style={{ ...sectionStyle, padding: 'var(--space-8) var(--gutter) var(--space-9)' }}>
          {nombre && (
            <Reveal>
              <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--hand-lg)', color: 'var(--oro-700)' }}>Para: {nombre}</span>
            </Reveal>
          )}
          <Reveal delay={100} style={{ width: 'min(80%,300px)' }}>
            <IllustrationSlot src={IMG.ilusSaludando} alt="Raysa y Harold saludando con copas" ratio="1100 / 1357" />
          </Reveal>
          <Reveal delay={150}>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.35, color: 'var(--text-secondary)', textWrap: 'balance' }}>
              Con la bendición de Dios y de nuestros padres
            </p>
          </Reveal>
          <Reveal delay={200} style={{ width: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
              <NameGroup title="De la novia" people={BRIDE_PARENTS} size="sm" />
              <NameGroup title="Del novio" people={GROOM_PARENTS} size="sm" />
            </div>
          </Reveal>
          <WavyDivider ornament="heart" animate style={{ maxWidth: 320, width: '100%' }} />
          <Reveal>
            <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 25, lineHeight: 1.45, textWrap: 'pretty' }}>
              Hay días que se esperan toda la vida. El nuestro es el 14 de noviembre, y no queremos vivirlo sin ti. Ven a celebrar con nosotros el comienzo
              de nuestra historia juntos.
            </p>
          </Reveal>
        </section>

        <Divider />

        <section data-screen-label="03 Guarda la fecha" style={sectionStyle}>
          <Reveal>
            <ScriptTitle eyebrow="Guarda la fecha" ornament="sparkle">
              Nos casamos
            </ScriptTitle>
          </Reveal>
          <Reveal delay={100} style={{ width: '100%' }}>
            <CalendarStrip date="2026-11-14" caption="Sábado · 16:30" />
          </Reveal>
          <Reveal delay={150} style={{ width: '100%' }}>
            <SquiggleFrame padding="36px 12px 30px">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--hand-md)', color: 'var(--oro-700)' }}>Solo faltan…</span>
                <Countdown target="2026-11-14T16:30:00-04:00" />
              </div>
            </SquiggleFrame>
          </Reveal>
        </section>

        <Divider />

        <section data-screen-label="04 Lugar y fecha" style={sectionStyle}>
          <Reveal>
            <ScriptTitle eyebrow="¿Dónde y cuándo?">Lugar y fecha</ScriptTitle>
          </Reveal>
          <Reveal delay={100} style={{ width: '100%' }}>
            <MapCard
              href="https://maps.app.goo.gl/GvFF4X1y6FjV557f9"
              embedSrc="https://maps.google.com/maps?q=-17.418519,-66.161375&z=17&hl=es&output=embed"
              embedTitle="Mapa del lugar de la boda"
              address="Calle Junatas #2556, entre Isiboro y Anzaldo"
            />
          </Reveal>
          <Reveal delay={150} style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left', padding: '0 8px' }}>
              <InfoRow icon="calendar" label="Fecha">
                Sábado 14 de noviembre de 2026
              </InfoRow>
              <InfoRow icon="clock" label="Hora">
                16:30
              </InfoRow>
              <InfoRow icon="bus" label="Transporte">
                Líneas 250 y 233
              </InfoRow>
            </div>
          </Reveal>
        </section>

        <Divider />

        <section data-screen-label="05 Itinerario" style={sectionStyle}>
          <Reveal>
            <ScriptTitle eyebrow="El programa">Itinerario</ScriptTitle>
          </Reveal>
          <Reveal delay={100} style={{ width: '100%', textAlign: 'left' }}>
            <Timeline items={ITINERARY} />
          </Reveal>
        </section>

        <Divider />

        <section id="confirmar" data-screen-label="06 Confirma tu asistencia" style={sectionStyle}>
          <Reveal>
            <ScriptTitle eyebrow="Confirma tu asistencia">¿Nos acompañas?</ScriptTitle>
          </Reveal>
          <Reveal delay={100} style={{ width: '100%' }}>
            {status === 'ready' ? <Rsvp guest={guest} /> : <RsvpUnavailable status={status} />}
          </Reveal>
        </section>

        <Divider />

        <section data-screen-label="07 Agradecimientos" style={sectionStyle}>
          <Reveal>
            <ScriptTitle eyebrow="Agradecimientos">Gracias</ScriptTitle>
          </Reveal>
          <Reveal delay={80} style={{ width: 'min(88%,360px)' }}>
            <IllustrationSlot src={IMG.ilusPastel} alt="Raysa y Harold cortando el pastel" ratio="1100 / 1146" />
          </Reveal>
          <Reveal delay={120}>
            <NameGroup title="A nuestros padres" people={ALL_PARENTS} joiner={null} size="sm" />
          </Reveal>
          <Reveal delay={160}>
            <NameGroup title="A nuestra familia" people={FAMILY} joiner={null} size="sm" />
          </Reveal>
        </section>

        <section data-screen-label="08 Outro" style={{ ...sectionStyle, padding: 'var(--space-9) var(--gutter) var(--space-10)' }}>
          <Reveal style={{ width: 'min(78%,300px)' }}>
            <PhotoFrame src={IMG.fotoOutro} alt="Raysa y Harold bailando en el Café Tortoni" caption="Con amor" rotate={-2.5} ratio="3 / 4" />
          </Reveal>
          <Reveal delay={120}>
            <NamesLockup first="Raysa" second="Harold" size="md" layout="inline" />
          </Reveal>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '.14em', color: 'var(--text-secondary)' }}>14 · 11 · 2026</span>
          <WavyDivider variant="wave" height={18} color="var(--azul-300)" style={{ maxWidth: 180, width: '100%' }} />
        </section>
      </main>

      <MusicToggle
        videoId="eboMR2piiiI"
        playing={music}
        onChange={setMusic}
        fixed
        style={{
          right: 'max(16px, calc((100vw - 480px) / 2 + 16px))',
          opacity: stage === 'cover' ? 0 : 1,
          pointerEvents: stage === 'cover' ? 'none' : 'auto',
          transition: 'opacity .6s',
        }}
      />
    </div>
  );
}
