/*
 * build-data.js — парсер исходных материалов ГИМС 2026 -> JSON.
 *
 * Вход (в папке source/, реальные PDF, конвертированные pdftotext):
 *   - Testy.txt              (pdftotext -layout)   -> public/data/tickets.json
 *   - Spravochnik_table.txt  (pdftotext -table)    -> public/data/reference.json
 *   - Pravila.txt            (pdftotext -layout)   -> public/data/rules.json
 *
 * Принцип: ничего не выдумываем. Если данные в источнике обрезаны/нечитаемы —
 * ставим needsReview: true, но пробел не заполняем вымыслом.
 *
 * Запуск:  bun scripts/build-data.js   (или node, если установлен)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'source');
const OUT = path.join(ROOT, 'public', 'data');

function read(file) {
  // нормализуем CRLF -> LF (иначе $ в регэкспах не матчится перед \r)
  return fs.readFileSync(path.join(SRC, file), 'utf8').replace(/\r/g, '');
}
function collapse(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}
function sentenceCase(s) {
  s = collapse(s);
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
// Похоже ли начало строки на полноценное начало вопроса (заглавная кириллица / кавычка / цифра-перечень).
function looksComplete(q) {
  if (!q) return false;
  const first = q.trim().charAt(0);
  return /[А-ЯЁ«"]/.test(first);
}

const report = { tickets: {}, reference: {}, rules: {} };

/* ─────────────────────────── 1. TICKETS ─────────────────────────── */
function parseTickets() {
  const lines = read('Testy.txt').split('\n');

  // 1a. Ключ ответов: для каждого билета 20 букв.
  const keyStart = lines.findIndex((l) => /КЛЮЧ ОТВЕТОВ/.test(l));
  const razborStart = lines.findIndex((l) => /ПОДРОБНЫЙ РАЗБОР/.test(l));
  const keyBlock = lines.slice(keyStart, razborStart);
  const keys = {};
  let curKey = null;
  for (const raw of keyBlock) {
    const mB = raw.match(/БИЛЕТ\s*№\s*(\d+)/);
    if (mB) { curKey = Number(mB[1]); keys[curKey] = []; continue; }
    if (curKey == null) continue;
    const tokens = raw.trim().split(/\s+/).filter((t) => /^[АБВГ]$/.test(t));
    if (tokens.length) keys[curKey].push(...tokens);
  }

  // 1b. Подробные разборы: текст вопроса, варианты, пояснение, мнемоника, ловушка.
  const heads = [];
  lines.forEach((l, i) => {
    const m = l.match(/БИЛЕТ\s*№\s*(\d+)\s*[—-]\s*ПОДРОБНЫЙ РАЗБОР/);
    if (m) heads.push({ id: Number(m[1]), line: i });
  });

  const tickets = [];
  heads.forEach((h, hi) => {
    const end = hi + 1 < heads.length ? heads[hi + 1].line : lines.length;
    const body = lines.slice(h.line + 1, end);
    const ticketKey = keys[h.id] || [];

    const blocks = [];
    let cur = null;
    for (const raw of body) {
      const mQ = raw.match(/Вопрос\s+(\d+)\.\s*(.*)$/);
      if (mQ) { if (cur) blocks.push(cur); cur = { n: Number(mQ[1]), lines: [mQ[2]] }; }
      else if (cur) cur.lines.push(raw);
    }
    if (cur) blocks.push(cur);

    const questions = blocks
      .filter((b) => b.n >= 1 && b.n <= 20)
      .map((b) => {
        const opts = { А: '', Б: '', В: '', Г: '' };
        let qtext = '', expl = '', mnem = '', trap = '';
        let field = 'q';
        let curOpt = null;

        for (const line of b.lines) {
          if (/^\s*ГИМС МЧС России|Тренировочные тесты|^\s*стр\.\s*\d+/.test(line)) continue;
          const mOpt = line.match(/^\s*([АБВГ])\)\s*(.*)$/);
          const mExpl = line.match(/Пояснение:\s*(.*)$/);
          const mMnem = line.match(/Мнемоника:\s*(.*)$/);
          const mTrap = line.match(/Ловушка:\s*(.*)$/);
          if (mTrap) { field = 'trap'; trap += ' ' + mTrap[1]; continue; }
          if (mMnem) { field = 'mnem'; mnem += ' ' + mMnem[1]; continue; }
          if (mExpl) { field = 'expl'; expl += ' ' + mExpl[1]; continue; }
          if (mOpt) { curOpt = mOpt[1]; field = 'option'; opts[curOpt] += ' ' + mOpt[2]; continue; }
          if (field === 'q') qtext += ' ' + line;
          else if (field === 'option' && curOpt) opts[curOpt] += ' ' + line;
          else if (field === 'expl') expl += ' ' + line;
          else if (field === 'mnem') mnem += ' ' + line;
          else if (field === 'trap') trap += ' ' + line;
        }

        const correct = ticketKey[b.n - 1] || null;
        for (const kk of Object.keys(opts)) opts[kk] = collapse(opts[kk]);
        qtext = collapse(qtext);
        expl = collapse(expl);
        mnem = collapse(mnem);
        trap = collapse(trap);
        // "Ловушка!" — это плейсхолдер-флаг без содержания; не считаем за текст ловушки
        if (/^ловушка!?$/i.test(trap)) trap = '';

        const allOpts = Object.values(opts).every((v) => v.length > 0);
        const needsReview = !qtext || !correct || !allOpts;

        return {
          id: `T${h.id}-Q${b.n}`,
          text: qtext,
          options: opts,
          correct,
          explanation: expl || null,
          mnemonic: mnem || null,
          trap: trap || null,
          topic: guessTopic(qtext + ' ' + expl),
          needsReview,
        };
      });

    tickets.push({ id: h.id, title: `Билет №${h.id}`, questions });
  });

  const total = tickets.reduce((a, t) => a + t.questions.length, 0);
  const flagged = tickets.reduce((a, t) => a + t.questions.filter((q) => q.needsReview).length, 0);
  report.tickets = { tickets: tickets.length, questions: total, needsReview: flagged };
  return { tickets };
}

