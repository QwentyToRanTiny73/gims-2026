/*
 * build-textbook.js — парсер «Полного справочника судоводителя 2026»
 * (source/Spravochnik_full.pdf → -layout → Spravochnik_full.txt)
 * в public/data/textbook.json: 8 частей → 26 глав → разделы (N.N) → блоки.
 *
 * Блоки совместимы с RuleBlock (paragraph/list/qa/mnemonic/callout/heading),
 * поэтому отображаются тем же рендером, что и «Правила».
 *
 * Запуск: bun scripts/build-textbook.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'source', 'Spravochnik_full.txt');
const OUT = path.join(ROOT, 'public', 'data', 'textbook.json');
const OUT_REF = path.join(ROOT, 'public', 'data', 'reference.json');

const collapse = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Части и названия глав — из «Содержания» (надёжнее, чем разорванный «ГЛА/ВА»).
const PARTS = [
  { id: 'I', title: 'I. Основы', chapters: [1, 2, 3] },
  { id: 'II', title: 'II. Документы и регистрация', chapters: [4, 5, 6] },
  { id: 'III', title: 'III. Устройство и теория', chapters: [7, 8, 9] },
  { id: 'IV', title: 'IV. Оснащение', chapters: [10, 11, 12] },
  { id: 'V', title: 'V. Плавание и навигация', chapters: [13, 14, 15, 16, 17] },
  { id: 'VI', title: 'VI. Безопасность', chapters: [18, 19, 20, 21] },
  { id: 'VII', title: 'VII. Ответственность', chapters: [22, 23] },
  { id: 'VIII', title: 'VIII. Приложения', chapters: [24, 25, 26] },
];
const CHAPTER_TITLES = {
  1: 'Нормативная база и общие положения',
  2: 'Основные определения (глоссарий)',
  3: 'Что нового в 2026 году',
  4: 'Регистрация маломерных судов',
  5: 'Удостоверение судоводителя',
  6: 'Освидетельствование и техосмотр',
  7: 'Устройство маломерного судна',
  8: 'Теория плавания: плавучесть и остойчивость',
  9: 'Двигатель и его обслуживание',
  10: 'Обязательное оснащение по нормам 2026',
  11: 'Спасательные средства',
  12: 'Противопожарное оборудование',
  13: 'Правила плавания и расхождения',
  14: 'Навигационные огни и знаки',
  15: 'Сигналы судов',
  16: 'Маневрирование (циркуляция, винт)',
  17: 'Постановка на якорь и швартовка',
  18: 'Действия при авариях',
  19: 'Первая медицинская помощь',
  20: 'Запреты и ограничения',
  21: 'Охрана окружающей среды',
  22: 'Штрафы и санкции',
  23: 'Права и обязанности при проверке',
  24: 'Мнемоники и ловушки',
  25: 'Чеклист перед выходом на воду',
  26: 'Краткий справочник цифр и фактов',
};
const partOf = (n) => PARTS.find((p) => p.chapters.includes(n)) || PARTS[0];

const isFooter = (l) =>
  /ГИМС МЧС России · Полный справочник/.test(l) ||
  /^\s*стр\.?\s*\d+\s*$/i.test(l) ||
  /^\s*СОДЕРЖАНИЕ/.test(l);

// Похоже на подпись к диаграмме / артефакт рисунка (без строчных букв, коротко).
const isDiagramNoise = (t) => {
  if (!t) return true;
  if (/^Рисунок\s+\d/.test(t)) return true;
  const hasLower = /[а-яё]/.test(t);
  if (!hasLower && t.length < 70) return true; // ALL-CAPS обрывки, «M GM G», «GM > 0»
  return false;
};

function parse() {
  const lines = fs.readFileSync(SRC, 'utf8').replace(/\r/g, '').split('\n');
  const chapters = [];
  let chapter = null;
  let section = null;
  let para = [];
  let list = null;
  let qa = null;

  const flushPara = () => {
    const t = collapse(para.join(' '));
    if (t && section) section.blocks.push({ type: 'paragraph', text: t });
    para = [];
  };
  const flushList = () => {
    if (list && list.length && section) section.blocks.push({ type: 'list', items: list.slice() });
    list = null;
  };
  const flushQa = () => {
    if (qa && section) {
      qa.q = collapse(qa.q);
      qa.a = collapse(qa.a);
      qa.note = collapse(qa.note) || undefined;
      qa.trap = collapse(qa.trap) || undefined;
      const block = { type: 'qa', q: qa.q, a: qa.a };
      if (qa.note) block.note = qa.note;
      if (qa.trap) block.trap = qa.trap;
      if (qa.q && qa.a) section.blocks.push(block);
    }
    qa = null;
  };
  const flushAll = () => {
    flushList();
    flushQa();
    flushPara();
  };
  const ensureSection = () => {
    if (!chapter) return;
    if (!section) {
      section = { id: `${chapter.num}.0`, title: 'Введение', blocks: [] };
      chapter.sections.push(section);
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (isFooter(raw)) continue;
    const t = collapse(raw);

    // Заголовок главы (ГЛА…/ВА). Номера в заголовке ненадёжны (двузначные
    // рендерятся вразброс), поэтому просто переходим к следующей по порядку
    // главе — это ловит и главы без нумерованных разделов (напр. гл. 3).
    if (/ГЛА/.test(t) && t.length < 60) {
      flushAll();
      const last = chapters.length ? chapters[chapters.length - 1].num : 0;
      const next = last + 1;
      if (CHAPTER_TITLES[next]) {
        chapter = {
          num: next,
          part: partOf(next).id,
          partTitle: partOf(next).title,
          title: CHAPTER_TITLES[next],
          sections: [],
        };
        chapters.push(chapter);
        section = { id: `${next}.0`, title: 'Обзор', blocks: [] };
        chapter.sections.push(section);
      }
      continue;
    }
    if (t === 'ВА') continue; // хвост слова ГЛАВА

    // Раздел N.N — определяет и главу (целая часть номера)
    let m = raw.match(/^\s*(\d{1,2})\.(\d{1,2})\s+([А-ЯЁA-Z].+)$/);
    if (m && CHAPTER_TITLES[Number(m[1])]) {
      flushAll();
      const cn = Number(m[1]);
      if (!chapter || chapter.num !== cn) {
        chapter = {
          num: cn,
          part: partOf(cn).id,
          partTitle: partOf(cn).title,
          title: CHAPTER_TITLES[cn],
          sections: [],
        };
        chapters.push(chapter);
      }
      section = { id: `${m[1]}.${m[2]}`, title: collapse(m[3]), blocks: [] };
      chapter.sections.push(section);
      continue;
    }

    if (!t) {
      flushList();
      flushPara();
      continue;
    }
    if (!chapter) continue;
    ensureSection();

    // Вопрос экзамена
    m = t.match(/ВОПРОС\s+ЭКЗАМЕНА:?\s*(.*)$/i);
    if (m) {
      flushList();
      flushPara();
      flushQa();
      qa = { q: m[1], a: '', note: '', trap: '', field: 'q' };
      continue;
    }
    m = t.match(/^ОТВЕТ:?\s*(.*)$/i);
    if (m && qa) {
      qa.a = m[1];
      qa.field = 'a';
      continue;
    }
    // Ловушка
    m = t.match(/^⚠?\s*ЛОВУШКА:?\s*(.*)$/i);
    if (m) {
      flushList();
      flushPara();
      if (qa) qa.trap += ' ' + m[1];
      else section.blocks.push({ type: 'callout', kind: 'trap', text: collapse(m[1]) });
      continue;
    }
    // Список
    m = t.match(/^[•▪–-]\s+(.+)$/);
    if (m) {
      flushPara();
      flushQa();
      if (!list) list = [];
      list.push(collapse(m[1]));
      continue;
    }
    flushList();

    // Мнемоника «...»
    if (/^«/.test(t)) {
      flushPara();
      flushQa();
      section.blocks.push({ type: 'mnemonic', text: t });
      continue;
    }

    if (isDiagramNoise(t)) continue;

    // продолжение Q&A (note или дополнение ответа)
    if (qa) {
      if (qa.field === 'a') qa.note += ' ' + t;
      else qa.q += ' ' + t;
      continue;
    }
    para.push(t);
  }
  flushAll();

  // Убираем пустые разделы-заглушки и главы без содержания.
  for (const c of chapters) c.sections = c.sections.filter((s) => s.blocks.length > 0);
  const kept = chapters.filter((c) => c.sections.length > 0);

  return { parts: PARTS.map((p) => ({ id: p.id, title: p.title })), chapters: kept };
}

// Чистые карточки для «Режима изучения»: вопросы экзамена и определения
// из полного справочника, сгруппированные по частям → главам.
function buildReference(data) {
  const blocks = data.parts.map((p) => ({ id: `part-${p.id}`, title: p.title, sections: [] }));
  const byPart = Object.fromEntries(blocks.map((b) => [b.id.replace('part-', ''), b]));
  for (const c of data.chapters) {
    const cards = [];
    let i = 0;
    for (const s of c.sections) {
      for (const b of s.blocks) {
        if (b.type === 'qa' && b.q && b.a) {
          const hint = [b.note, b.trap ? `⚠ ${b.trap}` : ''].filter(Boolean).join(' · ') || null;
          cards.push({ id: `R-${c.num}-${++i}`, question: collapse(b.q), answer: collapse(b.a), hint, needsReview: false });
        } else if (b.type === 'terms') {
          for (const it of b.items) {
            cards.push({
              id: `R-${c.num}-${++i}`,
              question: `Что такое «${collapse(it.term)}»?`,
              answer: collapse(it.def),
              hint: null,
              needsReview: false,
            });
          }
        }
      }
    }
    if (cards.length) {
      const blk = byPart[c.part];
      blk.sections.push({ id: String(c.num), title: `Гл. ${c.num}. ${c.title}`, count: cards.length, cards });
    }
  }
  return { blocks: blocks.filter((b) => b.sections.length) };
}

function main() {
  const data = parse();
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));

  const reference = buildReference(data);
  fs.writeFileSync(OUT_REF, JSON.stringify(reference, null, 2));
  const refCards = reference.blocks.reduce((a, b) => a + b.sections.reduce((x, s) => x + s.cards.length, 0), 0);
  console.log('=== REFERENCE (чистые карточки из полного справочника) ===');
  console.log('блоков:', reference.blocks.length, '| разделов:', reference.blocks.reduce((a, b) => a + b.sections.length, 0), '| карточек:', refCards);
  const totalSections = data.chapters.reduce((a, c) => a + c.sections.length, 0);
  const totalBlocks = data.chapters.reduce((a, c) => a + c.sections.reduce((x, s) => x + s.blocks.length, 0), 0);
  const qaCount = data.chapters.reduce(
    (a, c) => a + c.sections.reduce((x, s) => x + s.blocks.filter((b) => b.type === 'qa').length, 0),
    0
  );
  console.log('=== TEXTBOOK ===');
  console.log('chapters:', data.chapters.length, '| sections:', totalSections, '| blocks:', totalBlocks, '| qa:', qaCount);
  console.log(data.chapters.map((c) => `${c.num}. ${c.title} (${c.sections.length} разд.)`).join('\n'));
}
main();
