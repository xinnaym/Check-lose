import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import {
  BlindLevelRecord,
  calculatePointsForPlace,
  PlayerRecord,
  TableFormat,
} from '../types/poker.ts';
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
  Trash2,
  Save,
  LogIn,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    players,
    announcements,
    clubContent,
    blindLevels,
    liveState,
    currentUser,
    authLoading,
    authError,
    signInDealer,
    signOutDealer,
    controlTimer,
    eliminatePlayer,
    undoLastElimination,
    issuePenalty,
    reseatActivePlayers,
    startNewTournament,
    addPlayer,
    editPlayer,
    removePlayer,
    addAnnouncement,
    removeAnnouncement,
    saveClubContent,
    saveBlindStructure,
  } = useClub();

  const [activeSubTab, setActiveSubTab] = useState<
    'dealer' | 'players' | 'blinds' | 'cms'
  >('dealer');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New Tournament Launcher state
  const [newTitle, setNewTitle] = useState('Вечерняя Серия • Рейтинговый Турнир');
  const [newFormat, setNewFormat] = useState<TableFormat>('1_table');
  const [newStack, setNewStack] = useState(25000);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [useRandomCards, setUseRandomCards] = useState(true);

  // Initialize selectedIds when players load
  useEffect(() => {
    if (players.length > 0 && selectedIds.length === 0) {
      setSelectedIds(players.slice(0, 10).map((p) => p.id));
    }
  }, [players, selectedIds.length]);

  // Players CMS state
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerNick, setNewPlayerNick] = useState('');
  const [newPlayerPts, setNewPlayerPts] = useState(0);
  const [newPlayerNotes, setNewPlayerNotes] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [editPlayerDraft, setEditPlayerDraft] = useState<Partial<PlayerRecord>>({});

  // Blinds CMS state
  const [editableLevels, setEditableLevels] = useState<Omit<BlindLevelRecord, 'id'>[]>([]);
  useEffect(() => {
    if (blindLevels.length > 0) {
      setEditableLevels(
        blindLevels.map(({ id: _id, ...rest }) => ({
          ...rest,
        }))
      );
    }
  }, [blindLevels]);

  // Content CMS state
  const [selectedContentKey, setSelectedContentKey] = useState('rules_penalties');
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');

  useEffect(() => {
    const found = clubContent.find((c) => c.key === selectedContentKey);
    if (found) {
      setContentTitle(found.title);
      setContentBody(found.content);
    }
  }, [selectedContentKey, clubContent]);

  // Announcement creation state
  const [annTitle, setAnnTitle] = useState('');
  const [annDate, setAnnDate] = useState('Суббота • 19:30 МСК');
  const [annFormat, setAnnFormat] = useState('1 стол (10 мест) • Стек 25 000 • Уровни по 10 мин');
  const [annDesc, setAnnDesc] = useState('');
  const [annTotal, setAnnTotal] = useState(10);
  const [annTaken, setAnnTaken] = useState(4);

  const notifySuccess = (msg: string) => {
    setStatusMessage(msg);
    setActionError(null);
    window.setTimeout(() => setStatusMessage(null), 3500);
  };

  const runAction = async (fn: () => Promise<void>, successText?: string) => {
    setBusy(true);
    setActionError(null);
    try {
      await fn();
      if (successText) notifySuccess(successText);
    } catch (err: any) {
      setActionError(err.message || 'Ошибка выполнения операции');
    } finally {
      setBusy(false);
    }
  };

  const formatClock = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentLevel =
    liveState && blindLevels.length > 0
      ? blindLevels[liveState.currentLevelIndex] || blindLevels[0]
      : null;

  const nextElimPlace = liveState ? liveState.activePlayers.length : 0;
  const nextElimPoints =
    liveState && nextElimPlace > 0
      ? calculatePointsForPlace(liveState.tableFormat, nextElimPlace)
      : 0;

  const togglePlayerSelection = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Admin Header & Auth Status */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#121917] p-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#94A39E]">
            <span>Панель управления клубом и CMS</span>
            <span aria-hidden="true">·</span>
            <span>WebSocket синхронизация с ТВ в зале</span>
          </div>
          <h1 className="font-serif-display mt-1 text-2xl font-bold text-[#F4F1EA] sm:text-3xl">
            Пульт дилера и администратора
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {authLoading ? (
            <span className="text-xs text-[#94A39E]">Проверка сессии...</span>
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[#10B981]">Авторизован (Дилер)</div>
                <div className="text-xs font-medium text-[#F4F1EA]">
                  {currentUser.email || currentUser.displayName}
                </div>
              </div>
              <button
                onClick={() => signOutDealer()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:bg-white/5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Выйти</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInDealer()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Войти через Google (Дилер)</span>
            </button>
          )}
        </div>
      </div>

      {/* Authentication Notice Gate */}
      {!currentUser && !authLoading && (
        <div className="rounded-xl border border-[#D4AF37]/50 bg-[#121917] p-6 sm:p-8">
          <div className="max-w-2xl space-y-4">
            <div className="text-xs font-semibold text-[#D4AF37]">
              ЗАЩИТА АДМИН-ПАНЕЛИ (ТЗ РАЗДЕЛ 5)
            </div>
            <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
              Авторизуйтесь для управления Live-таймером и базой данных
            </h2>
            <p className="text-sm leading-relaxed text-[#94A39E]">
              Согласно требованиям безопасности, управление часами турнира, фиксация выбываний,
              начисление рейтинговых очков в PostgreSQL и редактирование CMS доступны только
              авторизованному дилеру или администратору клуба.
            </p>
            {authError && (
              <div className="text-xs font-medium text-[#EF4444]">{authError}</div>
            )}
            <button
              onClick={() => signInDealer()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-[#0B0F0E] hover:bg-[#e3be42] cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Войти через аккаунт Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {statusMessage && (
        <div className="rounded-lg border border-[#10B981]/40 bg-[#10B981]/10 px-4 py-3 text-xs font-medium text-[#10B981]">
          {statusMessage}
        </div>
      )}
      {actionError && (
        <div className="rounded-lg border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs font-medium text-[#EF4444]">
          {actionError}
        </div>
      )}

      {/* Admin Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/10 bg-[#121917] p-1">
        <button
          onClick={() => setActiveSubTab('dealer')}
          className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSubTab === 'dealer'
              ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
              : 'text-[#94A39E] hover:text-[#F4F1EA]'
          }`}
        >
          1. Live-пульт турнира и выбывания
        </button>
        <button
          onClick={() => setActiveSubTab('players')}
          className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSubTab === 'players'
              ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
              : 'text-[#94A39E] hover:text-[#F4F1EA]'
          }`}
        >
          2. Игроки и корректировка очков ({players.length})
        </button>
        <button
          onClick={() => setActiveSubTab('blinds')}
          className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSubTab === 'blinds'
              ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
              : 'text-[#94A39E] hover:text-[#F4F1EA]'
          }`}
        >
          3. Структура блайндов ({blindLevels.length} этапов)
        </button>
        <button
          onClick={() => setActiveSubTab('cms')}
          className={`rounded-md px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeSubTab === 'cms'
              ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
              : 'text-[#94A39E] hover:text-[#F4F1EA]'
          }`}
        >
          4. CMS: Правила и анонсы вечера
        </button>
      </div>

      {/* =====================================================================
          TAB 1: LIVE TOURNAMENT DEALER CONSOLE
      ===================================================================== */}
      {activeSubTab === 'dealer' && liveState && (
        <div className="space-y-8">
          {/* Clock & Level Controls */}
          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-1">
                <div className="text-xs text-[#94A39E]">
                  Активный турнир ·{' '}
                  {liveState.tableFormat === '2_tables'
                    ? 'Шаблон B (2 стола)'
                    : 'Шаблон A (1 стол)'}
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
                  {liveState.tournamentTitle}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A39E]">
                  <span>
                    Текущий этап:{' '}
                    <strong className="text-[#D4AF37]">
                      {currentLevel?.isBreak
                        ? currentLevel.breakTitle
                        : `Уровень ${currentLevel?.levelNumber ?? 1} (${currentLevel?.smallBlind}/${currentLevel?.bigBlind})`}
                    </strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    В игре:{' '}
                    <strong className="font-mono-tabular text-[#F4F1EA]">
                      {liveState.activePlayers.length} из {liveState.totalInitialPlayers}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="font-mono-tabular mr-2 rounded-lg border border-white/10 bg-[#0B0F0E] px-4 py-2 text-3xl font-bold text-[#F4F1EA]">
                  {formatClock(liveState.remainingSeconds)}
                </div>

                {liveState.status === 'running' ? (
                  <button
                    disabled={!currentUser || busy}
                    onClick={() => runAction(() => controlTimer('pause'), 'Таймер поставлен на паузу')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F59E0B] px-4 py-2.5 text-xs font-semibold text-[#0B0F0E] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Пауза</span>
                  </button>
                ) : (
                  <button
                    disabled={!currentUser || busy}
                    onClick={() => runAction(() => controlTimer('start'), 'Таймер запущен')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#10B981] px-4 py-2.5 text-xs font-semibold text-[#0B0F0E] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    <span>Старт</span>
                  </button>
                )}

                <button
                  disabled={!currentUser || busy}
                  onClick={() =>
                    runAction(() => controlTimer('prev_level'), 'Переключено на предыдущий уровень')
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0F0E] px-3 py-2.5 text-xs font-medium text-[#F4F1EA] hover:bg-white/5 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <SkipBack className="h-3.5 w-3.5" />
                  <span>Пред. уровень</span>
                </button>

                <button
                  disabled={!currentUser || busy}
                  onClick={() =>
                    runAction(() => controlTimer('next_level'), 'Переключено на следующий уровень')
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0F0E] px-3 py-2.5 text-xs font-medium text-[#F4F1EA] hover:bg-white/5 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>След. уровень</span>
                </button>

                <button
                  disabled={!currentUser || busy}
                  onClick={() =>
                    runAction(() => controlTimer('reset_level'), 'Время уровня сброшено')
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0F0E] px-3 py-2.5 text-xs font-medium text-[#94A39E] hover:text-[#F4F1EA] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Сброс времени</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Players & Key Elimination Controls (TZ Section 3) */}
          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
                  Фиксация выбывания игроков за столом
                </h3>
                <p className="text-xs text-[#94A39E]">
                  При нажатии кнопки «Выбыл» игроку автоматически присваивается{' '}
                  <strong className="text-[#D4AF37]">#{nextElimPlace} место</strong> и начисляется{' '}
                  <strong className="text-[#10B981]">+{nextElimPoints} очков</strong> в рейтинг БД
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  disabled={!currentUser || busy || liveState.activePlayers.length < 2}
                  onClick={() =>
                    runAction(
                      () => reseatActivePlayers(),
                      'Боксы и карты рассадки (A–10) перераспределены'
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0F0E] px-3 py-2 text-xs font-medium text-[#F4F1EA] hover:bg-white/5 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Генератор рассадки (Карты A–10)</span>
                </button>

                {liveState.eliminatedPlayers.length > 0 && (
                  <button
                    disabled={!currentUser || busy}
                    onClick={() =>
                      runAction(
                        () => undoLastElimination(),
                        'Последнее выбывание отменено, очки скорректированы'
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0B0F0E] px-3 py-2 text-xs font-medium text-[#94A39E] hover:text-[#F4F1EA] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                    <span>Отменить последнее выбывание</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 divide-y divide-white/5">
              {liveState.activePlayers.map((player) => (
                <div
                  key={player.playerId}
                  className="flex flex-col justify-between gap-4 py-3.5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="font-mono-tabular flex h-9 w-12 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/30 bg-[#0B0F0E] text-xs font-bold text-[#D4AF37]">
                      {player.drawnCard}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[#F4F1EA]">
                        {player.name}{' '}
                        <span className="text-xs font-normal text-[#94A39E]">
                          ({player.nickname})
                        </span>
                      </div>
                      <div className="text-xs text-[#94A39E]">
                        Стол {player.tableNumber} · Бокс #{player.seatNumber}
                        {player.penaltyNote ? ` · ${player.penaltyNote}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Quick Disciplinary Penalties (TZ Section 2) */}
                    <button
                      disabled={!currentUser || busy}
                      onClick={() =>
                        runAction(
                          () => issuePenalty(player.playerId, 'show_cards_500'),
                          `Назначен штраф 500 фишек (показ карт): ${player.name}`
                        )
                      }
                      className="rounded-md border border-white/10 bg-[#0B0F0E] px-2.5 py-1.5 text-[11px] text-[#94A39E] hover:border-[#F59E0B] hover:text-[#F59E0B] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Штраф 500 (Карты)
                    </button>

                    <button
                      disabled={!currentUser || busy}
                      onClick={() =>
                        runAction(
                          () => issuePenalty(player.playerId, 'check_nuts_5min'),
                          `Удаление на 5 мин за чек с натсом: ${player.name}`
                        )
                      }
                      className="rounded-md border border-white/10 bg-[#0B0F0E] px-2.5 py-1.5 text-[11px] text-[#94A39E] hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Чек с натсом (5 мин)
                    </button>

                    <button
                      disabled={!currentUser || busy}
                      onClick={() =>
                        runAction(
                          () => issuePenalty(player.playerId, 'collusion_1000'),
                          `Назначен штраф 1000 фишек (сговор): ${player.name}`
                        )
                      }
                      className="rounded-md border border-white/10 bg-[#0B0F0E] px-2.5 py-1.5 text-[11px] text-[#94A39E] hover:border-[#EF4444] hover:text-[#EF4444] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Штраф 1000 (Сговор)
                    </button>

                    {/* Primary Elimination Button */}
                    <button
                      disabled={!currentUser || busy}
                      onClick={() =>
                        runAction(
                          () => eliminatePlayer(player.playerId),
                          `Игрок ${player.name} выбыл (#${nextElimPlace} место, +${nextElimPoints} очк. в рейтинг)`
                        )
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#EF4444] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#dc2626] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      <span>
                        Выбыл (#{nextElimPlace} · +{nextElimPoints} очк.)
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {liveState.activePlayers.length === 0 && (
                <div className="py-8 text-center text-sm text-[#10B981]">
                  Все места распределены! Турнир завершён и сохранён в Архив. Вы можете запустить
                  следующий турнир вечера ниже.
                </div>
              )}
            </div>
          </div>

          {/* Launch New Evening Tournament & Card Seating Generator */}
          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
              Старт нового турнира вечера (1 или 2 стола)
            </h3>
            <p className="mt-1 text-xs text-[#94A39E]">
              Выберите формат (Шаблон A или Шаблон B), отметьте игроков и запустите генератор
              рассадки со стартовым стеком 25 000 фишек
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-[#94A39E]">Название турнира</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#94A39E]">
                  Формат столов и сетка очков
                </label>
                <select
                  value={newFormat}
                  onChange={(e) => {
                    const fmt = e.target.value as TableFormat;
                    setNewFormat(fmt);
                    if (fmt === '1_table') {
                      setSelectedIds(players.slice(0, 10).map((p) => p.id));
                    } else {
                      setSelectedIds(players.slice(0, 16).map((p) => p.id));
                    }
                  }}
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="1_table">1 стол (до 10 мест • Шаблон A: 150..10 очк.)</option>
                  <option value="2_tables">2 стола (14–20 мест • Шаблон B: 280..15 очк.)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#94A39E]">Стартовый стек (фишек)</label>
                <input
                  type="number"
                  value={newStack}
                  onChange={(e) => setNewStack(Number(e.target.value))}
                  className="font-mono-tabular mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-[#F4F1EA]">
                  Выбрано участников: {selectedIds.length}
                </span>
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedIds(players.slice(0, 10).map((p) => p.id))}
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Выбрать 10 игроков (1 стол)
                  </button>
                  <span aria-hidden="true" className="text-[#94A39E]">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(players.slice(0, 16).map((p) => p.id))}
                    className="text-[#D4AF37] hover:underline cursor-pointer"
                  >
                    Выбрать 16 игроков (2 стола)
                  </button>
                  <span aria-hidden="true" className="text-[#94A39E]">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedIds(players.map((p) => p.id))}
                    className="text-[#94A39E] hover:text-[#F4F1EA] cursor-pointer"
                  >
                    Все ({players.length})
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {players.map((p) => {
                  const checked = selectedIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlayerSelection(p.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                        checked
                          ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F4F1EA]'
                          : 'border-white/10 bg-[#0B0F0E] text-[#94A39E] hover:text-[#F4F1EA]'
                      }`}
                    >
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="font-mono-tabular ml-2 shrink-0 text-[11px]">
                        {checked ? '✓' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 text-xs text-[#94A39E] cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRandomCards}
                  onChange={(e) => setUseRandomCards(e.target.checked)}
                  className="rounded border-white/20"
                />
                <span>
                  Автоматический розыгрыш боксов (генератор случайных карт от Туза до Десятки)
                </span>
              </label>

              <button
                disabled={!currentUser || busy || selectedIds.length < 2}
                onClick={() =>
                  runAction(
                    () =>
                      startNewTournament({
                        tournamentTitle: newTitle,
                        tableFormat: newFormat,
                        startingStack: newStack,
                        selectedPlayerIds: selectedIds,
                        useRandomSeating: useRandomCards,
                      }),
                    `Новый турнир «${newTitle}» сформирован и выведен на ТВ-экран!`
                  )
                }
                className="rounded-lg bg-[#D4AF37] px-5 py-2.5 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Сформировать рассадку и запустить турнир
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PLAYERS & MANUAL POINTS ADJUSTMENT (CMS)
      ===================================================================== */}
      {activeSubTab === 'players' && (
        <div className="space-y-8">
          {/* Add New Player Form */}
          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
              Добавить нового участника клуба
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
              <input
                type="text"
                placeholder="Имя и Фамилия"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
              <input
                type="text"
                placeholder="Покерный никнейм"
                value={newPlayerNick}
                onChange={(e) => setNewPlayerNick(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
              <input
                type="number"
                placeholder="Стартовые очки сезона"
                value={newPlayerPts}
                onChange={(e) => setNewPlayerPts(Number(e.target.value))}
                className="font-mono-tabular rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
              <input
                type="text"
                placeholder="Заметка (стиль игры)"
                value={newPlayerNotes}
                onChange={(e) => setNewPlayerNotes(e.target.value)}
                className="rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
            </div>
            <div className="mt-4">
              <button
                disabled={!currentUser || busy || !newPlayerName.trim()}
                onClick={() =>
                  runAction(async () => {
                    await addPlayer({
                      name: newPlayerName,
                      nickname: newPlayerNick,
                      seasonPoints: newPlayerPts,
                      notes: newPlayerNotes,
                    });
                    setNewPlayerName('');
                    setNewPlayerNick('');
                    setNewPlayerPts(0);
                    setNewPlayerNotes('');
                  }, 'Новый игрок добавлен в базу данных клуба')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить игрока</span>
              </button>
            </div>
          </div>

          {/* Players List with Manual Points Adjustment */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121917]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0B0F0E]/60 text-xs text-[#94A39E]">
                    <th className="py-3 pl-6 pr-3 font-medium">Игрок</th>
                    <th className="py-3 px-3 font-medium">Никнейм</th>
                    <th className="py-3 px-3 text-right font-medium">Очки сезона</th>
                    <th className="py-3 px-3 text-right font-medium">Игр</th>
                    <th className="py-3 px-3 text-right font-medium">Побед</th>
                    <th className="py-3 pl-3 pr-6 text-right font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {players.map((p) => {
                    const isEditing = editingPlayerId === p.id;
                    return (
                      <tr key={p.id}>
                        <td className="py-3 pl-6 pr-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPlayerDraft.name ?? p.name}
                              onChange={(e) =>
                                setEditPlayerDraft({ ...editPlayerDraft, name: e.target.value })
                              }
                              className="w-full rounded border border-white/20 bg-[#0B0F0E] px-2 py-1 text-xs text-[#F4F1EA]"
                            />
                          ) : (
                            <span className="font-medium text-[#F4F1EA]">{p.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPlayerDraft.nickname ?? p.nickname}
                              onChange={(e) =>
                                setEditPlayerDraft({
                                  ...editPlayerDraft,
                                  nickname: e.target.value,
                                })
                              }
                              className="w-full rounded border border-white/20 bg-[#0B0F0E] px-2 py-1 text-xs text-[#F4F1EA]"
                            />
                          ) : (
                            <span className="text-xs text-[#94A39E]">{p.nickname}</span>
                          )}
                        </td>
                        <td className="font-mono-tabular py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPlayerDraft.seasonPoints ?? p.seasonPoints}
                              onChange={(e) =>
                                setEditPlayerDraft({
                                  ...editPlayerDraft,
                                  seasonPoints: Number(e.target.value),
                                })
                              }
                              className="w-24 rounded border border-[#D4AF37] bg-[#0B0F0E] px-2 py-1 text-right text-xs font-bold text-[#D4AF37]"
                            />
                          ) : (
                            <span className="font-bold text-[#D4AF37]">{p.seasonPoints}</span>
                          )}
                        </td>
                        <td className="font-mono-tabular py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPlayerDraft.gamesPlayed ?? p.gamesPlayed}
                              onChange={(e) =>
                                setEditPlayerDraft({
                                  ...editPlayerDraft,
                                  gamesPlayed: Number(e.target.value),
                                })
                              }
                              className="w-16 rounded border border-white/20 bg-[#0B0F0E] px-2 py-1 text-right text-xs text-[#F4F1EA]"
                            />
                          ) : (
                            p.gamesPlayed
                          )}
                        </td>
                        <td className="font-mono-tabular py-3 px-3 text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editPlayerDraft.winsCount ?? p.winsCount}
                              onChange={(e) =>
                                setEditPlayerDraft({
                                  ...editPlayerDraft,
                                  winsCount: Number(e.target.value),
                                })
                              }
                              className="w-16 rounded border border-white/20 bg-[#0B0F0E] px-2 py-1 text-right text-xs text-[#F4F1EA]"
                            />
                          ) : (
                            p.winsCount
                          )}
                        </td>
                        <td className="py-3 pl-3 pr-6 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button
                                disabled={!currentUser || busy}
                                onClick={() =>
                                  runAction(async () => {
                                    await editPlayer(p.id, editPlayerDraft);
                                    setEditingPlayerId(null);
                                  }, 'Профиль и очки игрока обновлены')
                                }
                                className="rounded bg-[#10B981] px-2.5 py-1 text-xs font-semibold text-[#0B0F0E] cursor-pointer"
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setEditingPlayerId(null)}
                                className="rounded border border-white/15 px-2.5 py-1 text-xs text-[#94A39E] cursor-pointer"
                              >
                                Отмена
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingPlayerId(p.id);
                                  setEditPlayerDraft(p);
                                }}
                                className="rounded border border-white/15 px-2.5 py-1 text-xs text-[#F4F1EA] hover:bg-white/5 cursor-pointer"
                              >
                                Изменить очки
                              </button>
                              <button
                                disabled={!currentUser || busy}
                                onClick={() =>
                                  runAction(() => removePlayer(p.id), 'Игрок удалён')
                                }
                                className="rounded border border-white/10 px-2 py-1 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: BLIND STRUCTURE EDITOR (CMS)
      ===================================================================== */}
      {activeSubTab === 'blinds' && (
        <div className="space-y-6 rounded-xl border border-white/10 bg-[#121917] p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
                Редактор структуры блайндов и перерывов
              </h3>
              <p className="text-xs text-[#94A39E]">
                Настройка уровней от 100/200 до 40 000/50 000 и перерывов на укрупнение фишек
              </p>
            </div>
            <button
              disabled={!currentUser || busy}
              onClick={() =>
                runAction(
                  () => saveBlindStructure(editableLevels),
                  'Структура блайндов сохранена в БД и синхронизирована с Live-таймером'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] disabled:opacity-40 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Сохранить таблицу блайндов</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {editableLevels.map((lvl, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 gap-3 rounded-lg border border-white/10 bg-[#0B0F0E] p-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="font-mono-tabular text-xs font-bold text-[#D4AF37] sm:col-span-2">
                  {lvl.isBreak ? 'ПЕРЕРЫВ' : `Уровень #${lvl.levelNumber ?? idx + 1}`}
                </div>

                {lvl.isBreak ? (
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      value={lvl.breakTitle}
                      onChange={(e) => {
                        const copy = [...editableLevels];
                        copy[idx] = { ...copy[idx], breakTitle: e.target.value };
                        setEditableLevels(copy);
                      }}
                      className="w-full rounded border border-white/15 bg-[#121917] px-2.5 py-1.5 text-xs text-[#F4F1EA]"
                    />
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#94A39E]">Малый блайнд</label>
                      <input
                        type="number"
                        value={lvl.smallBlind}
                        onChange={(e) => {
                          const copy = [...editableLevels];
                          copy[idx] = { ...copy[idx], smallBlind: Number(e.target.value) };
                          setEditableLevels(copy);
                        }}
                        className="font-mono-tabular w-full rounded border border-white/15 bg-[#121917] px-2 py-1 text-xs text-[#F4F1EA]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#94A39E]">Большой блайнд</label>
                      <input
                        type="number"
                        value={lvl.bigBlind}
                        onChange={(e) => {
                          const copy = [...editableLevels];
                          copy[idx] = { ...copy[idx], bigBlind: Number(e.target.value) };
                          setEditableLevels(copy);
                        }}
                        className="font-mono-tabular w-full rounded border border-white/15 bg-[#121917] px-2 py-1 text-xs text-[#F4F1EA]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#94A39E]">Анте</label>
                      <input
                        type="number"
                        value={lvl.ante}
                        onChange={(e) => {
                          const copy = [...editableLevels];
                          copy[idx] = { ...copy[idx], ante: Number(e.target.value) };
                          setEditableLevels(copy);
                        }}
                        className="font-mono-tabular w-full rounded border border-white/15 bg-[#121917] px-2 py-1 text-xs text-[#F4F1EA]"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-[#94A39E]">Время (сек)</label>
                  <input
                    type="number"
                    value={lvl.durationSeconds}
                    onChange={(e) => {
                      const copy = [...editableLevels];
                      copy[idx] = { ...copy[idx], durationSeconds: Number(e.target.value) };
                      setEditableLevels(copy);
                    }}
                    className="font-mono-tabular w-full rounded border border-white/15 bg-[#121917] px-2 py-1 text-xs text-[#F4F1EA]"
                  />
                </div>

                <div className="text-right sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      const copy = editableLevels.filter((_, i) => i !== idx);
                      setEditableLevels(
                        copy.map((item, i) => ({ ...item, levelOrder: i + 1 }))
                      );
                    }}
                    className="rounded border border-white/10 px-2.5 py-1 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 cursor-pointer"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: CMS RULES & ANNOUNCEMENTS
      ===================================================================== */}
      {activeSubTab === 'cms' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Edit Club Rules & Texts */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#121917] p-6">
            <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
              Редактирование текстов правил и описания клуба
            </h3>

            <div>
              <label className="block text-xs text-[#94A39E]">Выберите раздел</label>
              <select
                value={selectedContentKey}
                onChange={(e) => setSelectedContentKey(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              >
                <option value="club_about">О клубе (Главная страница)</option>
                <option value="season_info">Описание сезона (Рейтинг Топ-10)</option>
                <option value="rules_etiquette">Этикет и поведение за столом</option>
                <option value="rules_penalties">Система штрафов (500 / 5 мин / 1000)</option>
                <option value="rules_disclaimer">Отказ от ответственности (УК РФ)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#94A39E]">Заголовок блока</label>
              <input
                type="text"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#94A39E]">Содержимое раздела</label>
              <textarea
                rows={7}
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0B0F0E] p-3.5 text-sm leading-relaxed text-[#F4F1EA]"
              />
            </div>

            <button
              disabled={!currentUser || busy}
              onClick={() =>
                runAction(
                  () => saveClubContent(selectedContentKey, contentTitle, contentBody),
                  'Текст раздела сохранён в базу данных'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] disabled:opacity-40 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Сохранить раздел</span>
            </button>
          </div>

          {/* Manage Evening Announcements */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#121917] p-6">
            <h3 className="font-serif-display text-xl font-bold text-[#F4F1EA]">
              Анонсы турниров на главной странице
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Название анонса (например, Серия №4 • Субботний Холдем)"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Дата и время"
                  value={annDate}
                  onChange={(e) => setAnnDate(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
                />
                <input
                  type="text"
                  placeholder="Формат"
                  value={annFormat}
                  onChange={(e) => setAnnFormat(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#0B0F0E] px-3.5 py-2 text-sm text-[#F4F1EA]"
                />
              </div>
              <textarea
                rows={3}
                placeholder="Краткое описание турнира..."
                value={annDesc}
                onChange={(e) => setAnnDesc(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#0B0F0E] p-3.5 text-sm text-[#F4F1EA]"
              />
              <button
                disabled={!currentUser || busy || !annTitle.trim()}
                onClick={() =>
                  runAction(async () => {
                    await addAnnouncement({
                      title: annTitle,
                      eventDate: annDate,
                      format: annFormat,
                      description: annDesc,
                      status: 'registration',
                      spotsTotal: annTotal,
                      spotsTaken: annTaken,
                    });
                    setAnnTitle('');
                    setAnnDesc('');
                  }, 'Анонс турнира опубликован')
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-semibold text-[#0B0F0E] hover:bg-[#e3be42] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Опубликовать анонс</span>
              </button>
            </div>

            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0B0F0E] px-4 py-3"
                >
                  <div className="min-w-0 pr-3">
                    <div className="truncate text-sm font-medium text-[#F4F1EA]">
                      {ann.title}
                    </div>
                    <div className="text-xs text-[#94A39E]">{ann.eventDate}</div>
                  </div>
                  <button
                    disabled={!currentUser || busy}
                    onClick={() =>
                      runAction(() => removeAnnouncement(ann.id), 'Анонс удалён')
                    }
                    className="rounded border border-white/10 p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 disabled:opacity-40 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