// Консервативное сопоставление тестового вопроса с темой справочника (или null).
function guessTopic(s) {
  const t = s.toLowerCase();
  const map = [
    ['Первая помощь', /кровотеч|слр|перелом|ожог|утоплен|жгут|повязк|нажат|искусственн|реанимац|сердечн|пострадавш/],
    ['Судовые спасательные средства', /жилет|спасательн|круг|линь|плот/],
    ['Предотвращение пожаров', /пожар|огнетушит|тушить|возгоран/],
    ['Обеспечение непотопляемости', /пенопласт|пробоин|откачк|непотопляем|запас плавучест/],
    ['Основы теории судна', /остойчивост|метацентр|\bgm\b|дифферент|ватерлин|плавучест/],
    ['Конструкция маломерных судов', /форпик|ахтерпик|транец|шпигат|фальшборт|переборк|^отсек| отсек/],
    ['Постановка на якорь и швартовка', /якор|швартов|причал|кранц/],
    ['Учёт воздействия ветра и течения', /течени|ветер|ветр|дрейф/],
    ['Действия при авариях', /столкновени|человек за бортом|сигнал бедстви|авари/],
    ['Охрана окружающей среды', /мусор|загрязн|сброс|нефтепродукт|окружающ/],
  ];
  for (const [topic, re] of map) if (re.test(t)) return topic;
  return null;
}

