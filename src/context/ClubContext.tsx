import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  AnnouncementRecord,
  BlindLevelRecord,
  calculatePointsForPlace,
  ClubContentRecord,
  LivePenaltyLog,
  LiveTournamentState,
  PenaltyType,
  PlayerRecord,
  TableFormat,
  TournamentArchiveRecord,
} from '../types/poker.ts';

const DEALER_TOKEN_STORAGE_KEY = 'cep_dealer_token';
const STATIC_STATE_STORAGE_KEY = 'cep_static_club_state_v2';

const INITIAL_PLAYERS: PlayerRecord[] = [
  { id: 1, name: 'Илья Лекалин', nickname: 'Shark_IL', seasonPoints: 1140, gamesPlayed: 8, winsCount: 3, finalTablesCount: 7, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Лидер текущего сезона' },
  { id: 2, name: 'Дмитрий Воронов', nickname: 'Raven', seasonPoints: 985, gamesPlayed: 8, winsCount: 2, finalTablesCount: 6, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Победитель открытия сезона' },
  { id: 3, name: 'Александр Соколов', nickname: 'Falcon', seasonPoints: 910, gamesPlayed: 8, winsCount: 1, finalTablesCount: 6, penaltiesCount: 1, isBanned: false, banReason: '', notes: 'Мастер поздних стадий' },
  { id: 4, name: 'Максим Волков', nickname: 'GreyWolf', seasonPoints: 845, gamesPlayed: 7, winsCount: 1, finalTablesCount: 5, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Тайтово-агрессивный стиль' },
  { id: 5, name: 'Илья Морозов', nickname: 'Frost', seasonPoints: 780, gamesPlayed: 8, winsCount: 1, finalTablesCount: 5, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Глубокие стеки' },
  { id: 6, name: 'Евгений Козлов', nickname: 'Architect', seasonPoints: 725, gamesPlayed: 7, winsCount: 0, finalTablesCount: 5, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Математический расчет' },
  { id: 7, name: 'Роман Лебедев', nickname: 'CheckRaise', seasonPoints: 670, gamesPlayed: 8, winsCount: 0, finalTablesCount: 4, penaltiesCount: 1, isBanned: false, banReason: '', notes: 'Никогда не чекает натс' },
  { id: 8, name: 'Сергей Новиков', nickname: 'Novik', seasonPoints: 630, gamesPlayed: 7, winsCount: 1, finalTablesCount: 4, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Короткий стол' },
  { id: 9, name: 'Кирилл Павлов', nickname: 'K_Ace', seasonPoints: 595, gamesPlayed: 8, winsCount: 0, finalTablesCount: 4, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Топ-10 сезона' },
  { id: 10, name: 'Никита Семёнов', nickname: 'AllIn_Nik', seasonPoints: 560, gamesPlayed: 8, winsCount: 0, finalTablesCount: 3, penaltiesCount: 1, isBanned: false, banReason: '', notes: 'Замыкает зону Финального стола' },
  { id: 11, name: 'Андрей Голубев', nickname: 'Vegas', seasonPoints: 535, gamesPlayed: 7, winsCount: 0, finalTablesCount: 3, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'В 25 очках от Топ-10' },
  { id: 12, name: 'Павел Виноградов', nickname: 'DonkBet', seasonPoints: 490, gamesPlayed: 6, winsCount: 0, finalTablesCount: 3, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Претендент на финал' },
  { id: 13, name: 'Виктор Зайцев', nickname: 'BluffMaster', seasonPoints: 440, gamesPlayed: 7, winsCount: 0, finalTablesCount: 2, penaltiesCount: 2, isBanned: false, banReason: '', notes: 'Агрессивные 3-беты' },
  { id: 14, name: 'Денис Богданов', nickname: 'RiverKing', seasonPoints: 395, gamesPlayed: 6, winsCount: 0, finalTablesCount: 2, penaltiesCount: 0, isBanned: false, banReason: '', notes: 'Регуляр пятничных серий' },
];

const INITIAL_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 1,
    title: 'Турнир #1 • Вечерний Разгон (1 стол)',
    eventDate: 'Пятница • 19:00',
    format: '1 стол (10 мест) • Стек 25 000 • Уровни по 10 мин',
    description: 'Открывающий турнир игрового вечера по правилам спортивного Техасского Холдема. Начисление очков по Шаблону A (1 место — 150 очков).',
    status: 'registration',
    spotsTotal: 10,
    spotsTaken: 8,
  },
  {
    id: 2,
    title: 'Турнир #2 • Главное Событие Вечера (2 стола)',
    eventDate: 'Пятница • 21:15',
    format: '2 стола (18–20 мест) • Стек 25 000 • Уровни по 10 мин',
    description: 'Основной рейтинговый турнир вечера с объединением в финальный стол. Повышенная сетка очков по Шаблону B (1 место — 280 очков).',
    status: 'registration',
    spotsTotal: 20,
    spotsTaken: 16,
  },
  {
    id: 3,
    title: 'Турнир #3 • Ночной Финал «Чек это проигрыш»',
    eventDate: 'Пятница • 23:30',
    format: '1 стол (10 мест) • Стек 25 000 • Уровни по 10 мин',
    description: 'Заключительный динамичный турнир вечера для самых стойких стратегов клуба. Начисление очков в сезонный рейтинг по Шаблону A.',
    status: 'upcoming',
    spotsTotal: 10,
    spotsTaken: 6,
  },
];

const INITIAL_BLIND_LEVELS: BlindLevelRecord[] = [
  { id: 1, levelOrder: 1, levelNumber: 1, isBreak: false, breakTitle: '', smallBlind: 100, bigBlind: 200, ante: 0, durationSeconds: 600 },
  { id: 2, levelOrder: 2, levelNumber: 2, isBreak: false, breakTitle: '', smallBlind: 200, bigBlind: 400, ante: 0, durationSeconds: 600 },
  { id: 3, levelOrder: 3, levelNumber: 3, isBreak: false, breakTitle: '', smallBlind: 300, bigBlind: 600, ante: 0, durationSeconds: 600 },
  { id: 4, levelOrder: 4, levelNumber: 4, isBreak: false, breakTitle: '', smallBlind: 400, bigBlind: 800, ante: 800, durationSeconds: 600 },
  { id: 5, levelOrder: 5, levelNumber: null, isBreak: true, breakTitle: 'Перерыв 10 мин • Укрупнение фишек номиналом 100', smallBlind: 0, bigBlind: 0, ante: 0, durationSeconds: 600 },
  { id: 6, levelOrder: 6, levelNumber: 5, isBreak: false, breakTitle: '', smallBlind: 500, bigBlind: 1000, ante: 1000, durationSeconds: 600 },
  { id: 7, levelOrder: 7, levelNumber: 6, isBreak: false, breakTitle: '', smallBlind: 1000, bigBlind: 2000, ante: 2000, durationSeconds: 600 },
  { id: 8, levelOrder: 8, levelNumber: 7, isBreak: false, breakTitle: '', smallBlind: 1500, bigBlind: 3000, ante: 3000, durationSeconds: 600 },
  { id: 9, levelOrder: 9, levelNumber: 8, isBreak: false, breakTitle: '', smallBlind: 2000, bigBlind: 4000, ante: 4000, durationSeconds: 600 },
  { id: 10, levelOrder: 10, levelNumber: null, isBreak: true, breakTitle: 'Перерыв 5 мин • Укрупнение фишек номиналом 500', smallBlind: 0, bigBlind: 0, ante: 0, durationSeconds: 300 },
  { id: 11, levelOrder: 11, levelNumber: 9, isBreak: false, breakTitle: '', smallBlind: 3000, bigBlind: 6000, ante: 6000, durationSeconds: 600 },
  { id: 12, levelOrder: 12, levelNumber: 10, isBreak: false, breakTitle: '', smallBlind: 5000, bigBlind: 10000, ante: 10000, durationSeconds: 600 },
  { id: 13, levelOrder: 13, levelNumber: 11, isBreak: false, breakTitle: '', smallBlind: 10000, bigBlind: 20000, ante: 20000, durationSeconds: 600 },
  { id: 14, levelOrder: 14, levelNumber: null, isBreak: true, breakTitle: 'Перерыв 5 мин • Укрупнение фишек номиналом 1000', smallBlind: 0, bigBlind: 0, ante: 0, durationSeconds: 300 },
  { id: 15, levelOrder: 15, levelNumber: 12, isBreak: false, breakTitle: '', smallBlind: 15000, bigBlind: 30000, ante: 30000, durationSeconds: 600 },
  { id: 16, levelOrder: 16, levelNumber: 13, isBreak: false, breakTitle: '', smallBlind: 25000, bigBlind: 50000, ante: 50000, durationSeconds: 600 },
  { id: 17, levelOrder: 17, levelNumber: 14, isBreak: false, breakTitle: '', smallBlind: 40000, bigBlind: 50000, ante: 50000, durationSeconds: 600 },
];

const INITIAL_LIVE_STATE: LiveTournamentState = {
  tournamentTitle: 'Вечерний Холдем • Турнир #1',
  tableFormat: '1_table',
  startingStack: 25000,
  status: 'paused',
  currentLevelIndex: 0,
  remainingSeconds: 600,
  totalInitialPlayers: 10,
  activePlayers: [
    { playerId: 1, name: 'Илья Лекалин', nickname: 'Shark_IL', tableNumber: 1, seatNumber: 1, drawnCard: 'A♠' },
    { playerId: 2, name: 'Дмитрий Воронов', nickname: 'Raven', tableNumber: 1, seatNumber: 2, drawnCard: 'K♠' },
    { playerId: 3, name: 'Александр Соколов', nickname: 'Falcon', tableNumber: 1, seatNumber: 3, drawnCard: 'Q♠' },
    { playerId: 4, name: 'Максим Волков', nickname: 'GreyWolf', tableNumber: 1, seatNumber: 4, drawnCard: 'J♠' },
    { playerId: 5, name: 'Илья Морозов', nickname: 'Frost', tableNumber: 1, seatNumber: 5, drawnCard: '10♠' },
    { playerId: 6, name: 'Евгений Козлов', nickname: 'Architect', tableNumber: 1, seatNumber: 6, drawnCard: 'A♥' },
    { playerId: 7, name: 'Роман Лебедев', nickname: 'CheckRaise', tableNumber: 1, seatNumber: 7, drawnCard: 'K♥' },
    { playerId: 8, name: 'Сергей Новиков', nickname: 'Novik', tableNumber: 1, seatNumber: 8, drawnCard: 'Q♥' },
  ],
  eliminatedPlayers: [
    {
      place: 9,
      playerId: 9,
      playerName: 'Кирилл Павлов',
      nickname: 'K_Ace',
      pointsAwarded: 15,
      eliminatedAtLevel: 'Уровень 1 (100/200)',
      timestamp: '20:18',
    },
    {
      place: 10,
      playerId: 10,
      playerName: 'Никита Семёнов',
      nickname: 'AllIn_Nik',
      pointsAwarded: 10,
      eliminatedAtLevel: 'Уровень 1 (100/200)',
      timestamp: '20:09',
    },
  ],
  penalties: [],
  lastUpdated: Date.now(),
};

function sortPlayers(list: PlayerRecord[]): PlayerRecord[] {
  return [...list].sort(
    (a, b) => b.seasonPoints - a.seasonPoints || b.winsCount - a.winsCount || a.id - b.id
  );
}

interface ClubContextValue {
  players: PlayerRecord[];
  announcements: AnnouncementRecord[];
  clubContent: ClubContentRecord[];
  blindLevels: BlindLevelRecord[];
  tournaments: TournamentArchiveRecord[];
  liveState: LiveTournamentState | null;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  isDealerAuthorized: boolean;
  loginDealer: (pin: string) => Promise<void>;
  logoutDealer: () => void;
  refreshAll: () => Promise<void>;
  controlTimer: (action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute') => Promise<void>;
  eliminatePlayer: (playerId: number) => Promise<void>;
  undoLastElimination: () => Promise<void>;
  issuePenalty: (playerId: number, penaltyType: PenaltyType, banInClub?: boolean) => Promise<void>;
  clearPlayerPenalty: (playerId: number) => Promise<void>;
  togglePlayerBan: (playerId: number, isBanned: boolean, banReason?: string) => Promise<void>;
  reseatActivePlayers: () => Promise<void>;
  startNewTournament: (params: {
    tournamentTitle: string;
    tableFormat: TableFormat;
    startingStack: number;
    selectedPlayerIds: number[];
    useRandomSeating: boolean;
  }) => Promise<void>;
  addPlayer: (data: { name: string; nickname: string; seasonPoints?: number; notes?: string }) => Promise<void>;
  editPlayer: (id: number, data: Partial<PlayerRecord>) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
}

const ClubContext = createContext<ClubContextValue | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<PlayerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STATIC_STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.players) && parsed.players.length > 0) {
          return sortPlayers(parsed.players);
        }
      }
    } catch {
      // ignore
    }
    return sortPlayers(INITIAL_PLAYERS);
  });

  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(INITIAL_ANNOUNCEMENTS);
  const [clubContent, setClubContent] = useState<ClubContentRecord[]>([]);
  const [blindLevels, setBlindLevels] = useState<BlindLevelRecord[]>(INITIAL_BLIND_LEVELS);
  const [tournaments, setTournaments] = useState<TournamentArchiveRecord[]>([]);
  const [liveState, setLiveState] = useState<LiveTournamentState>(() => {
    try {
      const saved = localStorage.getItem(STATIC_STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.liveState) {
          return parsed.liveState;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_LIVE_STATE;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [dealerToken, setDealerToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DEALER_TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [isDealerAuthorized, setIsDealerAuthorized] = useState<boolean>(Boolean(dealerToken));

  // Tracks whether the Node.js /api/* backend is reachable (false on GitHub Pages)
  const serverAvailableRef = useRef<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Persist state to localStorage for GitHub Pages / static mode & cross-tab sync
  useEffect(() => {
    try {
      localStorage.setItem(
        STATIC_STATE_STORAGE_KEY,
        JSON.stringify({ players, liveState, blindLevels })
      );
    } catch {
      // ignore
    }
  }, [players, liveState, blindLevels]);

  // Listen to storage events so multiple tabs on GitHub Pages stay in sync
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STATIC_STATE_STORAGE_KEY && e.newValue && !serverAvailableRef.current) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed.players) setPlayers(sortPlayers(parsed.players));
          if (parsed.liveState) setLiveState(parsed.liveState);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Client-side 1-second tournament clock when running on static hosting (GitHub Pages)
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (serverAvailableRef.current) return;

      setLiveState((prev) => {
        const now = Date.now();
        let activeChanged = false;
        const updatedActive = prev.activePlayers.map((p) => {
          if (p.penaltyExpiresAt && now >= p.penaltyExpiresAt) {
            activeChanged = true;
            return { ...p, penaltyExpiresAt: null, penaltyNote: undefined };
          }
          return p;
        });

        if (prev.status !== 'running') {
          return activeChanged
            ? { ...prev, activePlayers: updatedActive, lastUpdated: now }
            : prev;
        }

        if (prev.remainingSeconds > 0) {
          return {
            ...prev,
            activePlayers: updatedActive,
            remainingSeconds: prev.remainingSeconds - 1,
            lastUpdated: now,
          };
        }

        if (prev.currentLevelIndex < blindLevels.length - 1) {
          const nextIdx = prev.currentLevelIndex + 1;
          const nextLvl = blindLevels[nextIdx];
          return {
            ...prev,
            activePlayers: updatedActive,
            currentLevelIndex: nextIdx,
            remainingSeconds: nextLvl ? nextLvl.durationSeconds : 600,
            lastUpdated: now,
          };
        }

        return {
          ...prev,
          activePlayers: updatedActive,
          status: 'paused',
          remainingSeconds: 0,
          lastUpdated: now,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [blindLevels]);

  const refreshAll = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        // Static hosting mode (e.g., GitHub Pages) — use local state with zero error
        serverAvailableRef.current = false;
        setError(null);
        return;
      }
      const data = await res.json();
      serverAvailableRef.current = true;
      if (data.players) setPlayers(data.players);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.clubContent) setClubContent(data.clubContent);
      if (data.blindLevels) setBlindLevels(data.blindLevels);
      if (data.tournaments) setTournaments(data.tournaments);
      if (data.liveState) setLiveState(data.liveState);
      setError(null);
    } catch {
      // Static hosting mode (e.g., GitHub Pages) — silently run in autonomous client mode
      serverAvailableRef.current = false;
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const connectWs = () => {
      if (!isMounted || !serverAvailableRef.current) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws/live`;
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
        };

        socket.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'live:state' && msg.payload) {
              if (msg.payload.liveState) setLiveState(msg.payload.liveState);
              if (msg.payload.blindLevels) setBlindLevels(msg.payload.blindLevels);
            } else if (msg.type === 'data:refresh' && msg.payload) {
              if (msg.payload.players) setPlayers(msg.payload.players);
              if (msg.payload.announcements) setAnnouncements(msg.payload.announcements);
              if (msg.payload.clubContent) setClubContent(msg.payload.clubContent);
              if (msg.payload.tournaments) setTournaments(msg.payload.tournaments);
            }
          } catch {
            // ignore
          }
        };

        socket.onclose = () => {
          if (!isMounted) return;
          setWsConnected(false);
          if (serverAvailableRef.current) {
            reconnectTimeoutRef.current = window.setTimeout(connectWs, 3000);
          }
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        // ignore WS errors on static hosts
      }
    };

    refreshAll().then(() => {
      if (serverAvailableRef.current) {
        connectWs();
      }
    });

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [refreshAll]);

  const loginDealer = async (pin: string) => {
    const cleanPin = (pin || '').trim().toLowerCase();
    if (serverAvailableRef.current) {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok || !data.authorized) {
        throw new Error(data.error || 'Неверный ПИН-код дилера');
      }
      try {
        localStorage.setItem(DEALER_TOKEN_STORAGE_KEY, data.token);
      } catch {
        // ignore
      }
      setDealerToken(data.token);
      setIsDealerAuthorized(true);
      return;
    }

    // Client-side static mode auth (GitHub Pages)
    if (['25000', 'admin', 'check'].includes(cleanPin)) {
      const token = 'cep-dealer-token-25000';
      try {
        localStorage.setItem(DEALER_TOKEN_STORAGE_KEY, token);
      } catch {
        // ignore
      }
      setDealerToken(token);
      setIsDealerAuthorized(true);
      return;
    }
    throw new Error('Неверный ПИН-код дилера');
  };

  const logoutDealer = () => {
    try {
      localStorage.removeItem(DEALER_TOKEN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setDealerToken(null);
    setIsDealerAuthorized(false);
  };

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };
    if (dealerToken) {
      headers['x-dealer-token'] = dealerToken;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      serverAvailableRef.current = false;
      return null;
    }
    const data = await res.json();
    if (res.status === 401) {
      logoutDealer();
      throw new Error(data.error || 'Требуется авторизация дилера');
    }
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка выполнения запроса');
    }
    return data;
  };

  const getCurrentLevelLabel = () => {
    const lvl = blindLevels[liveState.currentLevelIndex] || blindLevels[0];
    if (!lvl) return 'Уровень 1 (100/200)';
    if (lvl.isBreak) return lvl.breakTitle || 'Перерыв';
    return `Уровень ${lvl.levelNumber ?? 1} (${lvl.smallBlind}/${lvl.bigBlind})`;
  };

  const controlTimer = async (
    action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute'
  ) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/control', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        return;
      }
    }

    // Static / GitHub Pages fallback
    setLiveState((prev) => {
      const next = { ...prev, lastUpdated: Date.now() };
      const currentLvl = blindLevels[prev.currentLevelIndex] || blindLevels[0];
      switch (action) {
        case 'start':
          if (next.status !== 'completed') next.status = 'running';
          break;
        case 'pause':
          if (next.status === 'running') next.status = 'paused';
          break;
        case 'next_level':
          if (next.currentLevelIndex < blindLevels.length - 1) {
            next.currentLevelIndex += 1;
            next.remainingSeconds = blindLevels[next.currentLevelIndex].durationSeconds;
          }
          break;
        case 'prev_level':
          if (next.currentLevelIndex > 0) {
            next.currentLevelIndex -= 1;
            next.remainingSeconds = blindLevels[next.currentLevelIndex].durationSeconds;
          }
          break;
        case 'reset_level':
          next.remainingSeconds = currentLvl ? currentLvl.durationSeconds : 600;
          break;
        case 'add_minute':
          next.remainingSeconds += 60;
          break;
      }
      return next;
    });
  };

  const eliminatePlayer = async (playerId: number) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/eliminate', {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        if (data.players) setPlayers(data.players);
        if (data.tournaments) setTournaments(data.tournaments);
        return;
      }
    }

    // Static / GitHub Pages fallback
    const targetIndex = liveState.activePlayers.findIndex((p) => p.playerId === playerId);
    if (targetIndex === -1) return;

    const eliminatedPlayer = liveState.activePlayers[targetIndex];
    const currentPlace = liveState.activePlayers.length;
    const pointsAwarded = calculatePointsForPlace(liveState.tableFormat, currentPlace);
    const levelDesc = getCurrentLevelLabel();
    const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const remainingActive = liveState.activePlayers.filter((p) => p.playerId !== playerId);
    const newEliminated = [
      {
        place: currentPlace,
        playerId: eliminatedPlayer.playerId,
        playerName: eliminatedPlayer.name,
        nickname: eliminatedPlayer.nickname,
        pointsAwarded,
        eliminatedAtLevel: levelDesc,
        timestamp: nowTime,
      },
      ...liveState.eliminatedPlayers,
    ];

    let nextStatus = liveState.status;
    let finalActive = remainingActive;
    let winnerBonusPlayerId: number | null = null;
    let winnerBonusPoints = 0;

    if (remainingActive.length === 1) {
      const winner = remainingActive[0];
      winnerBonusPlayerId = winner.playerId;
      winnerBonusPoints = calculatePointsForPlace(liveState.tableFormat, 1);
      finalActive = [];
      newEliminated.unshift({
        place: 1,
        playerId: winner.playerId,
        playerName: winner.name,
        nickname: winner.nickname,
        pointsAwarded: winnerBonusPoints,
        eliminatedAtLevel: `${levelDesc} • Победитель`,
        timestamp: nowTime,
      });
      nextStatus = 'completed';
    }

    setLiveState({
      ...liveState,
      status: nextStatus,
      activePlayers: finalActive,
      eliminatedPlayers: newEliminated,
      lastUpdated: Date.now(),
    });

    setPlayers((prev) =>
      sortPlayers(
        prev.map((p) => {
          if (p.id === eliminatedPlayer.playerId) {
            return {
              ...p,
              seasonPoints: p.seasonPoints + pointsAwarded,
              gamesPlayed: p.gamesPlayed + 1,
              winsCount: currentPlace === 1 ? p.winsCount + 1 : p.winsCount,
              finalTablesCount: currentPlace <= 10 ? p.finalTablesCount + 1 : p.finalTablesCount,
            };
          }
          if (winnerBonusPlayerId && p.id === winnerBonusPlayerId) {
            return {
              ...p,
              seasonPoints: p.seasonPoints + winnerBonusPoints,
              gamesPlayed: p.gamesPlayed + 1,
              winsCount: p.winsCount + 1,
              finalTablesCount: p.finalTablesCount + 1,
            };
          }
          return p;
        })
      )
    );
  };

  const undoLastElimination = async () => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/undo-eliminate', {
        method: 'POST',
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        if (data.players) setPlayers(data.players);
        return;
      }
    }

    // Static / GitHub Pages fallback
    if (liveState.eliminatedPlayers.length === 0) return;
    const lastEntry = liveState.eliminatedPlayers[0];
    setLiveState((prev) => ({
      ...prev,
      status: 'paused',
      activePlayers: [
        ...prev.activePlayers,
        {
          playerId: lastEntry.playerId,
          name: lastEntry.playerName,
          nickname: lastEntry.nickname || '',
          tableNumber: 1,
          seatNumber: prev.activePlayers.length + 1,
          drawnCard: 'A♠',
        },
      ],
      eliminatedPlayers: prev.eliminatedPlayers.slice(1),
      lastUpdated: Date.now(),
    }));

    if (lastEntry.pointsAwarded > 0) {
      setPlayers((prev) =>
        sortPlayers(
          prev.map((p) =>
            p.id === lastEntry.playerId
              ? {
                  ...p,
                  seasonPoints: Math.max(0, p.seasonPoints - lastEntry.pointsAwarded),
                  gamesPlayed: Math.max(0, p.gamesPlayed - 1),
                }
              : p
          )
        )
      );
    }
  };

  const issuePenalty = async (
    playerId: number,
    penaltyType: PenaltyType,
    banInClub?: boolean
  ) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/penalty', {
        method: 'POST',
        body: JSON.stringify({ playerId, penaltyType, banInClub }),
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        if (data.players) setPlayers(data.players);
        return;
      }
    }

    // Static / GitHub Pages fallback
    const target = liveState.activePlayers.find((p) => p.playerId === playerId);
    if (!target) return;

    const penaltyDescriptions: Record<PenaltyType, string> = {
      show_cards_500: 'Штраф −500 фишек • Показ карт до конца раздачи',
      check_nuts_5min: 'Бан на 5 минут • «Чек» с натсом на ривере',
      collusion_1000: 'Штраф −1 000 фишек • Сговор за столом',
      tournament_ban: 'ДИСКВАЛИФИКАЦИЯ (БАН) • Удаление с турнира (0 очков)',
    };
    const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    const logItem: LivePenaltyLog = {
      id: `${Date.now()}-${playerId}`,
      playerId,
      playerName: target.name,
      type: penaltyType,
      description: penaltyDescriptions[penaltyType],
      timestamp: nowTime,
    };

    if (penaltyType === 'tournament_ban') {
      const currentPlace = liveState.activePlayers.length;
      setLiveState((prev) => ({
        ...prev,
        activePlayers: prev.activePlayers.filter((p) => p.playerId !== playerId),
        eliminatedPlayers: [
          {
            place: currentPlace,
            playerId: target.playerId,
            playerName: target.name,
            nickname: target.nickname,
            pointsAwarded: 0,
            eliminatedAtLevel: 'ДИСКВАЛИФИКАЦИЯ (БАН • 0 ОЧКОВ)',
            timestamp: nowTime,
          },
          ...prev.eliminatedPlayers,
        ],
        penalties: [logItem, ...prev.penalties],
        lastUpdated: Date.now(),
      }));
    } else {
      setLiveState((prev) => ({
        ...prev,
        activePlayers: prev.activePlayers.map((p) =>
          p.playerId === playerId
            ? {
                ...p,
                penaltyNote: penaltyDescriptions[penaltyType],
                penaltyExpiresAt:
                  penaltyType === 'check_nuts_5min' ? Date.now() + 5 * 60 * 1000 : p.penaltyExpiresAt,
              }
            : p
        ),
        penalties: [logItem, ...prev.penalties],
        lastUpdated: Date.now(),
      }));
    }

    setPlayers((prev) =>
      sortPlayers(
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                penaltiesCount: p.penaltiesCount + 1,
                isBanned: banInClub ? true : p.isBanned,
                banReason: banInClub
                  ? 'Дисквалификация за грубое нарушение правил турнира'
                  : p.banReason,
              }
            : p
        )
      )
    );
  };

  const clearPlayerPenalty = async (playerId: number) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/clear-penalty', {
        method: 'POST',
        body: JSON.stringify({ playerId }),
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        return;
      }
    }

    setLiveState((prev) => ({
      ...prev,
      activePlayers: prev.activePlayers.map((p) =>
        p.playerId === playerId ? { ...p, penaltyNote: undefined, penaltyExpiresAt: null } : p
      ),
      lastUpdated: Date.now(),
    }));
  };

  const togglePlayerBan = async (playerId: number, isBanned: boolean, banReason?: string) => {
    if (serverAvailableRef.current) {
      const data = await apiCall(`/api/admin/players/${playerId}/ban`, {
        method: 'POST',
        body: JSON.stringify({ isBanned, banReason }),
      });
      if (data?.players) {
        setPlayers(data.players);
        return;
      }
    }

    setPlayers((prev) =>
      sortPlayers(
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                isBanned,
                banReason: isBanned ? (banReason || 'Нарушение правил клуба').trim() : '',
              }
            : p
        )
      )
    );
  };

  const reseatActivePlayers = async () => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/reseat', {
        method: 'POST',
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        return;
      }
    }

    const shuffled = [...liveState.activePlayers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const forceSingle = shuffled.length <= 10;
    setLiveState((prev) => ({
      ...prev,
      activePlayers: shuffled.map((p, idx) => ({
        ...p,
        tableNumber: prev.tableFormat === '1_table' || forceSingle ? 1 : idx % 2 === 0 ? 1 : 2,
        seatNumber:
          prev.tableFormat === '1_table' || forceSingle ? idx + 1 : Math.floor(idx / 2) + 1,
      })),
      lastUpdated: Date.now(),
    }));
  };

  const startNewTournament = async (params: {
    tournamentTitle: string;
    tableFormat: TableFormat;
    startingStack: number;
    selectedPlayerIds: number[];
    useRandomSeating: boolean;
  }) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/live/start-tournament', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      if (data?.liveState) {
        setLiveState(data.liveState);
        return;
      }
    }

    const chosen = players.filter(
      (p) => params.selectedPlayerIds.includes(p.id) && !p.isBanned
    );
    if (chosen.length < 2) return;

    const ordered = [...chosen];
    if (params.useRandomSeating !== false) {
      for (let i = ordered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
      }
    }

    const activePlayers = ordered.map((p, idx) => ({
      playerId: p.id,
      name: p.name,
      nickname: p.nickname,
      tableNumber: params.tableFormat === '1_table' ? 1 : idx % 2 === 0 ? 1 : 2,
      seatNumber:
        params.tableFormat === '1_table' ? (idx % 10) + 1 : Math.floor(idx / 2) + 1,
      drawnCard: 'A♠',
    }));

    setLiveState({
      tournamentTitle: (params.tournamentTitle || 'Вечерний Холдем').trim(),
      tableFormat: params.tableFormat,
      startingStack: params.startingStack || 25000,
      status: 'paused',
      currentLevelIndex: 0,
      remainingSeconds: blindLevels[0]?.durationSeconds || 600,
      totalInitialPlayers: activePlayers.length,
      activePlayers,
      eliminatedPlayers: [],
      penalties: [],
      lastUpdated: Date.now(),
    });
  };

  const addPlayer = async (payload: {
    name: string;
    nickname: string;
    seasonPoints?: number;
    notes?: string;
  }) => {
    if (serverAvailableRef.current) {
      const data = await apiCall('/api/admin/players', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.players) {
        setPlayers(data.players);
        return;
      }
    }

    const created: PlayerRecord = {
      id: Date.now(),
      name: payload.name.trim(),
      nickname: (payload.nickname || '').trim(),
      seasonPoints: payload.seasonPoints ?? 0,
      gamesPlayed: 0,
      winsCount: 0,
      finalTablesCount: 0,
      penaltiesCount: 0,
      isBanned: false,
      banReason: '',
      notes: (payload.notes || '').trim(),
    };
    setPlayers((prev) => sortPlayers([...prev, created]));
  };

  const editPlayer = async (id: number, payload: Partial<PlayerRecord>) => {
    if (serverAvailableRef.current) {
      const data = await apiCall(`/api/admin/players/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (data?.players) {
        setPlayers(data.players);
        return;
      }
    }

    setPlayers((prev) =>
      sortPlayers(prev.map((p) => (p.id === id ? { ...p, ...payload } : p)))
    );
  };

  const removePlayer = async (id: number) => {
    if (serverAvailableRef.current) {
      const data = await apiCall(`/api/admin/players/${id}`, {
        method: 'DELETE',
      });
      if (data?.players) {
        setPlayers(data.players);
        return;
      }
    }

    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <ClubContext.Provider
      value={{
        players,
        announcements,
        clubContent,
        blindLevels,
        tournaments,
        liveState,
        loading,
        error,
        wsConnected,
        isDealerAuthorized,
        loginDealer,
        logoutDealer,
        refreshAll,
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
        removePlayer,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export function useClub() {
  const ctx = useContext(ClubContext);
  if (!ctx) {
    throw new Error('useClub must be used inside ClubProvider');
  }
  return ctx;
}
