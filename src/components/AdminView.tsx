import React, { useState, useEffect, useMemo } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import {
  calculatePointsForPlace,
  parseRegisteredPlayers,
  PenaltyType,
  TableFormat,
} from '../types/poker.ts';
import { CLUB_LOGO_PATH } from '../App.tsx';
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
  Lock,
  LogOut,
  ShieldAlert,
  Ban,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  KeyRound,
  Mail,
  User,
  Users,
} from 'lucide-react';

export const AdminView: React.FC = () => {
  const {
    players,
    announcements,
    blindLevels,
    liveState,
    currentUser,
    isDealerAuthorized,
    loginUser,
    logoutUser,
    controlTimer,
    eliminatePlayer,
    undoLastElimination,
    issuePenalty,
    clearPlayerPenalty,
    togglePlayerBan,
    reseatActivePlayers,
    startNewTournament,
    addPlayer,
    editPlayer,
  } = useClub();

  // Dealer Account Auth State
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Dealer Console State
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedPenaltyPlayerId, setExpandedPenaltyPlayerId] = useState<number | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());

  // Search Filters (by First Name & Last Name)
  const [activeTableSearch, setActiveTableSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [newGamePlayerSearch, setNewGamePlayerSearch] = useState('');

  // New Tournament State
  const [newTitle, setNewTitle] = useState('Вечерний Холдем • Турнир #2');
  const [newFormat, setNewFormat] = useState<TableFormat>('1_table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quickPlayerName, setQuickPlayerName] = useState('');

  const [banReasonInput, setBanReasonInput] = useState<Record<number, string>>({});

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const eligible = players.filter((p) => !p.isBanned);
    if (eligible.length > 0 && selectedIds.length === 0) {
      setSelectedIds(eligible.slice(0, 10).map((p) => p.id));
    }
  }, [players, selectedIds.length]);

  const showNotice = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const run = async (fn: () => Promise<void>, message?: string) => {
    setBusy(true);
    try {
      await fn();
      if (message) showNotice(message);
    } catch (err: any) {
      showNotice(err.message || 'Ошибка выполнения операции');
    } finally {
      setBusy(false);
    }
  };

  const handleDealerAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await loginUser(loginInput.trim(), passwordInput.trim());
      if (user.role !== 'dealer') {
        setAuthError(
          `Учётная запись «${user.firstName} ${user.lastName}» имеет роль Игрок. Доступ к пульту открыт только для учётной записи Дилера.`
        );
      }
    } catch (err: any) {
      setAuthError(err.message || 'Неверный логин или пароль дилера');
    } finally {
      setAuthLoading(false);
    }
  };

  // --- DEALER ACCOUNT AUTHORIZATION GATE ---
  if (!isDealerAuthorized) {
    return (
      <div className="mx-auto max-w-md py-6 sm:py-10">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 text-center space-y-6">
          <div className="mx-auto relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#F97316]/60 bg-black shadow-[0_0_32px_-6px_rgba(249,115,22,0.5)]">
            <img
              src={CLUB_LOGO_PATH}
              alt="Покерный клуб Чек это проигрыш"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#F97316]/15 px-3 py-1 text-xs font-bold text-[#F97316]">
              <Lock className="h-3.5 w-3.5" />
              <span>АВТОРИЗАЦИЯ ДИЛЕРА</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              Пульт дилера
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Войдите под клубной учётной записью дилера для управления таймером, рассадкой,
              штрафами и бан-листом участников.
            </p>
          </div>

          {currentUser && currentUser.role !== 'dealer' && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-3.5 text-left text-xs text-amber-200 space-y-2">
              <div>
                Вы вошли как игрок:{' '}
                <strong className="text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </strong>
              </div>
              <button
                type="button"
                onClick={logoutUser}
                className="btn-glass rounded-lg px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Выйти и войти под аккаунтом дилера
              </button>
            </div>
          )}

          <form onSubmit={handleDealerAuthSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Логин или Email дилера *
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Логин или email дилера..."
                  autoFocus
                  className="glass-well w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Пароль *
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Введите пароль дилера..."
                  className="glass-well w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
                />
              </div>
            </div>

            {authError && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="btn-crimson w-full rounded-xl py-3 text-sm font-extrabold disabled:opacity-40 cursor-pointer"
            >
              {authLoading ? 'Проверка учётной записи...' : 'Войти в Пульт дилера'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!liveState) {
    return (
      <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center text-slate-400">
        Загрузка пульта дилера...
      </div>
    );
  }

  const currentLevel = blindLevels[liveState.currentLevelIndex] || blindLevels[0];

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

  const formatBanCountdown = (expiresAt?: number | null) => {
    if (!expiresAt) return null;
    const diffSec = Math.max(0, Math.ceil((expiresAt - nowTs) / 1000));
    if (diffSec <= 0) return null;
    return formatClock(diffSec);
  };

  const matchesNameOrSurname = (fullName: string, nickname: string, query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const parts = q.split(/\s+/);
    const target = `${fullName} ${nickname}`.toLowerCase();
    return parts.every((part) => target.includes(part));
  };

  const filteredActiveTablePlayers = useMemo(() => {
    return liveState.activePlayers.filter((p) =>
      matchesNameOrSurname(p.name, p.nickname, activeTableSearch)
    );
  }, [liveState.activePlayers, activeTableSearch]);

  const filteredClubMembers = useMemo(() => {
    return players.filter((p) =>
      matchesNameOrSurname(p.name, p.nickname, memberSearch)
    );
  }, [players, memberSearch]);

  const filteredNewGamePlayers = useMemo(() => {
    return players.filter((p) =>
      matchesNameOrSurname(p.name, p.nickname, newGamePlayerSearch)
    );
  }, [players, newGamePlayerSearch]);

  const toggleSelect = (id: number) => {
    const targetPlayer = players.find((p) => p.id === id);
    if (targetPlayer?.isBanned) {
      showNotice(`Игрок ${targetPlayer.name} забанен в клубе. Снимите бан ниже для допуска.`);
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleLoadRegisteredFromTable = (announcementId: number) => {
    const targetTable = announcements.find((a) => a.id === announcementId);
    if (!targetTable) return;
    const regList = parseRegisteredPlayers(targetTable.registeredPlayersJson);
    const matchedIds = players
      .filter(
        (p) =>
          !p.isBanned &&
          regList.some(
            (r) =>
              r.playerId === p.id || r.name.toLowerCase() === p.name.toLowerCase()
          )
      )
      .map((p) => p.id);

    setNewTitle(targetTable.title);
    setNewFormat(targetTable.spotsTotal > 10 ? '2_tables' : '1_table');
    if (matchedIds.length > 0) {
      setSelectedIds(matchedIds);
      showNotice(
        `Загружено ${matchedIds.length} записавшихся участников со стола «${targetTable.title}»`
      );
    } else {
      showNotice('За этим столом пока нет записавшихся участников');
    }
  };

  const handleQuickCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPlayerName.trim()) return;
    await run(async () => {
      await addPlayer({ name: quickPlayerName.trim(), nickname: '' });
      setQuickPlayerName('');
    }, `Игрок ${quickPlayerName} добавлен в список клуба`);
  };

  const handleIssueTablePenalty = async (
    playerId: number,
    playerName: string,
    type: PenaltyType,
    banInClub = false
  ) => {
    const labels: Record<PenaltyType, string> = {
      show_cards_500: `${playerName}: Штраф −500 фишек (Показ карт)`,
      check_nuts_5min: `${playerName}: Бан на 5 минут («Чек» с натсом)`,
      collusion_1000: `${playerName}: Штраф −1 000 фишек (Сговор)`,
      tournament_ban: `${playerName}: Дисквалификация с турнира (0 очков)`,
    };
    await run(async () => {
      await issuePenalty(playerId, type, banInClub);
      setExpandedPenaltyPlayerId(null);
    }, labels[type]);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {toast && (
        <div className="glass-crimson sticky top-20 z-30 flex items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:px-5 text-xs font-bold text-white shadow-xl">
          <span>{toast}</span>
          <button
            onClick={() => setToast(null)}
            className="text-orange-200 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. TIMER & LEVEL CONTROLS */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-bold text-[#F97316]">
                ПУЛЬТ ДИЛЕРА · {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <button
                onClick={logoutUser}
                className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer"
              >
                <LogOut className="h-3 w-3 text-[#F97316]" />
                <span>Сменить аккаунт</span>
              </button>
            </div>
            <h1 className="font-display text-xl font-extrabold text-white sm:text-3xl">
              {liveState.tournamentTitle}
            </h1>
            <p className="text-xs text-slate-400">
              {currentLevel?.isBreak
                ? currentLevel.breakTitle
                : `Уровень #${currentLevel?.levelNumber ?? 1} · Блайнды ${currentLevel?.smallBlind}/${currentLevel?.bigBlind}`}{' '}
              · За столом: {liveState.activePlayers.length} из {liveState.totalInitialPlayers}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="glass-well font-mono-tabular flex-1 sm:flex-initial text-center rounded-2xl px-4 py-2.5 text-2xl sm:text-3xl font-extrabold text-white">
              {formatClock(liveState.remainingSeconds)}
            </div>

            {liveState.status === 'running' ? (
              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('pause'))}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-xs font-extrabold text-black hover:bg-amber-300 cursor-pointer"
              >
                <Pause className="h-4 w-4" />
                <span>Пауза</span>
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('start'))}
                className="btn-crimson flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-extrabold cursor-pointer"
              >
                <Play className="h-4 w-4" />
                <span>Старт таймера</span>
              </button>
            )}

            <div className="flex w-full sm:w-auto items-center gap-2">
              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('prev_level'))}
                className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                <SkipBack className="h-3.5 w-3.5" />
                <span>Пред.</span>
              </button>

              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('next_level'))}
                className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span>След.</span>
              </button>

              <button
                disabled={busy}
                onClick={() => run(() => controlTimer('reset_level'))}
                className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>10:00</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PLAYERS, SEARCH BY NAME/SURNAME, ONE-CLICK ELIMINATION & TABLE PENALTIES */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Игроки за столом ({liveState.activePlayers.length})
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              «Выбыл» выдаёт <strong className="text-white">#{nextElimPlace} место</strong> (
              <strong className="text-emerald-400">+{nextElimPoints} очк.</strong>) · Поиск игрока
              по имени и фамилии
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search active table players by First Name & Last Name */}
            <div className="relative w-full sm:w-60">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={activeTableSearch}
                onChange={(e) => setActiveTableSearch(e.target.value)}
                placeholder="Имя или фамилия за столом..."
                className="glass-well w-full rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-[#F97316] focus:outline-none"
              />
            </div>

            <button
              disabled={busy || liveState.activePlayers.length < 2}
              onClick={() =>
                run(() => reseatActivePlayers(), 'Рассадка по столам и боксам обновлена')
              }
              className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
            >
              <Shuffle className="h-3.5 w-3.5 text-[#F97316]" />
              <span>Пересадить боксы</span>
            </button>

            {liveState.eliminatedPlayers.length > 0 && (
              <button
                disabled={busy}
                onClick={() =>
                  run(() => undoLastElimination(), 'Последнее выбывание отменено')
                }
                className="btn-glass flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                <Undo2 className="h-3.5 w-3.5" />
                <span>Отменить вылет</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {filteredActiveTablePlayers.map((player) => {
            const isPenaltyOpen = expandedPenaltyPlayerId === player.playerId;
            const banTimer = formatBanCountdown(player.penaltyExpiresAt);
            const hasActivePenalty = Boolean(player.penaltyNote || banTimer);

            return (
              <div
                key={player.playerId}
                className={`rounded-2xl p-4 transition-all ${
                  hasActivePenalty
                    ? 'border border-[#F97316]/60 bg-[#F97316]/10'
                    : 'glass-well'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="font-mono-tabular flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-black/50 text-xs font-extrabold text-[#F97316]">
                      <span className="text-[10px] font-normal text-slate-400">Бокс</span>
                      <span>#{player.seatNumber}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">
                        {player.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Стол {player.tableNumber} · Место #{player.seatNumber}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setExpandedPenaltyPlayerId(isPenaltyOpen ? null : player.playerId)
                      }
                      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                        isPenaltyOpen
                          ? 'bg-[#F97316] text-black'
                          : 'btn-glass text-orange-300 hover:text-white'
                      }`}
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Штраф / Бан</span>
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => eliminatePlayer(player.playerId),
                          `${player.name} — #${nextElimPlace} место (+${nextElimPoints} очк.)`
                        )
                      }
                      className="btn-crimson flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                      <span>
                        Выбыл (#{nextElimPlace} · +{nextElimPoints})
                      </span>
                    </button>
                  </div>
                </div>

                {/* Active Penalty / 5-min Ban Banner on Player */}
                {hasActivePenalty && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#F97316]/40 bg-black/40 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#F97316]">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>{player.penaltyNote}</span>
                      {banTimer && (
                        <span className="font-mono-tabular rounded bg-[#F97316] px-1.5 py-0.5 text-[11px] font-extrabold text-black">
                          {banTimer}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => clearPlayerPenalty(player.playerId),
                          `Штраф/бан игрока ${player.name} снят`
                        )
                      }
                      className="text-xs font-semibold text-slate-300 underline hover:text-white cursor-pointer"
                    >
                      Снять штраф
                    </button>
                  </div>
                )}

                {/* Expandable Penalty & Ban Controls for this Table Player */}
                {isPenaltyOpen && (
                  <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Выберите санкцию для игрока «{player.name}»:
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleIssueTablePenalty(
                            player.playerId,
                            player.name,
                            'show_cards_500'
                          )
                        }
                        className="btn-glass flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-white hover:border-amber-400/50 cursor-pointer"
                      >
                        <span>Показ карт до конца раздачи</span>
                        <span className="font-mono-tabular font-extrabold text-amber-400 ml-2 shrink-0">
                          −500 фишек
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleIssueTablePenalty(
                            player.playerId,
                            player.name,
                            'check_nuts_5min'
                          )
                        }
                        className="btn-glass flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-white hover:border-[#F97316]/60 cursor-pointer"
                      >
                        <span>«Чек» с натсом на ривере</span>
                        <span className="font-mono-tabular font-extrabold text-[#F97316] ml-2 shrink-0">
                          Бан 5 мин
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleIssueTablePenalty(
                            player.playerId,
                            player.name,
                            'collusion_1000'
                          )
                        }
                        className="btn-glass flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-white hover:border-rose-400/50 cursor-pointer"
                      >
                        <span>Сговор / софт-плей за столом</span>
                        <span className="font-mono-tabular font-extrabold text-rose-400 ml-2 shrink-0">
                          −1 000 фишек
                        </span>
                      </button>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleIssueTablePenalty(
                            player.playerId,
                            player.name,
                            'tournament_ban',
                            true
                          )
                        }
                        className="flex items-center justify-between rounded-xl border border-rose-500/50 bg-rose-500/15 px-3 py-2 text-left text-xs font-bold text-rose-200 hover:bg-rose-500/25 cursor-pointer"
                      >
                        <span>Дисквалификация + Бан в клубе</span>
                        <span className="font-mono-tabular font-extrabold text-rose-400 ml-2 shrink-0">
                          БАН (0 очк.)
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {liveState.activePlayers.length > 0 && filteredActiveTablePlayers.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              За столом не найдено игроков по запросу «{activeTableSearch}»
            </div>
          )}

          {liveState.activePlayers.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm font-bold text-emerald-400">
              Турнир завершён! Все очки начислены в рейтинг. Запустите следующую игру ниже.
            </div>
          )}
        </div>
      </div>

      {/* 3. CLUB-WIDE PENALTIES & BAN LIST MANAGEMENT WITH SEARCH BY FIRST/LAST NAME */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316]">
              <Ban className="h-3.5 w-3.5" />
              <span>ДИСЦИПЛИНАРНЫЙ КОНТРОЛЬ КЛУБА</span>
            </div>
            <h2 className="font-display mt-1 text-xl sm:text-2xl font-bold text-white">
              Поиск по игрокам: штрафы и бан ({filteredClubMembers.length})
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Введите имя или фамилию участника для быстрого начисления штрафа или блокировки
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Поиск по имени и фамилии..."
              className="glass-well w-full rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 focus:border-[#F97316] focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredClubMembers.map((member) => {
            const customReason = banReasonInput[member.id] ?? member.banReason ?? '';
            return (
              <div
                key={member.id}
                className={`flex flex-col justify-between gap-3 rounded-2xl p-4 transition-all ${
                  member.isBanned
                    ? 'border border-rose-500/50 bg-rose-950/25'
                    : 'glass-well'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-bold text-white">
                        {member.name}
                      </span>
                      {member.isBanned ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-extrabold text-rose-300">
                          <XCircle className="h-3 w-3" />
                          ЗАБАНЕН
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          ДОПУЩЕН
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Очки: {member.seasonPoints}</span>
                      <span>·</span>
                      <span
                        className={
                          member.penaltiesCount > 0 ? 'font-bold text-[#F97316]' : ''
                        }
                      >
                        Штрафов за сезон: {member.penaltiesCount}
                      </span>
                    </div>

                    {member.isBanned && member.banReason && (
                      <div className="mt-1.5 text-xs font-medium text-rose-300">
                        Причина: {member.banReason}
                      </div>
                    )}
                  </div>

                  {/* Quick Penalty Counter Controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () =>
                            editPlayer(member.id, {
                              penaltiesCount: member.penaltiesCount + 1,
                            }),
                          `+1 штраф начислен игроку ${member.name}`
                        )
                      }
                      className="btn-glass rounded-lg px-2.5 py-1.5 text-xs font-bold text-orange-300 hover:text-white cursor-pointer"
                      title="Добавить штраф"
                    >
                      +1 штраф
                    </button>
                    {member.penaltiesCount > 0 && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => editPlayer(member.id, { penaltiesCount: 0 }),
                            `Штрафы игрока ${member.name} сброшены`
                          )
                        }
                        className="btn-glass rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
                        title="Сбросить штрафы"
                      >
                        Сброс
                      </button>
                    )}
                  </div>
                </div>

                {/* Ban / Unban Controls */}
                <div className="flex flex-col gap-2 border-t border-white/10 pt-3 sm:flex-row sm:items-center">
                  {!member.isBanned ? (
                    <>
                      <input
                        type="text"
                        value={customReason}
                        onChange={(e) =>
                          setBanReasonInput((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                        placeholder="Причина бана (сговор, чек с натсом...)"
                        className="glass-well flex-1 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () =>
                              togglePlayerBan(
                                member.id,
                                true,
                                customReason || 'Нарушение правил клуба'
                              ),
                            `${member.name} забанен в клубе`
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-500/50 bg-rose-500/15 px-3.5 py-1.5 text-xs font-extrabold text-rose-300 hover:bg-rose-500/25 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>Забанить</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        run(
                          () => togglePlayerBan(member.id, false, ''),
                          `Бан с игрока ${member.name} снят`
                        )
                      }
                      className="btn-glass w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Разбанить и вернуть допуск к играм</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredClubMembers.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-slate-400">
              Игроки по запросу «{memberSearch}» не найдены
            </div>
          )}
        </div>
      </div>

      {/* 4. START NEW EVENING GAME (1 OR 2 TABLES) WITH TABLE REGISTRATIONS & NAME SEARCH */}
      <div className="glass-panel rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
              Запустить новый турнир вечера
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Загрузите записавшихся на стол с сайта или отметьте игроков вручную через поиск
            </p>
          </div>

          <form onSubmit={handleQuickCreatePlayer} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Имя и фамилия нового игрока..."
              value={quickPlayerName}
              onChange={(e) => setQuickPlayerName(e.target.value)}
              className="glass-well flex-1 sm:w-52 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none"
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

        {/* One-Click Load Registered Players from Website Evening Tables */}
        {announcements.length > 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F97316]">
              <Users className="h-3.5 w-3.5" />
              <span>ЗАПИСАВШИЕСЯ НА СТОЛЫ ЧЕРЕЗ САЙТ:</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {announcements.map((table, idx) => {
                const count = parseRegisteredPlayers(table.registeredPlayersJson).length;
                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => handleLoadRegisteredFromTable(table.id)}
                    className="btn-glass inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold text-white hover:border-[#F97316]/50 cursor-pointer"
                  >
                    <span>Стол #{idx + 1}: {table.title.split('•')[1] || table.title}</span>
                    <span className="font-mono-tabular rounded-md bg-[#F97316] px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                      {count} чел.
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
                  setSelectedIds(
                    players
                      .filter((p) => !p.isBanned)
                      .slice(0, 10)
                      .map((p) => p.id)
                  );
                }}
                className={`flex-1 rounded-lg py-2 px-2 text-xs font-extrabold transition-all cursor-pointer ${
                  newFormat === '1_table' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
                }`}
              >
                1 стол (10 мест · 150 очк.)
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewFormat('2_tables');
                  setSelectedIds(
                    players
                      .filter((p) => !p.isBanned)
                      .slice(0, 16)
                      .map((p) => p.id)
                  );
                }}
                className={`flex-1 rounded-lg py-2 px-2 text-xs font-extrabold transition-all cursor-pointer ${
                  newFormat === '2_tables' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 стола (до 20 мест · 280 очк.)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="text-xs font-semibold text-slate-300">
              Отметьте участников на вечер ({selectedIds.length} выбрано):
            </div>

            {/* Search players by First Name & Last Name when assembling table */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={newGamePlayerSearch}
                onChange={(e) => setNewGamePlayerSearch(e.target.value)}
                placeholder="Фильтр по имени и фамилии..."
                className="glass-well w-full rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredNewGamePlayers.map((p) => {
              const active = selectedIds.includes(p.id) && !p.isBanned;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-xs font-medium transition-all cursor-pointer ${
                    p.isBanned
                      ? 'border border-rose-500/30 bg-rose-950/20 text-rose-400/70 line-through cursor-not-allowed'
                      : active
                        ? 'glass-crimson text-white font-bold'
                        : 'glass-well text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className="font-mono-tabular ml-2 shrink-0">
                    {p.isBanned ? 'БАН' : active ? '✓' : ''}
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
            className="btn-crimson w-full sm:w-auto rounded-xl px-6 py-3.5 text-sm font-extrabold disabled:opacity-40 cursor-pointer"
          >
            Раздать боксы и начать турнир ({selectedIds.length} чел.)
          </button>
        </div>
      </div>
    </div>
  );
};