/* ─────────────────────────── 2. REFERENCE ─────────────────────────── */
function parseReference() {
  const lines = read('Spravochnik_table.txt').split('\n');

  const blocks = [];
  let curBlock = null;
  let curSection = null;
  let curCard = null;
  let answerStart = 60;
  let hintStart = 90;

  const pushCard = () => {
    if (curCard && curSection) {
      curCard.question = collapse(curCard.question);
      curCard.answer = collapse(curCard.answer);
      curCard.hint = collapse(curCard.hint) || null;
      curCard.needsReview = !looksComplete(curCard.question) || !curCard.answer;
      delete curCard._n;
      curSection.cards.push(curCard);
    }
    curCard = null;
  };
  const pushSection = () => {
    pushCard();
    if (curSection && curBlock) {
      curSection.count = curSection.cards.length;
      curBlock.sections.push(curSection);
    }
    curSection = null;
  };
  const pushBlock = () => {
    pushSection();
    if (curBlock) blocks.push(curBlock);
    curBlock = null;
  };

  for (const raw of lines) {
    if (/КЛЮЧ ОТВЕТОВ/.test(raw)) break;

    const mBlock = raw.match(/^\s*БЛОК\s+(\d+)\s+[—-]\s+(.+?)\s*$/);
    if (mBlock) {
      pushBlock();
      curBlock = { id: `block-${mBlock[1]}`, title: sentenceCase(mBlock[2]), sections: [] };
      continue;
    }
    const mSec = raw.match(/^\s*РАЗДЕЛ\s+([\d.]+)\s+[—-]\s+(.+?)\s*$/);
    if (mSec) {
      pushSection();
      if (!curBlock) curBlock = { id: 'block-0', title: 'Прочее', sections: [] };
      curSection = { id: mSec[1].replace(/\.$/, ''), title: sentenceCase(mSec[2]), count: 0, cards: [] };
      continue;
    }
    if (/ВОПРОС/.test(raw) && /ОТВЕТ/.test(raw)) {
      const a = raw.indexOf('ОТВЕТ');
      const h = raw.indexOf('ПОДСКАЗ');
      if (a > 0) answerStart = a;
      hintStart = h > a ? h : a + 26;
      continue;
    }
    if (/ГИМС\s+—\s+Справочник|Для самоподготовки|^\s*Стр\.\s*\d+/.test(raw)) continue;
    if (!curSection) continue;

    const mNum = raw.match(/^(\d+)(?=\s)/);
    if (mNum) {
      pushCard();
      const n = Number(mNum[1]);
      curCard = {
        id: `R-${curSection.id}-${n}`,
        _n: n,
        question: raw.slice(mNum[1].length, answerStart),
        answer: raw.slice(answerStart, hintStart),
        hint: raw.slice(hintStart),
        needsReview: false,
      };
    } else if (curCard) {
      curCard.question += ' ' + raw.slice(0, answerStart);
      curCard.answer += ' ' + raw.slice(answerStart, hintStart);
      curCard.hint += ' ' + raw.slice(hintStart);
    }
  }
  pushBlock();

  const sectionCount = blocks.reduce((a, b) => a + b.sections.length, 0);
  const cardCount = blocks.reduce((a, b) => a + b.sections.reduce((x, s) => x + s.cards.length, 0), 0);
  const flagged = blocks.reduce(
    (a, b) => a + b.sections.reduce((x, s) => x + s.cards.filter((c) => c.needsReview).length, 0), 0);
  report.reference = {
    blocks: blocks.length,
    sections: sectionCount,
    cards: cardCount,
    needsReview: flagged,
    perSection: blocks.flatMap((b) => b.sections.map((s) => `${s.id}:${s.cards.length}`)),
  };
  return { blocks };
}

/* ─────────────────────────── 3. RULES ─────────────────────────── */
const CHAPTER_TITLES = {
  A0: 'Что нового в 2026 году',
  A1: 'Устройство судна и теория',
  A2: 'Правила плавания и расхождение',
  A3: 'Безопасность: пожар, авария, снаряжение',
  A4: 'Первая помощь на воде',
  A5: 'Штрафы и ответственность',
  A6: 'Мнемоники и чеклист',
};

function parseRules() {
  const lines = read('Pravila.txt').split('\n');

  const heads = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*ГЛАВ/.test(lines[i])) continue;
    let idLine = -1, digit = null;
    for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
      const m = lines[j].match(/^\s*А(\d)/);
      if (m) { idLine = j; digit = m[1]; break; }
    }
    if (idLine === -1) continue;
    heads.push({
      id: 'A' + digit,
      line: i,
      idLine,
      titleTail: collapse(lines[i].replace(/^\s*ГЛАВ\s*/, '') + ' ' + lines[idLine].replace(/^\s*А\d\s*/, '')),
    });
  }

  const isFooter = (l) =>
    /Приказ МЧС № 636.*стр\.|^\s*стр\.\s*\d+|Судоводителей-любителей|Для подготовки к теоретическому/.test(l);

  const chapters = heads.map((h, hi) => {
    const end = hi + 1 < heads.length ? heads[hi + 1].line : lines.length;
    const body = lines.slice(h.idLine + 1, end).filter((l) => !isFooter(l));
    const title = CHAPTER_TITLES[h.id] || sentenceCase(h.titleTail);
    const blocks = h.id === 'A5' ? buildFinesBlocks(body) : buildGenericBlocks(body);
    return { id: h.id, title, blocks };
  });

  report.rules = {
    chapters: chapters.length,
    ids: chapters.map((c) => c.id),
    blocksPerChapter: chapters.map((c) => `${c.id}:${c.blocks.length}`),
    callouts: chapters.map((c) => `${c.id}:${c.blocks.filter((b) => b.type === 'callout').length}`),
  };
  return { chapters };
}

