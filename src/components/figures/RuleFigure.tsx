import type { FigureId } from '../../data/types';

/*
 * Учебные схемы для раздела «Правила», нарисованные вектором (SVG).
 * Оригинальные растровые рисунки из PDF не извлекаются, поэтому диаграммы
 * воссозданы заново — чёткие, масштабируются со шрифтом, адаптируются под
 * светлую/тёмную морскую тему через Tailwind-классы заливки и обводки.
 */

const TXT = 'fill-ink';
const TXT_MUTED = 'fill-muted';
const STROKE = 'stroke-ink';

export function RuleFigure({ figure }: { figure: FigureId }) {
  switch (figure) {
    case 'ship-anatomy':
      return <ShipAnatomy />;
    case 'stability-states':
      return <StabilityStates />;
    case 'nav-lights':
      return <NavLights />;
    case 'crossing':
      return <Crossing />;
    case 'fire-steps':
      return <FireSteps />;
    case 'cpr':
      return <Cpr />;
    case 'vvp-buoys':
      return <VvpBuoys />;
    case 'lock-lights':
      return <LockLights />;
    default:
      return null;
  }
}

function Frame({ vb, children }: { vb: string; children: React.ReactNode }) {
  return (
    <svg viewBox={vb} className="h-auto w-full" role="img" preserveAspectRatio="xMidYMid meet">
      {children}
    </svg>
  );
}

/* ── Рис. 1.1 — Основные части маломерного судна ── */
function ShipAnatomy() {
  return (
    <Frame vb="0 0 480 250">
      <title>Основные части маломерного судна</title>
      {/* вода */}
      <rect x="0" y="150" width="480" height="100" className="fill-accent/15" />
      <line x1="0" y1="150" x2="480" y2="150" className="stroke-accent" strokeWidth="2" strokeDasharray="7 5" />
      {/* корпус */}
      <path
        d="M70,108 L320,108 L356,168 Q300,184 96,184 L70,158 Z"
        className="fill-surface2 stroke-ink"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* палуба */}
      <line x1="70" y1="108" x2="320" y2="108" className="stroke-ink" strokeWidth="2.5" />
      {/* засечки надводного борта (зел.) и осадки (янт.) */}
      <line x1="388" y1="108" x2="388" y2="150" className="stroke-ok" strokeWidth="2.5" />
      <line x1="382" y1="108" x2="394" y2="108" className="stroke-ok" strokeWidth="2.5" />
      <line x1="382" y1="150" x2="394" y2="150" className="stroke-ok" strokeWidth="2.5" />
      <line x1="388" y1="150" x2="388" y2="182" className="stroke-warn" strokeWidth="2.5" />
      <line x1="382" y1="182" x2="394" y2="182" className="stroke-warn" strokeWidth="2.5" />

      {/* подписи */}
      <text x="195" y="100" textAnchor="middle" fontSize="14" fontWeight="700" className={TXT}>Палуба</text>
      <text x="44" y="92" textAnchor="middle" fontSize="13" fontWeight="700" className={TXT}>Корма</text>
      <text x="44" y="108" textAnchor="middle" fontSize="11" className={TXT_MUTED}>(транец)</text>
      <line x1="58" y1="118" x2="70" y2="130" className={STROKE} strokeWidth="1.5" />
      <text x="345" y="92" textAnchor="middle" fontSize="13" fontWeight="700" className={TXT}>Нос</text>
      <text x="345" y="76" textAnchor="middle" fontSize="11" className={TXT_MUTED}>(форштевень)</text>
      <line x1="345" y1="100" x2="345" y2="130" className={STROKE} strokeWidth="1.5" />
      <text x="205" y="208" textAnchor="middle" fontSize="13" fontWeight="700" className={TXT}>Киль</text>
      <line x1="205" y1="196" x2="205" y2="184" className={STROKE} strokeWidth="1.5" />
      <text x="30" y="146" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-accent">ВЛ</text>
      <text x="402" y="132" textAnchor="start" fontSize="11" fontWeight="700" className="fill-ok">надв. борт</text>
      <text x="402" y="170" textAnchor="start" fontSize="11" fontWeight="700" className="fill-warn">осадка</text>
      <text x="240" y="234" textAnchor="middle" fontSize="11" className={TXT_MUTED}>
        ВЛ — ватерлиния · надводный борт = запас плавучести
      </text>
    </Frame>
  );
}

