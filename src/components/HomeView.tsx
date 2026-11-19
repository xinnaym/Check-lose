import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import {
  parseRegisteredPlayers,
  TEMPLATE_A_POINTS,
  TEMPLATE_B_POINTS,
} from '../types/poker.ts';
import { CLUB_LOGO_PATH, NavTab } from '../App.tsx';
import {
  ArrowRight,
  Play,
  ShieldAlert,
  UserPlus,
  CheckCircle2,
  Users,
  Ban,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const {
    announcements,
    blindLevels,
    liveState,
    currentUser,
    players,
    openAuthModal,
    toggleTableRegistration,
  } = useClub();

  const [selectedTemplate, setSelectedTemplate] = useState<'1_table' | '2_tables'>('1_table');
  const [registeringTableId, setRegisteringTableId] = useState<number | null>(null);
  const [tableNotice, setTableNotice] = useState<string | null>(null);

  const currentLevel =
    liveState && blindLevels.length > 0
      ? blindLevels[liveState.currentLevelIndex] || blindLevels[0]
      : null;

  const formatClock = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentUserFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`.trim()
    : '';

  const currentUserPlayerRecord = currentUser
    ? players.find(
        (p) =>
          (currentUser.playerId && p.id === currentUser.playerId) ||
          p.name.toLowerCase() === currentUserFullName.toLowerCase()
      )
    : null;

  const handleTableSeatAction = async (announcementId: number, tableTitle: string) => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }
    setRegisteringTableId(announcementId);
    setTableNotice(null);
    try {
      const registered = await toggleTableRegistration(announcementId);
      setTableNotice(
        registered
          ? `Вы записаны за стол «${tableTitle}» (${currentUserFullName})`
          : `Запись за стол «${tableTitle}» отменена`
      );
      window.setTimeout(() => setTableNotice(null), 4000);
    } catch (err: any) {
      setTableNotice(err.message || 'Не удалось обновить запись за стол');
    } finally {
      setRegisteringTableId(null);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* HERO: OFFICIAL CLUB LOGO & LIVE TABLE WIDGET */}
      <section className="glass-panel relative overflow-hidden rounded-3xl p-5 sm:p-9 lg:p-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left 7 Cols: Official Logo Badge + Headline + Actions */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-7">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full border-2 border-[#F97316]/60 bg-black shadow-[0_0_40px_-5px_rgba(249,115,22,0.45)]">
                <img
                  src={CLUB_LOGO_PATH}
                  alt="Покерный клуб Чек это проигрыш"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-400">
                  <span className="font-bold text-[#F97316]">ТЕХАССКИЙ ХОЛДЕМ</span>
                  <span aria-hidden="true">·</span>
                  <span>Стек 25 000</span>
                  <span aria-hidden="true">·</span>
                  <span>♠ | ♥ | ♦ | ♣</span>
                </div>

                <h1
                  className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
                  style={{ textWrap: 'balance' }}
                >
                  Чек это{' '}
                  <span className="inline-block rounded-xl bg-[#F97316] px-2.5 py-0.5 text-[#060608]">
                    проигрыш
                  </span>
                </h1>
              </div>
            </div>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
              Интеллектуальный покерный клуб спортивного Техасского Холдема. Каждый вечер проводим
              2–3 рейтинговых турнира, ведём двухмесячный отбор в Топ-10 за Финальный стол и
              удаляем на 5 минут за чек с натсом.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
              <button
                onClick={() => onNavigate('live')}
                className="btn-crimson inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Экран турнира (ТВ 16:9)</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {!currentUser ? (
                <button
                  onClick={() => openAuthModal('register')}
                  className="btn-glass inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <UserPlus className="h-4 w-4 text-[#F97316]" />
                  <span>Регистрация на стол</span>
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('admin')}
                  className="btn-glass inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="h-4 w-4 text-[#F97316]" />
                  <span>Пульт дилера</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('leaderboard')}
                className="px-3 py-2.5 text-center text-sm font-semibold text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Рейтинг сезона →
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Live Table Status */}
          <div className="lg:col-span-5">
            <div className="glass-well rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 sm:pb-5">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={CLUB_LOGO_PATH}
                    alt="Логотип клуба"
                    className="h-11 w-11 shrink-0 rounded-full border border-[#F97316]/40 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400">Сейчас за столом в зале</div>
                    <div className="font-display truncate text-sm sm:text-base font-bold text-white">
                      {liveState?.tournamentTitle || 'Вечерний Холдем'}
                    </div>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-[#F97316]/15 px-2.5 py-1 text-xs font-extrabold text-[#F97316]">
                  {liveState?.status === 'running'
                    ? 'ИДЁТ ИГРА'
                    : liveState?.status === 'completed'
                      ? 'ЗАВЕРШЁН'
                      : 'ПАУЗА'}
                </span>
              </div>

              {liveState && (
                <div className="mt-4 sm:mt-5 space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <div className="text-xs text-slate-400">Таймер уровня</div>
                      <div className="font-mono-tabular mt-1 text-2xl font-extrabold text-white sm:text-4xl">
                        {formatClock(liveState.remainingSeconds)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Текущие блайнды</div>
                      <div className="font-mono-tabular mt-1 text-xl font-extrabold text-[#F97316] sm:text-3xl">
                        {currentLevel?.isBreak
                          ? 'ПЕРЕРЫВ'
                          : `${currentLevel?.smallBlind.toLocaleString('ru-RU')}/${currentLevel?.bigBlind.toLocaleString('ru-RU')}`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3.5 text-xs text-slate-400">
                    <span>
                      В игре:{' '}
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

      {/* EVENING TOURNAMENTS & ONLINE TABLE SEAT REGISTRATION */}
      <section className="space-y-4 sm:space-y-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Запись за турнирные столы вечера
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Зарегистрированные участники клуба могут заранее занять бокс за выбранным столом
            </p>
          </div>

          {!currentUser && (
            <button
              onClick={() => openAuthModal('login')}
              className="btn-glass self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-[#F97316] hover:text-white cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Войдите для записи за стол</span>
            </button>
          )}
        </div>

        {tableNotice && (
          <div className="glass-crimson flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-bold text-white">
            <span>{tableNotice}</span>
            <button
              onClick={() => setTableNotice(null)}
              className="text-orange-200 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
          {announcements.map((item, idx) => {
            const registeredList = parseRegisteredPlayers(item.registeredPlayersJson);
            const count = registeredList.length;
            const isUserRegistered = Boolean(
              currentUser &&
                registeredList.some(
                  (r) =>
                    (currentUser.playerId && r.playerId === currentUser.playerId) ||
                    r.name.toLowerCase() === currentUserFullName.toLowerCase()
                )
            );
            const isFull = count >= item.spotsTotal;
            const isBanned = Boolean(currentUserPlayerRecord?.isBanned);
            const fillPct = Math.min(100, Math.round((count / item.spotsTotal) * 100));

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all ${
                  isUserRegistered ? 'glass-crimson' : 'glass-card'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Стол #{idx + 1}</span>
                    <span className="font-mono-tabular font-bold text-[#F97316]">
                      {item.eventDate}
                    </span>
                  </div>

                  <h3 className="font-display text-base sm:text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                    {item.description}
                  </p>

                  {/* Seat Progress Bar */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{item.format.split('•')[0]}</span>
                      <span className="font-mono-tabular font-bold text-white">
                        Занято мест: {count} / {item.spotsTotal}
                      </span>
                    </div>
                    <div className="glass-well h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-[#EA580C] to-[#FB923C] transition-all duration-300"
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Registered Players Roster */}
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                      <Users className="h-3.5 w-3.5 text-[#F97316]" />
                      <span>Записались за стол ({count}):</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {registeredList.length === 0 ? (
                        <span className="text-xs text-slate-500">Пока никто не записался</span>
                      ) : (
                        registeredList.map((reg) => {
                          const isMe =
                            currentUser &&
                            ((currentUser.playerId && reg.playerId === currentUser.playerId) ||
                              reg.name.toLowerCase() === currentUserFullName.toLowerCase());
                          return (
                            <span
                              key={`${item.id}-${reg.playerId}-${reg.name}`}
                              className={`rounded-lg px-2 py-1 text-[11px] font-medium ${
                                isMe
                                  ? 'bg-[#F97316] font-bold text-black'
                                  : 'border border-white/10 bg-black/40 text-slate-200'
                              }`}
                            >
                              {reg.name}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Registration Action Button */}
                <div className="mt-5 border-t border-white/10 pt-4">
                  {!currentUser ? (
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="btn-glass w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold text-white cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-[#F97316]" />
                      <span>Войти и записаться за стол</span>
                    </button>
                  ) : isBanned ? (
                    <div className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/15 py-2.5 text-xs font-bold text-rose-300">
                      <Ban className="h-3.5 w-3.5" />
                      <span>Запись недоступна (Бан в клубе)</span>
                    </div>
                  ) : isUserRegistered ? (
                    <button
                      type="button"
                      disabled={registeringTableId === item.id}
                      onClick={() => handleTableSeatAction(item.id, item.title)}
                      className="btn-glass w-full inline-flex items-center justify-center gap-2 rounded-xl border-emerald-400/50 py-2.5 text-xs font-extrabold text-emerald-300 hover:text-white cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Вы записаны ✓ (Отменить запись)</span>
                    </button>
                  ) : isFull ? (
                    <button
                      type="button"
                      disabled
                      className="glass-well w-full rounded-xl py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                    >
                      Все места за столом заняты ({item.spotsTotal}/{item.spotsTotal})
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={registeringTableId === item.id}
                      onClick={() => handleTableSeatAction(item.id, item.title)}
                      className="btn-crimson w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold cursor-pointer"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Записаться за этот стол</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RULES, PENALTIES & POINTS TABLE */}
      <section className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: Club Rules & Penalties */}
        <div className="glass-panel space-y-5 sm:space-y-6 rounded-3xl p-5 sm:p-8 lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Правила, штрафы и бан-лист
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                За столом запрещены оскорбления, подсказки в раздаче, показ карт и сговор
              </p>
            </div>
            <ShieldAlert className="h-6 w-6 shrink-0 text-[#F97316]" />
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="glass-well rounded-2xl p-4">
              <div className="font-mono-tabular text-lg sm:text-xl font-extrabold text-amber-400">
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
              <div className="font-mono-tabular text-lg sm:text-xl font-extrabold text-[#F97316]">
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
              <div className="font-mono-tabular text-lg sm:text-xl font-extrabold text-rose-400">
                −1 000 / БАН
              </div>
              <div className="mt-1 text-sm font-bold text-white">
                Сговор или грубое нарушение
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                Штраф 1 000 фишек либо дисквалификация с турнира (0 очков) и бан в клубе.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-slate-400">
            <strong className="text-white">Формат клуба:</strong> В клубе «Чек это проигрыш» мы
            играем исключительно на турнирные фишки и очки сезонного рейтинга, а не на деньги.
          </div>
        </div>

        {/* Right 5 Cols: Points Templates A & B */}
        <div className="glass-panel flex flex-col justify-between space-y-5 rounded-3xl p-5 sm:p-8 lg:col-span-5">
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Сетка начисления очков
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Начисляются автоматически при нажатии «Выбыл» в пульте дилера
              </p>
            </div>

            <div className="glass-well flex items-center gap-1 rounded-xl p-1">
              <button
                onClick={() => setSelectedTemplate('1_table')}
                className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '1_table'
                    ? 'btn-crimson'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1 стол (10 мест)
              </button>
              <button
                onClick={() => setSelectedTemplate('2_tables')}
                className={`flex-1 rounded-lg px-2.5 py-2 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedTemplate === '2_tables'
                    ? 'btn-crimson'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2 стола (14–20 мест)
              </button>
            </div>

            {selectedTemplate === '1_table' ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                {Object.entries(TEMPLATE_A_POINTS).map(([place, pts]) => (
                  <div key={place} className="glass-well rounded-xl p-2.5 text-center">
                    <div className="text-[11px] text-slate-400">#{place} место</div>
                    <div className="font-mono-tabular mt-0.5 text-sm font-bold text-white">
                      +{pts}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-4 sm:grid-cols-5 gap-2 pt-1">
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
