import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { TEMPLATE_A_POINTS, TEMPLATE_B_POINTS } from '../types/poker.ts';
import { ArrowRight, Trophy, Clock, Users, ShieldCheck, Calendar } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'leaderboard' | 'rules' | 'archive' | 'live' | 'admin') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    players,
    announcements,
    blindLevels,
    liveState,
    getContentByKey,
  } = useClub();

  const [selectedTemplate, setSelectedTemplate] = useState<'1_table' | '2_tables'>('1_table');

  const currentLevel =
    liveState && blindLevels.length > 0
      ? blindLevels[liveState.currentLevelIndex] || blindLevels[0]
      : null;

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const clubAbout = getContentByKey(
    'club_about',
    'Интеллектуальное пространство для ценителей спортивного Техасского Холдема, живого общения и турнирной стратегии.'
  );
  const seasonInfo = getContentByKey(
    'season_info',
    'Длительность сезона составляет 2 месяца. Топ-10 игроков сезона выходят за Финальный стол.'
  );

  const topFivePlayers = players.slice(0, 5);
  const tenthPlacePoints = players[9]?.seasonPoints ?? 560;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121917] p-8 md:p-12 lg:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.22), transparent 55%), radial-gradient(circle at 15% 85%, rgba(16, 185, 129, 0.14), transparent 50%)',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2 text-xs tracking-wide text-[#94A39E]">
              <span>Спортивный Техасский Холдем</span>
              <span aria-hidden="true">·</span>
              <span>Сезон 2 месяца</span>
              <span aria-hidden="true">·</span>
              <span>Исключительно без игры на деньги (УК РФ)</span>
            </div>

            <h1
              className="font-serif-display text-4xl font-bold tracking-tight text-[#F4F1EA] sm:text-5xl lg:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              Покерный клуб «Чек это проигрыш»
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-[#94A39E] sm:text-lg">
              {clubAbout}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('live')}
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-semibold text-[#0B0F0E] transition-colors hover:bg-[#e3be42] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Открыть Live-Таймер зала</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('leaderboard')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-[#F4F1EA] transition-colors hover:bg-white/10 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Сезонный рейтинг (Топ-10)</span>
              </button>

              <button
                onClick={() => onNavigate('rules')}
                className="px-3 py-3 text-sm font-medium text-[#94A39E] underline-offset-4 hover:text-[#F4F1EA] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Регламент и штрафы
              </button>
            </div>
          </div>

          {/* Right Column: Bespoke Club Emblem & Live Table Telemetry */}
          <div className="lg:col-span-5">
            <div className="rounded-xl border border-white/10 bg-[#0B0F0E]/90 p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  {/* Custom SVG Club Crest */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#121917]">
                    <svg
                      viewBox="0 0 64 64"
                      className="h-9 w-9 text-[#D4AF37]"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4" />
                      <circle cx="32" cy="32" r="21" stroke="currentColor" strokeWidth="1.5" />
                      <path
                        d="M32 16C25 24 20 29 20 35C20 39.5 23.5 42.5 27.5 42.5C29.5 42.5 31 41.5 32 40C33 41.5 34.5 42.5 36.5 42.5C40.5 42.5 44 39.5 44 35C44 29 39 24 32 16Z"
                        fill="currentColor"
                      />
                      <path d="M32 40L28 48H36L32 40Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-[#94A39E]">Трансляция из зала клуба</div>
                    <div className="text-base font-semibold text-[#F4F1EA]">
                      {liveState?.tournamentTitle || 'Вечерняя Серия'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#94A39E]">Статус таймера</div>
                  <div className="text-xs font-semibold text-[#D4AF37]">
                    {liveState?.status === 'running'
                      ? 'Идёт уровень'
                      : liveState?.status === 'completed'
                        ? 'Завершён'
                        : 'На паузе'}
                  </div>
                </div>
              </div>

              {liveState && (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-[#94A39E]">Таймер уровня</div>
                      <div className="font-mono-tabular mt-1 text-3xl font-bold text-[#F4F1EA]">
                        {formatClock(liveState.remainingSeconds)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-[#94A39E]">Текущие блайнды</div>
                      <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#D4AF37]">
                        {currentLevel?.isBreak
                          ? 'ПЕРЕРЫВ'
                          : `${currentLevel?.smallBlind.toLocaleString('ru-RU')} / ${currentLevel?.bigBlind.toLocaleString('ru-RU')}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#94A39E]">
                    <span>
                      Осталось за столом:{' '}
                      <strong className="font-mono-tabular text-[#F4F1EA]">
                        {liveState.activePlayers.length} из {liveState.totalInitialPlayers}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Стартовый стек:{' '}
                      <strong className="font-mono-tabular text-[#F4F1EA]">
                        {liveState.startingStack.toLocaleString('ru-RU')}
                      </strong>
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('live')}
                    className="w-full rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 py-2.5 text-xs font-semibold text-[#D4AF37] transition-colors hover:bg-[#D4AF37]/20 cursor-pointer"
                  >
                    Развернуть ТВ-экран турнира (16:9)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4-Column Club Key Figures Strip */}
        <div className="relative z-10 mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
          <div>
            <div className="text-xs text-[#94A39E]">Стартовый стек</div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F4F1EA]">
              25 000 фишек
            </div>
            <div className="mt-0.5 text-xs text-[#94A39E]">Единый стандарт вечера</div>
          </div>
          <div>
            <div className="text-xs text-[#94A39E]">Длительность уровней</div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F4F1EA]">
              10:00 минут
            </div>
            <div className="mt-0.5 text-xs text-[#94A39E]">От 100/200 до 40k/50k</div>
          </div>
          <div>
            <div className="text-xs text-[#94A39E]">Вечерняя программа</div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F4F1EA]">
              2–3 турнира
            </div>
            <div className="mt-0.5 text-xs text-[#94A39E]">Форматы на 1 и 2 стола</div>
          </div>
          <div>
            <div className="text-xs text-[#94A39E]">Проходной балл в Топ-10</div>
            <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#D4AF37]">
              {tenthPlacePoints} очк.
            </div>
            <div className="mt-0.5 text-xs text-[#94A39E]">Отбор за Финальный стол</div>
          </div>
        </div>
      </section>

      {/* SECTION 01: EVENING TOURNAMENT ANNOUNCEMENTS */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif-display text-3xl font-bold text-[#F4F1EA]">
              01. Анонсы турниров игрового вечера
            </h2>
            <p className="mt-1 text-sm text-[#94A39E]">
              Обычно проводится 2–3 рейтинговых турнира за вечер с автоматическим зачетом очков в сезон
            </p>
          </div>
          <button
            onClick={() => onNavigate('admin')}
            className="text-xs font-medium text-[#D4AF37] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Управление расписанием в CMS →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {announcements.map((item, idx) => {
            const seatsLeft = Math.max(0, item.spotsTotal - item.spotsTaken);
            return (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#121917] p-6 transition-colors hover:border-white/20"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#94A39E]">
                    <span>Турнир вечера #{idx + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular text-[#D4AF37]">{item.eventDate}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#F4F1EA]">{item.title}</h3>

                  <p className="text-sm leading-relaxed text-[#94A39E]">{item.description}</p>
                </div>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
                  <div className="text-xs text-[#94A39E]">{item.format}</div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#94A39E]">
                      Занято боксов:{' '}
                      <strong className="font-mono-tabular text-[#F4F1EA]">
                        {item.spotsTaken} / {item.spotsTotal}
                      </strong>
                    </span>
                    <span className="font-mono-tabular text-[#10B981]">
                      Свободно мест: {seatsLeft}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 02: SEASONAL LEADERBOARD PREVIEW & POINTS MATRICES */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: Top-5 Seasonal Standings Preview */}
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
                02. Лидеры отбора за Финальный стол
              </h2>
              <p className="mt-1 text-xs text-[#94A39E]">{seasonInfo}</p>
            </div>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-[#F4F1EA] transition-colors hover:bg-white/5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Полная таблица ({players.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-[#94A39E]">
                  <th className="py-2.5 pr-3 font-medium">Место</th>
                  <th className="py-2.5 px-3 font-medium">Игрок</th>
                  <th className="py-2.5 px-3 text-right font-medium">Игр</th>
                  <th className="py-2.5 px-3 text-right font-medium">Побед</th>
                  <th className="py-2.5 pl-3 text-right font-medium">Очки сезона</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topFivePlayers.map((player, index) => (
                  <tr key={player.id} className="hover:bg-white/[0.02]">
                    <td className="font-mono-tabular py-3 pr-3 font-semibold text-[#D4AF37]">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-[#F4F1EA]">{player.name}</div>
                      <div className="text-xs text-[#94A39E]">{player.nickname}</div>
                    </td>
                    <td className="font-mono-tabular py-3 px-3 text-right text-[#94A39E]">
                      {player.gamesPlayed}
                    </td>
                    <td className="font-mono-tabular py-3 px-3 text-right text-[#94A39E]">
                      {player.winsCount}
                    </td>
                    <td className="font-mono-tabular py-3 pl-3 text-right font-bold text-[#F4F1EA]">
                      {player.seasonPoints}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#94A39E]">
            <span>Топ-10 участников по итогам 2 месяцев выходят в Финал Сезона</span>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="font-medium text-[#D4AF37] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Смотреть все 10 путёвок →
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Points Calculation Templates A & B (TZ Section 6) */}
        <div className="space-y-5 rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8 lg:col-span-5">
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
                03. Начисление очков
              </h2>
              <p className="mt-1 text-xs text-[#94A39E]">
                Автоматический расчет в БД при нажатии кнопки «Выбыл»
              </p>
            </div>

            {/* Interactive Segmented Control (Allowed by Zero-Pill rules) */}
            <div className="flex items-center gap-1 rounded-lg bg-[#0B0F0E] p-1 border border-white/10">
              <button
                onClick={() => setSelectedTemplate('1_table')}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '1_table'
                    ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
                    : 'text-[#94A39E] hover:text-[#F4F1EA]'
                }`}
              >
                Шаблон A (1 стол • 10 мест)
              </button>
              <button
                onClick={() => setSelectedTemplate('2_tables')}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '2_tables'
                    ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
                    : 'text-[#94A39E] hover:text-[#F4F1EA]'
                }`}
              >
                Шаблон B (2 стола • 20 мест)
              </button>
            </div>
          </div>

          {selectedTemplate === '1_table' ? (
            <div className="space-y-3">
              <div className="text-xs text-[#94A39E]">
                Игра в один стол (до 10 участников). За 1-е место начисляется 150 очков:
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {Object.entries(TEMPLATE_A_POINTS).map(([place, pts]) => (
                  <div
                    key={place}
                    className="rounded-lg border border-white/10 bg-[#0B0F0E] p-2.5 text-center"
                  >
                    <div className="text-xs text-[#94A39E]">{place} место</div>
                    <div className="font-mono-tabular mt-1 text-base font-bold text-[#D4AF37]">
                      +{pts}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-[#94A39E]">
                Игра в два стола (от 14 до 20 участников). За 1-е место начисляется 280 очков:
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {Object.entries(TEMPLATE_B_POINTS).map(([place, pts]) => (
                  <div
                    key={place}
                    className="rounded-lg border border-white/10 bg-[#0B0F0E] p-2 text-center"
                  >
                    <div className="text-[11px] text-[#94A39E]">{place} место</div>
                    <div className="font-mono-tabular mt-0.5 text-sm font-bold text-[#D4AF37]">
                      +{pts}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 text-xs text-[#94A39E]">
            Главный закон клуба: за «чек» с натсом на ривере в позиции последнего слова игрок удаляется из-за стола на 5 минут.
          </div>
        </div>
      </section>
    </div>
  );
};