/* ── Рис. 1.2 — Три состояния остойчивости ── */
function StabilityStates() {
  const Boat = ({
    x,
    title,
    sub,
    gm,
    state,
    tone,
  }: {
    x: number;
    title: string;
    sub: string;
    gm: string;
    state: string;
    tone: string;
  }) => {
    // позиции M и G относительно центра x
    const gY = state === 'pos' ? 96 : state === 'neu' ? 92 : 84;
    const mY = state === 'pos' ? 70 : state === 'neu' ? 92 : 108;
    return (
      <g>
        {/* корпус-полукруг */}
        <path d={`M${x - 42},96 A42,30 0 0 0 ${x + 42},96 Z`} className="fill-surface2 stroke-ink" strokeWidth="2" />
        <line x1={x} y1="40" x2={x} y2="120" className="stroke-ink/40" strokeWidth="1" strokeDasharray="3 3" />
        {/* M */}
        <circle cx={x} cy={mY} r="6" className={tone === 'pos' ? 'fill-ok' : tone === 'neu' ? 'fill-warn' : 'fill-danger'} />
        <text x={x + 12} y={mY + 4} fontSize="12" fontWeight="700" className={TXT}>M</text>
        {/* G */}
        <circle cx={x} cy={gY} r="5" className="fill-ink" />
        <text x={x - 22} y={gY + 4} fontSize="12" fontWeight="700" className={TXT}>G</text>
        <text x={x} y="150" textAnchor="middle" fontSize="12" fontWeight="700" className={TXT}>{title}</text>
        <text x={x} y="168" textAnchor="middle" fontSize="11" className={TXT_MUTED}>{gm}</text>
        <text
          x={x}
          y="186"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          className={tone === 'pos' ? 'fill-ok' : tone === 'neu' ? 'fill-warn' : 'fill-danger'}
        >
          {sub}
        </text>
      </g>
    );
  };
  return (
    <Frame vb="0 0 440 200">
      <title>Три состояния остойчивости судна</title>
      <Boat x={75} title="Положительная" sub="БЕЗОПАСНО" gm="GM > 0" state="pos" tone="pos" />
      <Boat x={220} title="Нулевая" sub="ОПАСНО" gm="GM = 0" state="neu" tone="neu" />
      <Boat x={365} title="Отрицательная" sub="КРИТИЧНО" gm="GM < 0" state="neg" tone="neg" />
    </Frame>
  );
}

/* ── Рис. 2.2 — Навигационные огни ── */
function NavLights() {
  const cx = 200;
  const cy = 175;
  return (
    <Frame vb="0 0 400 330">
      <title>Навигационные огни и их секторы</title>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="fill-ink" />
        </marker>
      </defs>
      <text x={cx} y="22" textAnchor="middle" fontSize="13" fontWeight="700" className={TXT}>НОС (вперёд)</text>
      <line x1={cx} y1="30" x2={cx} y2="58" className={STROKE} strokeWidth="1.5" markerEnd="url(#arr)" />
      {/* секторы */}
      <path d={`M${cx},${cy} L${cx - 110},70 A120,120 0 0 1 ${cx},55 Z`} className="fill-ink/10" />
      <path d={`M${cx},${cy} L${cx},55 A120,120 0 0 1 ${cx + 110},70 Z`} className="fill-ink/10" />
      <path d={`M${cx},${cy} L${cx - 116},122 A120,120 0 0 0 ${cx - 110},70 Z`} className="fill-danger/30" />
      <path d={`M${cx},${cy} L${cx + 110},70 A120,120 0 0 1 ${cx + 116},122 Z`} className="fill-ok/30" />
      <path d={`M${cx},${cy} L${cx - 88},258 A120,120 0 0 0 ${cx + 88},258 Z`} className="fill-ink/15" />
      {/* корпус (вид сверху) */}
      <path d={`M${cx},122 Q${cx + 26},175 ${cx + 16},226 L${cx - 16},226 Q${cx - 26},175 ${cx},122 Z`} className="fill-surface2 stroke-ink" strokeWidth="2" />
      {/* огни */}
      <circle cx={cx - 18} cy="152" r="6" className="fill-danger" />
      <circle cx={cx + 18} cy="152" r="6" className="fill-ok" />
      <circle cx={cx} cy="122" r="6" className="fill-ink" />
      <circle cx={cx} cy="226" r="6" className="fill-ink" />
      {/* подписи */}
      <text x="78" y="150" textAnchor="end" fontSize="12" fontWeight="700" className="fill-danger">КРАСНЫЙ</text>
      <text x="78" y="166" textAnchor="end" fontSize="10" className={TXT_MUTED}>левый 112,5°</text>
      <text x="322" y="150" textAnchor="start" fontSize="12" fontWeight="700" className="fill-ok">ЗЕЛЁНЫЙ</text>
      <text x="322" y="166" textAnchor="start" fontSize="10" className={TXT_MUTED}>правый 112,5°</text>
      <text x={cx} y="288" textAnchor="middle" fontSize="11" className={TXT}>Топовый белый 225° · Кормовой белый 135°</text>
      <text x={cx} y="310" textAnchor="middle" fontSize="12" fontWeight="700" className="fill-accent">«ЗПравый — КЛевый»</text>
    </Frame>
  );
}

