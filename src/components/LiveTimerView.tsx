import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { calculatePointsForPlace } from '../types/poker.ts';
import { Maximize2, Minimize2, Sliders, Volume2, VolumeX } from 'lucide-react';

interface LiveTimerViewProps {
  onOpenAdmin: () => void;
}

export const LiveTimerView: React.FC<LiveTimerViewProps> = ({ onOpenAdmin }) => {
  const { liveState, blindLevels } = useClub();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  if (!liveState) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#121917] p-12 text-center text-[#94A39E]">
        Загрузка состояния Live-таймера...
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

  // Find next upcoming break for color-up notification
  const upcomingBreak = blindLevels
    .slice(liveState.currentLevelIndex + 1)
    .find((lvl) => lvl.isBreak);

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
    <div className="space-y-6 pb-12">
      {/* Top Broadcast Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#121917] px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A39E]">
          <span className="font-semibold text-[#F4F1EA]">{liveState.tournamentTitle}</span>
          <span aria-hidden="true">·</span>
          <span>
            {liveState.tableFormat === '2_tables'
              ? 'Формат: 2 стола (Шаблон B • до 280 очков)'
              : 'Формат: 1 стол (Шаблон A • до 150 очков)'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Стартовый стек:{' '}
            <strong className="font-mono-tabular text-[#F4F1EA]">
              {liveState.startingStack.toLocaleString('ru-RU')}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F0E] px-3 py-1.5 text-xs font-medium text-[#94A39E] hover:text-[#F4F1EA] whitespace-nowrap shrink-0 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>{soundEnabled ? 'Звук таймера вкл.' : 'Без звука'}</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3.5 py-1.5 text-xs font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/20 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Пульт дилера</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-1.5 text-xs font-medium text-[#F4F1EA] hover:bg-white/15 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Выйти из ТВ-режима</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>На весь экран ТВ (16:9)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Color-Up Break Notification Banner (TZ Section 3) */}
      {(currentLevel.isBreak || nextLevel?.isBreak) && (
        <div className="rounded-xl border border-[#D4AF37] bg-[#D4AF37]/15 px-6 py-4 text-center">
          <div className="text-xs font-semibold tracking-wider text-[#D4AF37]">
            УВЕДОМЛЕНИЕ ДИЛЕРА • ЧИП-РЕЙЗ (УКРУПНЕНИЕ ФИШЕК)
          </div>
          <div className="mt-1 text-base font-bold text-[#F4F1EA]">
            {currentLevel.isBreak
              ? `СЕЙЧАС ИДЁТ ПЕРЕРЫВ: ${currentLevel.breakTitle}`
              : `ПОСЛЕ ТЕКУЩЕГО УРОВНЯ: ${nextLevel?.breakTitle} (${Math.round((nextLevel?.durationSeconds || 300) / 60)} мин)`}
          </div>
        </div>
      )}

      {/* MAIN 16:9 BROADCAST GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT 7 COLUMNS: GIANT LEVEL CLOCK & BLINDS */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121917] p-6 sm:p-10 lg:col-span-7">
          {/* Top Status Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <div className="text-xs text-[#94A39E]">Текущий этап турнира</div>
              <div className="font-serif-display mt-0.5 text-2xl font-bold text-[#F4F1EA] sm:text-3xl">
                {currentLevel.isBreak
                  ? currentLevel.breakTitle || 'Перерыв на укрупнение фишек'
                  : `Уровень #${currentLevel.levelNumber ?? liveState.currentLevelIndex + 1}`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-[#94A39E]">Состояние часов</div>
              <div
                className={`mt-0.5 text-sm font-bold ${
                  liveState.status === 'running'
                    ? 'text-[#10B981]'
                    : liveState.status === 'completed'
                      ? 'text-[#D4AF37]'
                      : 'text-[#F59E0B]'
                }`}
              >
                {liveState.status === 'running'
                  ? 'ТАЙМЕР ЗАПУЩЕН'
                  : liveState.status === 'completed'
                    ? 'ТУРНИР ЗАВЕРШЁН'
                    : 'ПАУЗА'}
              </div>
            </div>
          </div>

          {/* Center Giant Countdown Clock */}
          <div className="my-8 text-center sm:my-10">
            <div className="text-xs tracking-widest text-[#94A39E]">
              ОСТАЛОСЬ ВРЕМЕНИ НА УРОВНЕ
            </div>
            <div
              className={`font-mono-tabular mt-2 text-7xl font-bold tracking-tight sm:text-8xl xl:text-9xl ${
                isLowTime
                  ? 'text-[#EF4444]'
                  : currentLevel.isBreak
                    ? 'text-[#D4AF37]'
                    : 'text-[#F4F1EA]'
              }`}
            >
              {formatClock(liveState.remainingSeconds)}
            </div>

            {/* Level Progress Bar */}
            <div className="mx-auto mt-6 h-2 w-full max-w-xl overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-[#D4AF37] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Current Blinds & Next Level */}
          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#0B0F0E] p-5">
              <div className="text-xs text-[#94A39E]">ТЕКУЩИЕ БЛАЙНДЫ (SB / BB)</div>
              <div className="font-mono-tabular mt-2 text-3xl font-bold text-[#D4AF37] sm:text-4xl">
                {currentLevel.isBreak
                  ? 'ПЕРЕРЫВ'
                  : `${currentLevel.smallBlind.toLocaleString('ru-RU')} / ${currentLevel.bigBlind.toLocaleString('ru-RU')}`}
              </div>
              <div className="font-mono-tabular mt-1.5 text-xs text-[#94A39E]">
                {currentLevel.ante > 0
                  ? `Анте (BB Ante): ${currentLevel.ante.toLocaleString('ru-RU')}`
                  : 'Без анте'}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0B0F0E] p-5">
              <div className="text-xs text-[#94A39E]">СЛЕДУЮЩИЙ УРОВЕНЬ</div>
              <div className="font-mono-tabular mt-2 text-2xl font-bold text-[#F4F1EA] sm:text-3xl">
                {!nextLevel
                  ? 'Финальный уровень'
                  : nextLevel.isBreak
                    ? 'Перерыв (Color-Up)'
                    : `${nextLevel.smallBlind.toLocaleString('ru-RU')} / ${nextLevel.bigBlind.toLocaleString('ru-RU')}`}
              </div>
              <div className="mt-1.5 text-xs text-[#94A39E]">
                {!nextLevel
                  ? 'Максимальные блайнды 40 000 / 50 000'
                  : nextLevel.isBreak
                    ? nextLevel.breakTitle
                    : nextLevel.ante > 0
                      ? `Анте: ${nextLevel.ante.toLocaleString('ru-RU')} · Длительность: ${Math.round(nextLevel.durationSeconds / 60)} мин`
                      : `Без анте · Длительность: ${Math.round(nextLevel.durationSeconds / 60)} мин`}
              </div>
            </div>
          </div>

          {/* Bottom Key Tournament Telemetry Bar */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5 text-center sm:text-left">
            <div>
              <div className="text-xs text-[#94A39E]">Осталось игроков</div>
              <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F4F1EA]">
                {liveState.activePlayers.length}{' '}
                <span className="text-sm font-normal text-[#94A39E]">
                  / {liveState.totalInitialPlayers}
                </span>
              </div>
            </div>

            <div>
              <div className="text-xs text-[#94A39E]">Средний стек</div>
              <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#F4F1EA]">
                {averageStack.toLocaleString('ru-RU')}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#94A39E]">Следующее выбывание</div>
              <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#10B981]">
                {nextEliminationPlace > 0
                  ? `#${nextEliminationPlace} (+${nextEliminationPoints} очк.)`
                  : 'Финал'}
              </div>
            </div>
          </div>

          {upcomingBreak && !currentLevel.isBreak && !nextLevel?.isBreak && (
            <div className="mt-4 border-t border-white/10 pt-3 text-xs text-[#94A39E]">
              Ближайшее укрупнение фишек: <strong className="text-[#F4F1EA]">{upcomingBreak.breakTitle}</strong>
            </div>
          )}
        </div>

        {/* RIGHT 5 COLUMNS: ACTIVE PLAYERS AT TABLES & REAL-TIME ELIMINATION FEED */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Real-Time Elimination & Points Feed (TZ Section 3) */}
          <div className="rounded-2xl border border-white/10 bg-[#121917] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
                  Лента выбывших и очки
                </h2>
                <p className="text-xs text-[#94A39E]">
                  Обновляется мгновенно и сохраняется в сезонный рейтинг
                </p>
              </div>
              <span className="font-mono-tabular text-xs font-semibold text-[#D4AF37]">
                Выбыло: {liveState.eliminatedPlayers.length}
              </span>
            </div>

            <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto pr-1">
              {liveState.eliminatedPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#94A39E]">
                  Ни один игрок ещё не покинул турнир. Все участники в игре.
                </div>
              ) : (
                liveState.eliminatedPlayers.map((entry) => (
                  <div
                    key={`${entry.place}-${entry.playerId}`}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                      entry.place === 1
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15'
                        : 'border-white/10 bg-[#0B0F0E]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="font-mono-tabular text-lg font-bold text-[#D4AF37]">
                        #{entry.place}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#F4F1EA]">
                          {entry.playerName}
                        </div>
                        <div className="text-xs text-[#94A39E]">
                          {entry.eliminatedAtLevel}
                          {entry.timestamp ? ` · ${entry.timestamp}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono-tabular text-base font-bold text-[#10B981]">
                        +{entry.pointsAwarded} очк.
                      </div>
                      <div className="text-[11px] text-[#94A39E]">В зачёт сезона</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Players & Seating Map */}
          <div className="flex-1 rounded-2xl border border-white/10 bg-[#121917] p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
                  Активные игроки за столом
                </h2>
                <p className="text-xs text-[#94A39E]">
                  Осталось игроков: {liveState.activePlayers.length}
                </p>
              </div>
              <span className="font-mono-tabular text-xs text-[#94A39E]">
                Рассадка по боксам
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {liveState.activePlayers.map((player) => (
                <div
                  key={player.playerId}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2.5"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-sm font-medium text-[#F4F1EA]">
                      {player.name}
                    </div>
                    <div className="text-xs text-[#94A39E]">
                      Стол {player.tableNumber} · Бокс {player.seatNumber}
                    </div>
                    {player.penaltyNote && (
                      <div className="mt-0.5 truncate text-[11px] text-[#F59E0B]">
                        {player.penaltyNote}
                      </div>
                    )}
                  </div>
                  <div className="font-mono-tabular shrink-0 text-xs font-bold text-[#D4AF37]">
                    {player.drawnCard}
                  </div>
                </div>
              ))}

              {liveState.activePlayers.length === 0 && (
                <div className="col-span-2 py-8 text-center text-sm text-[#D4AF37]">
                  Турнир завершён! Все места и очки распределены.
                </div>
              )}
            </div>

            {/* Recent Table Penalties Log if any */}
            {liveState.penalties.length > 0 && (
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="text-xs font-semibold text-[#F59E0B]">
                  Последние дисциплинарные решения дилера:
                </div>
                <div className="mt-2 space-y-1.5">
                  {liveState.penalties.slice(0, 2).map((pen) => (
                    <div
                      key={pen.id}
                      className="flex items-center justify-between text-xs text-[#94A39E]"
                    >
                      <span>
                        <strong className="text-[#F4F1EA]">{pen.playerName}</strong> —{' '}
                        {pen.description}
                      </span>
                      <span className="font-mono-tabular">{pen.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
