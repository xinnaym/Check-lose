import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { calculatePointsForPlace } from '../types/poker.ts';
import { Maximize2, Minimize2, Sliders } from 'lucide-react';

interface LiveTimerViewProps {
  onOpenAdmin: () => void;
}

export const LiveTimerView: React.FC<LiveTimerViewProps> = ({ onOpenAdmin }) => {
  const { liveState, blindLevels } = useClub();
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!liveState) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
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
      {/* Top Broadcast Bar */}
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="font-display text-sm font-bold text-white">
            {liveState.tournamentTitle}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {liveState.tableFormat === '2_tables'
              ? '2 стола (Шаблон B • до 280 очк.)'
              : '1 стол (Шаблон A • до 150 очк.)'}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Стартовый стек:{' '}
            <strong className="font-mono-tabular text-white">
              {liveState.startingStack.toLocaleString('ru-RU')}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdmin}
            className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Sliders className="h-3.5 w-3.5 text-[#F43F5E]" />
            <span>Пульт дилера</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="btn-crimson inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Обычный режим</span>
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

      {/* Color-Up Break Notification */}
      {(currentLevel.isBreak || nextLevel?.isBreak) && (
        <div className="glass-crimson rounded-2xl px-6 py-4 text-center">
          <div className="text-xs font-bold tracking-wider text-rose-300">
            ПЕРЕРЫВ В ИГРЕ · УКРУПНЕНИЕ ФИШЕК (COLOR-UP)
          </div>
          <div className="font-display mt-1 text-lg font-bold text-white">
            {currentLevel.isBreak
              ? currentLevel.breakTitle
              : `После этого уровня: ${nextLevel?.breakTitle}`}
          </div>
        </div>
      )}

      {/* 16:9 MAIN BROADCAST SCREEN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT 7 COLS: CLOCK & BLINDS */}
        <div className="glass-panel flex flex-col justify-between rounded-3xl p-6 sm:p-10 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <div className="text-xs text-slate-400">Текущий уровень</div>
              <div className="font-display mt-0.5 text-2xl font-extrabold text-white sm:text-3xl">
                {currentLevel.isBreak
                  ? 'Перерыв'
                  : `Уровень #${currentLevel.levelNumber ?? liveState.currentLevelIndex + 1}`}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Статус таймера</div>
              <div
                className={`mt-0.5 text-sm font-extrabold ${
                  liveState.status === 'running'
                    ? 'text-emerald-400'
                    : liveState.status === 'completed'
                      ? 'text-[#F43F5E]'
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

          {/* Giant 10:00 -> 00:00 Clock */}
          <div className="my-8 text-center sm:my-10">
            <div className="text-xs font-semibold tracking-widest text-slate-400">
              ДО СМЕНЫ УРОВНЯ БЛАЙНДОВ
            </div>
            <div
              className={`font-mono-tabular mt-2 text-7xl font-extrabold tracking-tight sm:text-8xl xl:text-9xl ${
                isLowTime ? 'text-[#F43F5E]' : 'text-white'
              }`}
            >
              {formatClock(liveState.remainingSeconds)}
            </div>

            <div className="glass-well mx-auto mt-6 h-2.5 w-full max-w-xl overflow-hidden rounded-full">
              <div
                className="h-full bg-gradient-to-r from-[#E11D48] to-[#FB7185] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Current & Next Blinds */}
          <div className="grid grid-cols-1 gap-4 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="glass-crimson rounded-2xl p-5">
              <div className="text-xs font-bold text-rose-200">ТЕКУЩИЕ БЛАЙНДЫ</div>
              <div className="font-mono-tabular mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                {currentLevel.isBreak
                  ? 'ПЕРЕРЫВ'
                  : `${currentLevel.smallBlind.toLocaleString('ru-RU')} / ${currentLevel.bigBlind.toLocaleString('ru-RU')}`}
              </div>
              <div className="font-mono-tabular mt-1.5 text-xs text-rose-100/80">
                {currentLevel.ante > 0
                  ? `Анте: ${currentLevel.ante.toLocaleString('ru-RU')}`
                  : 'Без анте'}
              </div>
            </div>

            <div className="glass-well rounded-2xl p-5">
              <div className="text-xs font-semibold text-slate-400">СЛЕДУЮЩИЙ УРОВЕНЬ</div>
              <div className="font-mono-tabular mt-2 text-2xl font-extrabold text-white sm:text-3xl">
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

          {/* Bottom Stats Strip */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
            <div>
              <div className="text-xs text-slate-400">Осталось игроков</div>
              <div className="font-mono-tabular mt-1 text-2xl font-extrabold text-white">
                {liveState.activePlayers.length}{' '}
                <span className="text-sm font-normal text-slate-400">
                  / {liveState.totalInitialPlayers}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Средний стек</div>
              <div className="font-mono-tabular mt-1 text-2xl font-extrabold text-white">
                {averageStack.toLocaleString('ru-RU')}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Следующий вылет</div>
              <div className="font-mono-tabular mt-1 text-2xl font-extrabold text-[#F43F5E]">
                {nextEliminationPlace > 0
                  ? `#${nextEliminationPlace} (+${nextEliminationPoints})`
                  : 'Финал'}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: ELIMINATION FEED & ACTIVE PLAYERS */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Live Elimination Feed */}
          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <div>
                <h2 className="font-display text-xl font-bold text-white">Лента выбывших</h2>
                <p className="text-xs text-slate-400">Место и очки в реальном времени</p>
              </div>
              <span className="font-mono-tabular text-xs font-bold text-[#F43F5E]">
                Выбыло: {liveState.eliminatedPlayers.length}
              </span>
            </div>

            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
              {liveState.eliminatedPlayers.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Все игроки за столом. Выбывших пока нет.
                </div>
              ) : (
                liveState.eliminatedPlayers.map((entry) => (
                  <div
                    key={`${entry.place}-${entry.playerId}`}
                    className={`flex items-center justify-between rounded-xl px-4 py-3 ${
                      entry.place === 1 ? 'glass-crimson' : 'glass-well'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="font-mono-tabular text-lg font-extrabold text-[#F43F5E]">
                        #{entry.place}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{entry.playerName}</div>
                        <div className="text-xs text-slate-400">{entry.eliminatedAtLevel}</div>
                      </div>
                    </div>

                    <div className="font-mono-tabular text-base font-extrabold text-emerald-400">
                      +{entry.pointsAwarded} очк.
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Players List */}
          <div className="glass-panel flex-1 rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
              <h2 className="font-display text-xl font-bold text-white">
                В игре ({liveState.activePlayers.length})
              </h2>
              <span className="text-xs text-slate-400">Рассадка по боксам</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {liveState.activePlayers.map((player) => (
                <div
                  key={player.playerId}
                  className="glass-well flex items-center justify-between rounded-xl px-3.5 py-2.5"
                >
                  <div className="min-w-0 pr-2">
                    <div className="truncate text-sm font-semibold text-white">
                      {player.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      Стол {player.tableNumber} · Бокс {player.seatNumber}
                    </div>
                  </div>
                  <span
                    className={`font-mono-tabular shrink-0 text-xs font-extrabold ${
                      player.drawnCard.includes('♥') || player.drawnCard.includes('♦')
                        ? 'text-[#F43F5E]'
                        : 'text-slate-300'
                    }`}
                  >
                    {player.drawnCard}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