/* ── Рис. 2.1 — Три сценария расхождения ── */
function Crossing() {
  const Panel = ({ x, title, children }: { x: number; title: string; children: React.ReactNode }) => (
    <g>
      <rect x={x} y="14" width="128" height="96" rx="10" className="fill-surface2/60 stroke-line" strokeWidth="1.5" />
      <text x={x + 64} y="34" textAnchor="middle" fontSize="12" fontWeight="700" className={TXT}>{title}</text>
      {children}
    </g>
  );
  return (
    <Frame vb="0 0 440 150">
      <title>Три сценария расхождения судов</title>
      <defs>
        <marker id="a2" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" className="fill-accent" />
        </marker>
      </defs>
      <Panel x={8} title="Встречный">
        <line x1="48" y1="92" x2="48" y2="50" className="stroke-accent" strokeWidth="2.5" markerEnd="url(#a2)" />
        <line x1="92" y1="48" x2="92" y2="90" className="stroke-accent" strokeWidth="2.5" markerEnd="url(#a2)" />
        <text x={72} y="126" textAnchor="middle" fontSize="10" className={TXT_MUTED}>оба вправо</text>
      </Panel>
      <Panel x={156} title="Пересечение">
        <line x1="176" y1="78" x2="244" y2="78" className="stroke-accent" strokeWidth="2.5" markerEnd="url(#a2)" />
        <line x1="230" y1="104" x2="230" y2="56" className="stroke-ok" strokeWidth="2.5" markerEnd="url(#a2)" />
        <text x={220} y="126" textAnchor="middle" fontSize="10" className={TXT_MUTED}>помеха справа</text>
      </Panel>
      <Panel x={304} title="Обгон">
        <line x1="368" y1="100" x2="368" y2="52" className="stroke-accent" strokeWidth="2.5" markerEnd="url(#a2)" />
        <path d="M348,92 q-14,-18 0,-34" className="stroke-warn fill-none" strokeWidth="2.5" markerEnd="url(#a2)" />
        <text x={368} y="126" textAnchor="middle" fontSize="10" className={TXT_MUTED}>обгоняющий уступает</text>
      </Panel>
    </Frame>
  );
}

/* ── Рис. 3.1 — Алгоритм при пожаре (вертикальный поток) ── */
function FireSteps() {
  const steps = ['Обнаружил — сообщи', 'Закрой доступ воздуха', 'Огнетушитель при искрах', 'В дыму — присядь и выходи', 'Развился — сигнал SOS, покинь'];
  return (
    <Frame vb="0 0 440 220">
      <title>Алгоритм действий при пожаре</title>
      {steps.map((s, i) => (
        <g key={i}>
          <rect x="40" y={10 + i * 40} width="360" height="32" rx="8" className="fill-surface2 stroke-line" strokeWidth="1.5" />
          <circle cx="58" cy={26 + i * 40} r="11" className="fill-warn" />
          <text x="58" y={30 + i * 40} textAnchor="middle" fontSize="12" fontWeight="700" className="fill-ink">{i + 1}</text>
          <text x="80" y={30 + i * 40} fontSize="12" className={TXT}>{s}</text>
        </g>
      ))}
    </Frame>
  );
}