// Спец-парсер таблицы штрафов A5: 3 колонки по позициям заголовка,
// строки таблицы разделены пустыми строками (перенос внутри строки склеивается).
function buildFinesBlocks(body) {
  const blocks = [];
  let fineStart = -1, extraStart = -1, headerIdx = -1;

  for (let i = 0; i < body.length; i++) {
    const t = collapse(body[i]);
    if (/^Актуальные штрафы/i.test(t)) blocks.push({ type: 'heading', text: t });
    if (/НАРУШЕНИЕ/.test(body[i]) && /ШТРАФ/.test(body[i])) {
      fineStart = body[i].indexOf('ШТРАФ');
      extraStart = body[i].indexOf('ДОП');
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return buildGenericBlocks(body);

  const rows = [];
  let group = [];
  const MONEY = /(?:до\s+)?\d[\d\s]*(?:[–—-]\s*\d[\d\s]*)?\s*₽?/; // сумма/диапазон штрафа
  // ячейки строки = непрерывные фрагменты, разделённые 2+ пробелами (с их смещением)
  const cellsOf = (line) => {
    const out = [];
    const rx = /\S(?:.*?\S)?(?=\s{2,}|$)/g;
    let m;
    while ((m = rx.exec(line))) out.push({ t: m[0], i: m.index });
    return out;
  };
  const flushGroup = () => {
    if (!group.length) return;
    const nameMax = fineStart - 2;
    const fineMax = extraStart > fineStart ? extraStart - 2 : 1e9;
    let n = '', f = '', e = '';
    for (const raw of group) {
      for (const c of cellsOf(raw)) {
        if (c.i < nameMax) n += ' ' + c.t;
        else if (c.i < fineMax) f += ' ' + c.t;
        else e += ' ' + c.t;
      }
    }
    n = collapse(n); f = collapse(f); e = collapse(e);
    // если имя «съело» сумму (длинное название, один пробел перед суммой) — отделим по шаблону
    if (!f) {
      const m = n.match(MONEY);
      if (m && m.index > 0) {
        f = collapse(m[0]);
        const trailing = collapse(n.slice(m.index + m[0].length));
        n = collapse(n.slice(0, m.index));
        if (trailing) e = collapse(trailing + ' ' + e);
      }
    }
    // в колонку "штраф" иногда затекает хвост (перенос имени/«новое 2026») — выносим в "доп."
    const fm = f.match(MONEY);
    if (fm) {
      const trailing = collapse(f.slice(fm.index + fm[0].length));
      f = collapse(f.slice(0, fm.index + fm[0].length));
      if (trailing) e = collapse(e + ' ' + trailing);
    }
    if (n || f) rows.push([n, f, e]);
    group = [];
  };

  let warnText = '', inWarn = false;
  for (let i = headerIdx + 1; i < body.length; i++) {
    const t = collapse(body[i]);
    if (/^⚠?\s*ВАЖНО/.test(t)) { flushGroup(); inWarn = true; warnText = t.replace(/^⚠?\s*ВАЖНО[:：]?\s*/, ''); continue; }
    if (inWarn) { if (t) warnText += ' ' + t; continue; }
    if (!t) { flushGroup(); continue; }
    group.push(body[i]);
  }
  flushGroup();

  if (rows.length) blocks.push({ type: 'table', head: ['Нарушение', 'Штраф', 'Дополнительно'], rows });
  if (warnText) blocks.push({ type: 'callout', kind: 'warning', text: collapse(warnText) });
  return blocks;
}

// Универсальный построитель блоков для глав A0–A4, A6.
function buildGenericBlocks(body) {
  const blocks = [];
  let para = [];
  const flushPara = () => {
    const t = collapse(para.join(' '));
    if (t) blocks.push({ type: 'paragraph', text: t });
    para = [];
  };

  let i = 0;
  while (i < body.length) {
    const t = collapse(body[i]);
    if (!t) { i++; continue; }

    // маркеры изменений 2026 (могут быть разорваны переносом: "ИЗМЕНЕ"/"НО", "ОСТАЛО"/"СЬ")
    const mNew = t.match(/^НОВОЕ\s*(.*)$/);
    const mChg = t.match(/^ИЗМЕНЕ(?:НО)?\s*(.*)$/);
    const mKept = t.match(/^ОСТАЛО(?:СЬ)?\s*(.*)$/);
    if (mNew || mChg || mKept) {
      flushPara();
      const kind = mNew ? 'new2026' : mChg ? 'changed2026' : 'kept';
      let rest = (mNew ? mNew[1] : mChg ? mChg[1] : mKept[1]) || '';
      if (!rest && i + 1 < body.length) {
        const nt = collapse(body[i + 1]);
        if (/^(НО|СЬ)(\s|$)/.test(nt)) { rest = nt.replace(/^(НО|СЬ)\s*/, ''); i++; }
      }
      let j = i + 1;
      while (j < body.length) {
        const nt = collapse(body[j]);
        if (!nt) break;
        if (/^(НОВОЕ|ИЗМЕНЕ|ОСТАЛО|НО|СЬ|ВОПРОС|ОТВЕТ|⚠)/.test(nt)) break;
        if (/^[А-ЯЁ]{4,}/.test(nt) && nt === nt.toUpperCase()) break;
        rest += ' ' + nt;
        j++;
      }
      i = j;
      if (collapse(rest)) blocks.push({ type: 'callout', kind, text: collapse(rest) });
      continue;
    }

    const mWarn = t.match(/^⚠?\s*(ЛОВУШКА|ВАЖНО)[:：]?\s*(.*)$/);
    if (mWarn) {
      flushPara();
      blocks.push({ type: 'callout', kind: mWarn[1] === 'ЛОВУШКА' ? 'trap' : 'warning', text: collapse(mWarn[2]) });
      i++;
      continue;
    }

    if (/^«.*»/.test(t)) { flushPara(); blocks.push({ type: 'mnemonic', text: t }); i++; continue; }

    const mQ = t.match(/^ВОПРОС[:：]\s*(.*)$/);
    const mA = t.match(/^ОТВЕТ[:：]\s*(.*)$/);
    if (mQ) { flushPara(); blocks.push({ type: 'paragraph', text: 'Вопрос: ' + collapse(mQ[1]) }); i++; continue; }
    if (mA) { flushPara(); blocks.push({ type: 'paragraph', text: 'Ответ: ' + collapse(mA[1]) }); i++; continue; }

    const isHeading = t.length <= 60 && /[А-ЯЁ]/.test(t) && t === t.toUpperCase() && !/[.?!]$/.test(t);
    if (isHeading) { flushPara(); blocks.push({ type: 'heading', text: sentenceCase(t) }); i++; continue; }

    if (/^[☐☑]/.test(t)) { flushPara(); blocks.push({ type: 'paragraph', text: t }); i++; continue; }

    para.push(t);
    i++;
  }
  flushPara();
  return blocks;
}

/* ─────────────────────────── MAIN ─────────────────────────── */
function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const tickets = parseTickets();
  const reference = parseReference();
  const rules = parseRules();
  fs.writeFileSync(path.join(OUT, 'tickets.json'), JSON.stringify(tickets, null, 2));
  fs.writeFileSync(path.join(OUT, 'reference.json'), JSON.stringify(reference, null, 2));
  fs.writeFileSync(path.join(OUT, 'rules.json'), JSON.stringify(rules, null, 2));
  console.log('=== BUILD REPORT ===');
  console.log(JSON.stringify(report, null, 2));
}
main();
