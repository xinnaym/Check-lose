import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { TEMPLATE_A_POINTS, TEMPLATE_B_POINTS } from '../types/poker.ts';
import { ArrowRight, Play } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: 'home' | 'leaderboard' | 'live' | 'admin') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { announcements, blindLevels, liveState } = useClub();
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

  return (
    <div className="space-y-14 pb-16">
      {/* HERO: POKER ROOM IDENTITY & LIVE TABLE WIDGET */}
      <section className="glass-panel relative overflow-hidden rounded-3xl p-7 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          {/* Left 7 Cols */}
          <div className="space-y-6 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium text-slate-400">
              <span className="font-semibold text-[#F43F5E]">ТЕХАССКИЙ ХОЛДЕМ</span>
              <span aria-hidden="true">·</span>
              <span>Стартовый стек 25 000</span>
              <span aria-hidden="true">·</span>
              <span>Без игры на деньги (УК РФ)</span>
            </div>

            <h1
              className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
              style={{ textWrap: 'balance' }}
            >
              Покерный клуб «Чек это проигрыш»
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-slate-300">
              Клуб спортивного покера и живого общения. Каждый вечер играем 2–3 рейтинговых турнира,
              ведём сезонный отбор в Топ-10 за Финальный стол и жёстко наказываем за чек с натсом на ривере.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                onClick={() => onNavigate('live')}
                className="btn-crimson inline-flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Экран турнира (ТВ 16:9)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className="btn-glass inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Play className="h-4 w-4 text-[#F43F5E]" />
                <span>Пульт дилера</span>
              </button>

              <button
                onClick={() => onNavigate('leaderboard')}
                className="px-3 py-3 text-sm font-medium text-slate-400 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Рейтинг сезона →
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Pocket Aces Visual + Live Table Status */}
          <div className="lg:col-span-5">
            <div className="glass-well rounded-2xl p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div className="flex items-center gap-4">
                  {/* Overlapping Pocket Aces Graphic (A♠ A♥) */}
                  <div className="relative flex h-14 w-16 shrink-0 items-center">
                    <div className="flex h-13 w-10 -rotate-6 flex-col justify-between rounded-lg border border-white/25 bg-[#141722] p-1.5 shadow-lg">
                      <span className="font-mono-tabular text-xs font-bold leading-none text-white">
                        A♠
                      </span>
                      <span className="self-center text-base leading-none text-white">♠</span>
                    </div>
                    <div className="absolute left-5 flex h-13 w-10 rotate-6 flex-col justify-between rounded-lg border border-[#F43F5E]/50 bg-[#1B1218] p-1.5 shadow-xl">
                      <span className="font-mono-tabular text-xs font-bold leading-none text-[#F43F5E]">
                        A♥
                      </span>
                      <span className="self-center text-base leading-none text-[#F43F5E]">♥</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400">Сейчас за столом</div>
                    <div className="font-display text-base font-bold text-white">
                      {liveState?.tournamentTitle || 'Вечерний Холдем'}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#F43F5E]">
                  {liveState?.status === 'running'
                    ? 'ИДЁТ ИГРА'
                    : liveState?.status === 'completed'
                      ? 'ЗАВЕРШЁН'
                      : 'ПАУЗА'}
                </span>
              </div>

              {liveState && (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Таймер уровня</div>
                      <div className="font-mono-tabular mt-1 text-3xl font-extrabold text-white sm:text-4xl">
                        {formatClock(liveState.remainingSeconds)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Текущие блайнды</div>
                      <div className="font-mono-tabular mt-1 text-2xl font-extrabold text-[#F43F5E] sm:text-3xl">
                        {currentLevel?.isBreak
                          ? 'ПЕРЕРЫВ'
                          : `${currentLevel?.smallBlind.toLocaleString('ru-RU')}/${currentLevel?.bigBlind.toLocaleString('ru-RU')}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                    <span>
                      Осталось игроков:{' '}
                      <strong className="font-mono-tabular text-white">
                        {liveState.activePlayers.length} из {liveState.totalInitialPlayers}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Стек:{' '}
                      <strong className="font-mono-tabular text-white">
                        {liveState.startingStack.toLocaleString('ru-RU')}
                      </strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* EVENING TOURNAMENTS (2-3 PER NIGHT) */}
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Расписание игрового вечера
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Проводим 2–3 турнира за вечер · Стартовый стек 25 000 фишек · Уровни по 10 минут
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {announcements.map((item, idx) => (
            <div
              key={item.id}
              className="glass-card flex flex-col justify-between rounded-2xl p-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Игра #{idx + 1}</span>
                  <span className="font-mono-tabular font-bold text-[#F43F5E]">
                    {item.eventDate}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                <span>{item.format.split('•')[0]}</span>
                <span className="font-mono-tabular font-semibold text-white">
                  Мест: {item.spotsTaken}/{item.spotsTotal}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RULES, PENALTIES & POINTS TABLE IN ONE CLEAN SPLIT */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: Club Rules & Penalties */}
        <div className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8 lg:col-span-7">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Правила и система штрафов
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              За столом запрещены оскорбления, подсказки в раздаче и затягивание времени
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="glass-well rounded-2xl p-4">
              <div className="font-mono-tabular text-xl font-extrabold text-amber-400">
                −500 фишек
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Показ карт до конца раздачи
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                За вскрытие или демонстрацию карт при активных игроках в раздаче.
              </p>
            </div>

            <div className="glass-crimson rounded-2xl p-4">
              <div className="font-mono-tabular text-xl font-extrabold text-[#F43F5E]">
                Бан 5 минут
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                «Чек» с натсом на ривере
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                Чек с лучшей возможной комбинацией на последнем слове — удаление из-за стола на 5 минут.
              </p>
            </div>

            <div className="glass-well rounded-2xl p-4">
              <div className="font-mono-tabular text-xl font-extrabold text-rose-400">
                −1 000 фишек
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Сговор за столом
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Командная игра, софт-плей, передача фишек или сигналов между игроками.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-slate-400">
            <strong className="text-white">Отказ от ответственности (УК РФ):</strong> В клубе «Чек
            это проигрыш» строго запрещена игра на реальные деньги, кэш-игры и денежные призы. Все
            фишки используются исключительно для спортивного подсчёта очков сезонного рейтинга.
          </div>
        </div>

        {/* Right 5 Cols: Points Templates A & B */}
        <div className="glass-panel flex flex-col justify-between space-y-5 rounded-3xl p-6 sm:p-8 lg:col-span-5">
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-white">
                Сетка начисления очков
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Начисляются автоматически при нажатии «Выбыл» в пульте дилера
              </p>
            </div>

            <div className="glass-well flex items-center gap-1 rounded-xl p-1">
              <button
                onClick={() => setSelectedTemplate('1_table')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '1_table'
                    ? 'btn-crimson'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1 стол (10 мест)
              </button>
              <button
                onClick={() => setSelectedTemplate('2_tables')}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '2_tables'
                    ? 'btn-crimson'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2 стола (14–20 мест)
              </button>
            </div>

            {selectedTemplate === '1_table' ? (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {Object.entries(TEMPLATE_A_POINTS).map(([place, pts]) => (
                  <div key={place} className="glass-well rounded-xl p-2.5 text-center">
                    <div className="text-[11px] text-slate-400">#{place}</div>
                    <div className="font-mono-tabular mt-0.5 text-sm font-bold text-white">
                      +{pts}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 pt-1">
                {Object.entries(TEMPLATE_B_POINTS).map(([place, pts]) => (
                  <div key={place} className="glass-well rounded-xl p-2 text-center">
                    <div className="text-[11px] text-slate-400">#{place}</div>
                    <div className="font-mono-tabular mt-0.5 text-xs font-bold text-white">
                      +{pts}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 text-xs text-slate-400">
            Сезон длится 2 месяца · Топ-10 игроков по очкам выходят за Финальный стол сезона.
          </div>
        </div>
      </section>
    </div>
  );
};
