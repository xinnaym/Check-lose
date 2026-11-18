import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { calculatePointsForPlace } from '../types/poker.ts';
import { CLUB_LOGO_PATH } from '../App.tsx';
import { Maximize2, Minimize2, Sliders, AlertTriangle, Lock } from 'lucide-react';

interface LiveTimerViewProps {
  onOpenAdmin: () => void;
}

export const LiveTimerView: React.FC<LiveTimerViewProps> = ({ onOpenAdmin }) => {
  const { liveState, blindLevels, isDealerAuthorized } = useClub();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!liveState) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center text-slate-400">
        Загрузка Live-таймера...
      </div>
    );
  }

  const currentLevel =
    blindLevels[liveState.currentLevelIndex] ||
    blindLevels[0] || {
      levelNumber: 1,
      isBreak: false,
      breakTitle: '',
      smallBlind: 100,
      bigBlind: 200,
      ante: 0,
      durationSeconds: 600,
    };

  const nextLevel =
    liveState.currentLevelIndex + 1 < blindLevels.length
      ? blindLevels[liveState.currentLevelIndex + 1]
      : null;

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatBanCountdown = (expiresAt?: number | null) => {
    if (!expiresAt) return null;
    const diffSec = Math.max(0, Math.ceil((expiresAt - nowTs) / 1000));
    if (diffSec <= 0) return null;
    return formatClock(diffSec);
  };

  const totalChipsInPlay = liveState.totalInitialPlayers * liveState.startingStack;
  const averageStack =
    liveState.activePlayers.length > 0
      ? Math.round(totalChipsInPlay / liveState.activePlayers.length)
      : totalChipsInPlay;

  const nextEliminationPlace = liveState.activePlayers.length;
  const nextEliminationPoints =
    nextEliminationPlace > 0
      ? calculatePointsForPlace(liveState.tableFormat, nextEliminationPlace)
      : 0;

  const progressPct =
    currentLevel.durationSeconds > 0
      ? Math.max(
          0,
          Math.min(
            100,
            ((currentLevel.durationSeconds - liveState.remainingSeconds) /
              currentLevel.durationSeconds) *
              100
          )
        )
      : 0;

  const isLowTime = liveState.remainingSeconds <= 60 && liveState.status === 'running';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Top Broadcast Bar with Club Logo */}
      <div className="glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-xs text-slate-400">
          <img
            src={CLUB_LOGO_PATH}
            alt="Чек это проигрыш"
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full border border-[#F97316]/50 object-cover shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="font-display text-sm font-bold text-white">
            {liveState.tournamentTitle}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="text-slate-300">
            {liveState.tableFormat === '2_tables'
              ? '2 стола (Шаблон B • до 280 очк.)'
              : '1 стол (Шаблон A • до 150 очк.)'}
          </span>
          <span className="hidden md:inline" aria-hidden="true">
            ·
          </span>
          <span className="hidden md:inline">
            Стартовый стек:{' '}
            <strong className="font-mono-tabular text-white">
              {liveState.startingStack.toLocaleString('ru-RU')}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <button
            onClick={onOpenAdmin}
            className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isDealerAuthorized ? (
              <Sliders className="h-3.5 w-3.5 text-[#F97316]" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-[#F97316]" />
            )}
            <span>Пульт дилера</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn-crimson flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Обычный экран</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>На весь экран ТВ</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Color-Up Break Notification */}
      {(currentLevel.isBreak || nextLevel?.isBreak) && (
        <div className="glass-crimson rounded-2xl px-4 py-3.5 sm:px-6 sm:py-4 text-center">
          <div className="text-[11px] sm:text-xs font-bold tracking-wider text-orange-300">
            ПЕРЕРЫВ В ИГРЕ · УКРУПНЕНИЕ ФИШЕК (COLOR-UP)
          </div>
          <div className="font-display mt-1 text-base sm:text-lg font-bold text-white">
            {currentLevel.isBreak
              ? currentLevel.breakTitle
              : `После этого уровня: ${nextLevel?.breakTitle}`}
          </div>
        </div>
      )}

      {/* 16:9 MAIN BROADCAST SCREEN */}
      <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
        {/* LEFT 7 COLS: CLOCK & BLINDS */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-5 sm:p-8 xl:p-10 lg:col-span-7">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 sm:pb-5">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <img
                src={CLUB_LOGO_PATH}
                alt="Покерный клуб Чек это проигрыш"
                className="h-11 w-11 sm:h-14 sm:w-14 shrink-0 rounded-full border border-[#F97316]/50 object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0">
                <div className="text-xs text-slate-400">Текущий уровень</div>
                <div className="font-display mt-0.5 truncate text-xl font-extrabold text-white sm:text-3xl">
                  {currentLevel.isBreak
                    ? 'Перерыв'
                    : `Уровень #${currentLevel.levelNumber ?? liveState.currentLevelIndex + 1}`}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">Статус таймера</div>
              <div
                className={`mt-0.5 text-xs sm:text-sm font-extrabold ${
                  liveState.status === 'running'
                    ? 'text-emerald-400'
                    : liveState.status === 'completed'
                      ? 'text-[#F97316]'
                      : 'text-amber-400'
                }`}
              >
                {liveState.status === 'running'
                  ? 'ИДЁТ ОТСЧЁТ'
                  : liveState.status === 'completed'
                    ? 'ТУРНИР ЗАВЕРШЁН'
                    : 'НА ПАУЗЕ'}
              </div>
            </div>
          </div>

          {/* Giant Responsive 10:00 -> 00:00 Clock */}
          <div className="my-6 text-center sm:my-10">
            <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-slate-400">
              ДО СМЕНЫ УРОВНЯ БЛАЙНДОВ
            </div>
            <div
              className={`font-mono-tabular mt-2 font-extrabold tracking-tight leading-none ${
                isLowTime ? 'text-[#F97316] animate-pulse' : 'text-white'
              }`}
              style={{ fontSize: 'clamp(3.75rem, 12vw, 8.5rem)' }}
            >
              {formatClock(liveState.remainingSeconds)}
            </div>

            <div className="glass-well mx-auto mt-5 sm:mt-6 h-2.5 w-full max-w-xl overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#EA580C] to-[#FB923C] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Current & Next Blinds */}
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4 border-t border-white/10 pt-5 sm:pt-6 sm:grid-cols-2">
            <div className="glass-crimson rounded-2xl p-4 sm:p-5">
              <div className="text-xs font-bold text-orange-200">ТЕКУЩИЕ БЛАЙНДЫ</div>
              <div className="font-mono-tabular mt-1.5 text-2xl font-extrabold text-white sm:text-4xl">
                {currentLevel.isBreak
                  ? 'ПЕРЕРЫВ'
                  : `${currentLevel.smallBlind.toLocaleString('ru-RU')} / ${currentLevel.bigBlind.toLocaleString('ru-RU')}`}
              </div>
              <div className="font-mono-tabular mt-1.5 text-xs text-orange-100/80">
                {currentLevel.ante > 0
                  ? `Анте (BB): ${currentLevel.ante.toLocaleString('ru-RU')}`
                  : 'Без анте'}
              </div>
            </div>

            <div className="glass-well rounded-2xl p-4 sm:p-5">
              <div className="text-xs font-semibold text-slate-400">СЛЕДУЮЩИЙ УРОВЕНЬ</div>
              <div className="font-mono-tabular mt-1.5 text-xl font-extrabold text-white sm:text-3xl">
                {!nextLevel
                  ? 'Финальный'
                  : nextLevel.isBreak
                    ? 'Перерыв (Color-Up)'
                    : `${nextLevel.smallBlind.toLocaleString('ru-RU')} / ${nextLevel.bigBlind.toLocaleString('ru-RU')}`}
              </div>
              <div className="mt-1.5 text-xs text-slate-400">
                {!nextLevel
                  ? '40 000 / 50 000'
                  : nextLevel.isBreak
                    ? nextLevel.breakTitle
                    : nextLevel.ante > 0
                      ? `Анте: ${nextLevel.ante.toLocaleString('ru-RU')} · 10 мин`
                      : 'Без анте · 10 мин'}
              </div>
            </div>
          </div>

          {/* Bottom Stats Strip — Responsive 1 col on mobile, 3 cols on sm+ */}
          <div className="mt-5 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div className="glass-well rounded-2xl px-4 py-3">
              <div className="text-xs text-slate-400">Осталось игроков</div>
              <div className="font-mono-tabular mt-1 text-xl sm:text-2xl font-extrabold text-white">
                {liveState.activePlayers.length}{' '}
                <span className="text-sm font-normal text-slate-400">
                  / {liveState.totalInitialPlayers}
                </span>
              </div>
            </div>
            <div className="glass-well rounded-2xl px-4 py-3">
              <div className="text-xs text-slate-400">Средний стек</div>
              <div className="font-mono-tabular mt-1 text-xl sm:text-2xl font-extrabold text-white">
                {averageStack.toLocaleString('ru-RU')}
              </div>
            </div>
            <div className="glass-well rounded-2xl px-4 py-3">
              <div className="text-xs text-slate-400">Следующий вылет</div>
              <div className="font-mono-tabular mt-1 text-xl sm:text-2xl font-extrabold text-[#F97316]">
                {nextEliminationPlace > 0
                  ? `#${nextEliminationPlace} (+${nextEliminationPoints} очк.)`
                  : 'Финал'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: ELIMINATION FEED, PENALTIES & ACTIVE PLAYERS (NO PLAYER CARDS) */}
        <div className="flex flex-col gap-5 sm:gap-6 lg:col-span-5">
          {/* Active Players List (Strictly NO cards displayed) */}
          <div className="glass-panel flex-1 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Игроки за столом ({liveState.activePlayers.length})
                </h2>
                <p className="text-xs text-slate-400">Активная рассадка по столам и боксам</p>
              </div>
              <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300">
                {liveState.tableFormat === '2_tables' ? '2 стола' : '1 стол'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {liveState.activePlayers.map((player) => {
                const banTimer = formatBanCountdown(player.penaltyExpiresAt);
                const hasPenalty = Boolean(player.penaltyNote || banTimer);
                return (
                  <div
                    key={player.playerId}
                    className={`flex flex-col justify-between rounded-xl px-3.5 py-2.5 transition-all ${
                      hasPenalty
                        ? 'border border-[#F97316]/60 bg-[#F97316]/10'
                        : 'glass-well'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">
                          {player.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          Стол {player.tableNumber} · Бокс #{player.seatNumber}
                        </div>
                      </div>

                      <span className="font-mono-tabular shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-bold text-slate-300">
                        #{player.seatNumber}
                      </span>
                    </div>

                    {hasPenalty && (
                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#F97316]/30 pt-1.5 text-[11px] font-bold text-[#F97316]">
                        <span className="truncate">{player.penaltyNote || 'Штраф дилера'}</span>
                        {banTimer && (
                          <span className="font-mono-tabular shrink-0 rounded bg-[#F97316] px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                            БАН {banTimer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {liveState.activePlayers.length === 0 && (
                <div className="col-span-full py-6 text-center text-xs text-slate-400">
                  Турнир завершён. Все места распределены.
                </div>
              )}
            </div>
          </div>

          {/* Live Elimination Feed */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Лента выбывших
                </h2>
                <p className="text-xs text-slate-400">Место и очки в реальном времени</p>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#F97316]">
                Выбыло: {liveState.eliminatedPlayers.length}
              </span>
            </div>

            <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
              {liveState.eliminatedPlayers.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Все игроки за столом. Выбывших пока нет.
                </div>
              ) : (
                liveState.eliminatedPlayers.map((entry) => (
                  <div
                    key={`${entry.place}-${entry.playerId}`}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 ${
                      entry.place === 1 ? 'glass-crimson' : 'glass-well'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="font-mono-tabular text-base sm:text-lg font-extrabold text-[#F97316] shrink-0">
                        #{entry.place}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">
                          {entry.playerName}
                        </div>
                        <div className="truncate text-xs text-slate-400">
                          {entry.eliminatedAtLevel}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-mono-tabular shrink-0 text-sm sm:text-base font-extrabold ${
                        entry.pointsAwarded > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {entry.pointsAwarded > 0 ? `+${entry.pointsAwarded} очк.` : 'БАН (0)'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Penalties Log (if any penalties issued during tournament) */}
          {liveState.penalties.length > 0 && (
            <div className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <AlertTriangle className="h-4 w-4 text-[#F97316]" />
                <h3 className="font-display text-base font-bold text-white">
                  Штрафы и решения дилера ({liveState.penalties.length})
                </h3>
              </div>
              <div className="mt-3 max-h-36 space-y-2 overflow-y-auto pr-1">
                {liveState.penalties.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="glass-well flex items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-xs"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-white">{item.playerName}:</span>{' '}
                      <span className="text-[#F97316]">{item.description}</span>
                    </div>
                    <span className="font-mono-tabular shrink-0 text-slate-400">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
