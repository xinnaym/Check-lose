import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { calculatePointsForPlace, TableFormat } from '../types/poker.ts';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Shuffle,
  UserMinus,
  Undo2,
  Plus,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    players,
    blindLevels,
    liveState,
    controlTimer,
    eliminatePlayer,
    undoLastElimination,
    reseatActivePlayers,
    startNewTournament,
    addPlayer,
  } = useClub();

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('Вечерний Холдем • Турнир #2');
  const [newFormat, setNewFormat] = useState<TableFormat>('1_table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quickPlayerName, setQuickPlayerName] = useState('');

  useEffect(() => {
    if (players.length > 0 && selectedIds.length === 0) {
      setSelectedIds(players.slice(0, 10).map((p) => p.id));
    }
  }, [players, selectedIds.length]);

  const showNotice = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  };

  const run = async (fn: () => Promise<void>, message?: string) => {
    setBusy(true);
    try {
      await fn();
      if (message) showNotice(message);
    } finally {
      setBusy(false);
    }
  };

  if (!liveState) {
    return (
      <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">
        Загрузка пульта дилера...
      </div>
    );
  }

  const currentLevel =
    blindLevels[liveState.currentLevelIndex] || blindLevels[0];

  const nextElimPlace = liveState.activePlayers.length;
  const nextElimPoints =
    nextElimPlace > 0
      ? calculatePointsForPlace(liveState.tableFormat, nextElimPlace)
      : 0;

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleQuickCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlayerName.trim()) return;
    await run(async () => {
      await addPlayer({ name: quickPlayerName.trim(), nickname: '' });
      setQuickPlayerName('');
    }, `Игрок ${quickPlayerName} добавлен в список`);
  };

  return (
    <div className="space-y-8 pb-16">
      {toast && (
        <div className="glass-crimson rounded-2xl px-5 py-3 text-xs font-bold text-white">
          {toast}
        </div>
      )}

      {/* 1. TIMER & LEVEL CONTROLS */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="text-xs font-bold text-[#F97316]">
              ПУЛЬТ ДИЛЕРА · МГНОВЕННАЯ СИНХРОНИЗАЦИЯ С ТВ
            </div>
            <h1 className="font-display mt-1 text-2xl font-extrabold text-white sm:text-3xl">
              {liveState.tournamentTitle}
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              {currentLevel?.isBreak
                ? currentLevel.breakTitle
                : `Уровень #${currentLevel?.levelNumber ?? 1} · Блайнды ${currentLevel?.smallBlind}/${currentLevel?.bigBlind}`}{' '}
              · Осталось за столом: {liveState.activePlayers.length} из{' '}
              {liveState.totalInitialPlayers}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-well font-mono-tabular mr-2 rounded-2xl px-5 py-2.5 text-3xl font-extrabold text-white">
              {formatClock(liveState.remainingSeconds)}
            </div>

            {liveState.status === 'running' ? (
              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('pause'))}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-extrabold text-black hover:bg-amber-300 cursor-pointer"
              >
                <Pause className="h-4 w-4" />
                <span>Пауза</span>
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('start'))}
                className="btn-crimson inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>Старт таймера</span>
              </button>
            )}

            <button
              disabled={busy}
              onClick={() => run(() => controlTimer('prev_level'))}
              className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              <SkipBack className="h-4 w-4" />
              <span>Пред.</span>
            </button>

            <button
              disabled={busy}
              onClick={() => run(() => controlTimer('next_level'))}
              className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              <SkipForward className="h-4 w-4" />
              <span>След. уровень</span>
            </button>

            <button
              disabled={busy}
              onClick={() => run(() => controlTimer('reset_level'))}
              className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-3 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Сброс 10:00</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PLAYERS & ONE-CLICK ELIMINATION */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Игроки за столом ({liveState.activePlayers.length})
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Нажмите «Выбыл» — система сама выдаст{' '}
              <strong className="text-white">#{nextElimPlace} место</strong> и начислит{' '}
              <strong className="text-emerald-400">+{nextElimPoints} очков</strong> в сезонный рейтинг
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              disabled={busy || liveState.activePlayers.length < 2}
              onClick={() =>
                run(() => reseatActivePlayers(), 'Рассадка по боксам (карты A–10) обновлена')
              }
              className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5 text-[#F97316]" />
              <span>Раздать боксы (A–10)</span>
            </button>

            {liveState.eliminatedPlayers.length > 0 && (
              <button
                disabled={busy}
                onClick={() =>
                  run(() => undoLastElimination(), 'Последнее выбывание отменено')
                }
                className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Отменить вылет</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {liveState.activePlayers.map((player) => (
            <div
              key={player.playerId}
              className="glass-well flex items-center justify-between gap-4 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`font-mono-tabular flex h-10 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xs font-extrabold ${
                    player.drawnCard.includes('♥') || player.drawnCard.includes('♦')
                      ? 'text-[#F97316]'
                      : 'text-white'
                  }`}
                >
                  {player.drawnCard}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-white">{player.name}</div>
                  <div className="text-xs text-slate-400">
                    Стол {player.tableNumber} · Бокс #{player.seatNumber}
                  </div>
                </div>
              </div>

              <button
                disabled={busy}
                onClick={() =>
                  run(
                    () => eliminatePlayer(player.playerId),
                    `${player.name} — #${nextElimPlace} место (+${nextElimPoints} очк.)`
                  )
                }
                className="btn-crimson inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserMinus className="h-3.5 w-3.5" />
                <span>
                  Выбыл (#{nextElimPlace} · +{nextElimPoints})
                </span>
              </button>
            </div>
          ))}

          {liveState.activePlayers.length === 0 && (
            <div className="col-span-2 py-8 text-center text-sm font-bold text-emerald-400">
              Турнир завершён! Все очки начислены в рейтинг. Запустите следующую игру ниже.
            </div>
          )}
        </div>
      </div>

      {/* 3. START NEW EVENING GAME (1 OR 2 TABLES) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              Запустить новый турнир вечера
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Стартовый стек 25 000 фишек · Автоматическая жеребьёвка мест картами от Туза до Десятки
            </p>
          </div>

          <form onSubmit={handleQuickCreatePlayer} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Имя нового игрока..."
              value={quickPlayerName}
              onChange={(e) => setQuickPlayerName(e.target.value)}
              className="glass-well rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="btn-glass inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-[#F97316]" />
              <span>В список</span>
            </button>
          </form>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs text-slate-400">Название игры</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="glass-well mt-1.5 w-full rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400">Формат и шаблон очков</label>
            <div className="glass-well mt-1.5 flex items-center gap-1 rounded-xl p-1">
              <button
                type="button"
                onClick={() => {
                  setNewFormat('1_table');
                  setSelectedIds(players.slice(0, 10).map((p) => p.id));
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  newFormat === '1_table' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 стол (10 мест · 150 очк.)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewFormat('2_tables');
                  setSelectedIds(players.slice(0, 16).map((p) => p.id));
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all cursor-pointer ${
                  newFormat === '2_tables' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 стола (до 20 мест · 280 очк.)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-semibold text-slate-300">
            Отметьте участников на вечер ({selectedIds.length} выбрано):
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {players.map((p) => {
              const active = selectedIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'glass-crimson text-white font-bold'
                      : 'glass-well text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono-tabular ml-2 shrink-0">
                    {active ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
          <button
            disabled={busy || selectedIds.length < 2}
            onClick={() =>
              run(
                () =>
                  startNewTournament({
                    tournamentTitle: newTitle,
                    tableFormat: newFormat,
                    startingStack: 25000,
                    selectedPlayerIds: selectedIds,
                    useRandomSeating: true,
                  }),
                `Турнир «${newTitle}» запущен и выведен на экран ТВ!`
              )
            }
            className="btn-crimson rounded-xl px-6 py-3 text-sm font-extrabold disabled:opacity-40 cursor-pointer"
          >
            Раздать боксы и начать турнир ({selectedIds.length} чел.)
          </button>
        </div>
      </div>
    </div>
  );
};