/* ── Рис. 4.1 — СЛР: ключевые цифры ── */
function Cpr() {
  const Tile = ({ x, big, label }: { x: number; big: string; label: string }) => (
    <g>
      <rect x={x} y="20" width="120" height="92" rx="14" className="fill-surface2 stroke-line" strokeWidth="1.5" />
      <text x={x + 60} y="68" textAnchor="middle" fontSize="26" fontWeight="800" className="fill-accent">{big}</text>
      <text x={x + 60} y="94" textAnchor="middle" fontSize="11" className={TXT_MUTED}>{label}</text>
    </g>
  );
  return (
    <Frame vb="0 0 440 140">
      <title>Сердечно-лёгочная реанимация — ключевые цифры</title>
      <Tile x={10} big="30 : 2" label="нажатий : вдохов" />
      <Tile x={160} big="5–6 см" label="глубина нажатий" />
      <Tile x={310} big="100–120" label="нажатий в минуту" />
    </Frame>
  );
}

/* ── Латеральная система: кромки судового хода на ВВП ── */
function VvpBuoys() {
  return (
    <Frame vb="0 0 440 220">
      <title>Плавучие знаки: кромки судового хода (латеральная система)</title>
      {/* вода */}
      <rect x="0" y="0" width="440" height="220" className="fill-accent/10" />
      {/* судовой ход (фарватер) */}
      <path d="M150,210 C150,150 290,150 290,210 Z" className="fill-accent/20" />
      <rect x="150" y="20" width="140" height="190" className="fill-accent/20" />
      {/* стрелка по течению */}
      <line x1="220" y1="40" x2="220" y2="190" className="stroke-ink/50" strokeWidth="2" strokeDasharray="4 5" markerEnd="url(#flow)" />
      <defs>
        <marker id="flow" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
          <path d="M0,0 L9,4.5 L0,9 Z" className="fill-ink/50" />
        </marker>
      </defs>
      <text x="220" y="34" textAnchor="middle" fontSize="11" className={TXT_MUTED}>по течению ↓</text>

      {/* левая кромка — белые знаки (слева) */}
      {[70, 120, 170].map((y) => (
        <g key={`l${y}`}>
          <circle cx="150" cy={y} r="9" className="fill-ink/10 stroke-ink" strokeWidth="2" />
        </g>
      ))}
      {/* правая кромка — красные знаки (справа) */}
      {[70, 120, 170].map((y) => (
        <path key={`r${y}`} d={`M290,${y - 9} L299,${y + 7} L281,${y + 7} Z`} className="fill-danger stroke-danger" strokeWidth="1" />
      ))}

      <text x="90" y="60" textAnchor="middle" fontSize="12" fontWeight="700" className={TXT}>Левая</text>
      <text x="90" y="76" textAnchor="middle" fontSize="11" className={TXT_MUTED}>кромка</text>
      <text x="90" y="96" textAnchor="middle" fontSize="11" fontWeight="700" className={TXT}>белые</text>
      <text x="360" y="60" textAnchor="middle" fontSize="12" fontWeight="700" className={TXT}>Правая</text>
      <text x="360" y="76" textAnchor="middle" fontSize="11" className={TXT_MUTED}>кромка</text>
      <text x="360" y="96" textAnchor="middle" fontSize="11" fontWeight="700" className="fill-danger">красные</text>
      <text x="220" y="208" textAnchor="middle" fontSize="11" className={TXT_MUTED}>Кромки определяют по течению (сверху вниз)</text>
    </Frame>
  );
}

/* ── Сигналы светофора шлюза ── */
function LockLights() {
  const Light = ({ x, on, label, tone }: { x: number; on: boolean; label: string; tone: 'red' | 'green' }) => (
    <g>
      <rect x={x} y="14" width="86" height="150" rx="14" className="fill-surface2 stroke-line" strokeWidth="2" />
      <circle cx={x + 43} cy="54" r="22" className={on && tone === 'red' ? 'fill-danger' : 'fill-ink/15'} />
      <circle cx={x + 43} cy="112" r="22" className={on && tone === 'green' ? 'fill-ok' : 'fill-ink/15'} />
      <text x={x + 43} y="186" textAnchor="middle" fontSize="12" fontWeight="700" className={tone === 'red' ? 'fill-danger' : 'fill-ok'}>{label}</text>
    </g>
  );
  return (
    <Frame vb="0 0 320 210">
      <title>Сигналы светофора шлюза</title>
      <Light x={36} on label="СТОП" tone="red" />
      <Light x={198} on label="ВХОД РАЗРЕШЁН" tone="green" />
      <text x="160" y="204" textAnchor="middle" fontSize="11" className={TXT_MUTED}>Нет огней — шлюз не готов, вход запрещён</text>
    </Frame>
  );
}
