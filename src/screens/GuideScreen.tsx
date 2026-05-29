import { examConfig, passThreshold } from '../config';
import { Callout } from '../components/Callout';
import {
  LayoutDashboard,
  GraduationCap,
  Timer,
  Tickets,
  Infinity as InfinityIcon,
  TrendingDown,
  Star,
  Search,
  BookOpen,
  Bookmark,
  BarChart3,
} from 'lucide-react';

const SECTIONS: { icon: typeof Timer; title: string; text: string }[] = [
  { icon: LayoutDashboard, title: 'Мой план', text: 'Дашборд: сводка прогресса, быстрый старт и слабые темы.' },
  { icon: GraduationCap, title: 'Режим изучения', text: 'Карточки справочника: вопрос → ответ. Отмечайте «Знаю / Не знаю».' },
  { icon: Timer, title: 'Режим экзамена', text: `Имитация: ${examConfig.questionCount} вопросов, ${examConfig.durationMinutes} минут, ответы скрыты до конца.` },
  { icon: Tickets, title: 'Билеты', text: '5 готовых билетов по 20 вопросов с подробным разбором, без таймера.' },
  { icon: InfinityIcon, title: 'Марафон', text: 'Весь пул вопросов подряд с мгновенной проверкой. Позиция сохраняется.' },
  { icon: TrendingDown, title: 'Топ моих ошибок', text: 'Частые ошибки и мини-сессия «Проработать ошибки».' },
  { icon: Star, title: 'Избранные вопросы', text: 'Всё, что отмечено звездой, с фильтром по типу.' },
  { icon: Search, title: 'Поиск', text: 'Полнотекстовый поиск по тестам, справочнику и правилам.' },
  { icon: BookOpen, title: 'Правила', text: 'Главы A0–A6: новшества 2026, таблица штрафов, мнемоники.' },
  { icon: Bookmark, title: 'Закладки', text: 'Сохранённые места в правилах и карточки.' },
  { icon: BarChart3, title: 'Статистика', text: 'Графики точности по дням и разделам, счётчики и серия дней.' },
];

export function GuideScreen() {
  return (
    <div className="space-y-5">
      <section>
        <h2 className="mb-2 px-1 text-lg font-bold">Как пользоваться</h2>
        <ul className="space-y-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="card flex items-start gap-3 py-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-hover" aria-hidden="true" />
                <div>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-muted">{s.text}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2 className="text-lg font-bold">Как устроен экзамен ГИМС</h2>
        <ul className="mt-2 space-y-1 text-ink/90">
          <li>· Формат: {examConfig.questionCount} вопросов с выбором одного варианта (А/Б/В/Г).</li>
          <li>· Время: {examConfig.durationMinutes} минут.</li>
          <li>
            · Проходной балл: {Math.round(examConfig.passRatio * 100)}% — нужно верно ответить минимум на{' '}
            {passThreshold()} из {examConfig.questionCount}.
          </li>
          <li>· Темы: устройство судна, правила плавания, безопасность, первая помощь, охрана среды.</li>
        </ul>
        <h3 className="mt-3 font-semibold">Советы</h3>
        <ul className="mt-1 space-y-1 text-muted">
          <li>· Учите мнемоники — они быстро всплывают на экзамене.</li>
          <li>· Исключайте 2 явно неверных варианта, затем выбирайте из оставшихся.</li>
          <li>· Обращайте внимание на «ловушки» — типичные ошибки новичков.</li>
          <li>· Сначала отвечайте на лёгкие вопросы, сложные помечайте и возвращайтесь.</li>
        </ul>
      </section>

      <Callout kind="warning">
        Значения экзамена ({examConfig.questionCount} вопросов / {examConfig.durationMinutes} минут /{' '}
        {Math.round(examConfig.passRatio * 100)}%) взяты из учебных материалов и могут отличаться от
        действующих требований. Авторитетный источник — приложенные файлы и актуальный приказ МЧС
        России № 636. Перед экзаменом сверяйтесь с официальными источниками ГИМС.
      </Callout>
    </div>
  );
}
