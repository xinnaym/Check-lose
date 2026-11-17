import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  AnnouncementRecord,
  BlindLevelRecord,
  ClubContentRecord,
  LiveTournamentState,
  PlayerRecord,
  TableFormat,
  TournamentArchiveRecord,
} from '../types/poker.ts';

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
  currentUser: User | null;
  authLoading: boolean;
  authError: string | null;
  signInDealer: () => Promise<void>;
  signOutDealer: () => Promise<void>;
  refreshAll: () => Promise<void>;
  getContentByKey: (key: string, fallback: string) => string;
  // Admin Live Actions
  controlTimer: (action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute') => Promise<void>;
  eliminatePlayer: (playerId: number) => Promise<void>;
  undoLastElimination: () => Promise<void>;
  issuePenalty: (playerId: number, penaltyType: 'show_cards_500' | 'check_nuts_5min' | 'collusion_1000') => Promise<void>;
  reseatActivePlayers: () => Promise<void>;
  startNewTournament: (params: {
    tournamentTitle: string;
    tableFormat: TableFormat;
    startingStack: number;
    selectedPlayerIds: number[];
    useRandomSeating: boolean;
  }) => Promise<void>;
  // Admin CMS Actions
  addPlayer: (data: { name: string; nickname: string; seasonPoints?: number; notes?: string }) => Promise<void>;
  editPlayer: (id: number, data: Partial<PlayerRecord>) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
  addAnnouncement: (data: Omit<AnnouncementRecord, 'id'>) => Promise<void>;
  editAnnouncement: (id: number, data: Partial<AnnouncementRecord>) => Promise<void>;
  removeAnnouncement: (id: number) => Promise<void>;
  saveClubContent: (key: string, title: string, content: string) => Promise<void>;
  saveBlindStructure: (levels: Omit<BlindLevelRecord, 'id'>[]) => Promise<void>;
}

const ClubContext = createContext<ClubContextValue | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);
  const [clubContent, setClubContent] = useState<ClubContentRecord[]>([]);
  const [blindLevels, setBlindLevels] = useState<BlindLevelRecord[]>([]);
  const [tournaments, setTournaments] = useState<TournamentArchiveRecord[]>([]);
  const [liveState, setLiveState] = useState<LiveTournamentState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const refreshAll = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Не удалось загрузить данные клуба');
      }
      if (data.players) setPlayers(data.players);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.clubContent) setClubContent(data.clubContent);
      if (data.blindLevels) setBlindLevels(data.blindLevels);
      if (data.tournaments) setTournaments(data.tournaments);
      if (data.liveState) setLiveState(data.liveState);
      setError(null);
    } catch (err: any) {
      console.error('Bootstrap error:', err);
      setError(err.message || 'Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  }, []);

  // Setup WebSocket connection with automatic reconnect
  useEffect(() => {
    let isMounted = true;

    const connectWs = () => {
      if (!isMounted) return;
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
            if (msg.payload.liveState) {
              setLiveState(msg.payload.liveState);
            }
            if (msg.payload.blindLevels) {
              setBlindLevels(msg.payload.blindLevels);
            }
          } else if (msg.type === 'data:refresh' && msg.payload) {
            if (msg.payload.players) setPlayers(msg.payload.players);
            if (msg.payload.announcements) setAnnouncements(msg.payload.announcements);
            if (msg.payload.clubContent) setClubContent(msg.payload.clubContent);
            if (msg.payload.tournaments) setTournaments(msg.payload.tournaments);
          }
        } catch (parseErr) {
          console.error('WS message parse error:', parseErr);
        }
      };

      socket.onclose = () => {
        if (!isMounted) return;
        setWsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(connectWs, 2500);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    refreshAll();
    connectWs();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [refreshAll]);

  // Firebase Auth listener (token kept strictly in memory)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          setAuthToken(token);
          await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (err) {
          console.error('Error syncing token:', err);
        }
      } else {
        setAuthToken(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInDealer = async () => {
    setAuthError(null);
    try {
      const credential = await signInWithPopup(auth, googleAuthProvider);
      const token = await credential.user.getIdToken();
      setAuthToken(token);
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setAuthError(err.message || 'Не удалось выполнить вход через Google');
      throw err;
    }
  };

  const signOutDealer = async () => {
    await signOut(auth);
    setAuthToken(null);
    setCurrentUser(null);
  };

  const authedFetch = async (url: string, options: RequestInit = {}) => {
    let token = authToken;
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
      setAuthToken(token);
    }
    if (!token) {
      throw new Error('Требуется вход администратора / дилера');
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка выполнения запроса');
    }
    return data;
  };

  const getContentByKey = useCallback(
    (key: string, fallback: string) => {
      const found = clubContent.find((c) => c.key === key);
      return found ? found.content : fallback;
    },
    [clubContent]
  );

  // Live Tournament Controls
  const controlTimer = async (
    action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute'
  ) => {
    const data = await authedFetch('/api/admin/live/control', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    if (data.liveState) setLiveState(data.liveState);
  };

  const eliminatePlayer = async (playerId: number) => {
    const data = await authedFetch('/api/admin/live/eliminate', {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
    if (data.tournaments) setTournaments(data.tournaments);
  };

  const undoLastElimination = async () => {
    const data = await authedFetch('/api/admin/live/undo-eliminate', {
      method: 'POST',
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
  };

  const issuePenalty = async (
    playerId: number,
    penaltyType: 'show_cards_500' | 'check_nuts_5min' | 'collusion_1000'
  ) => {
    const data = await authedFetch('/api/admin/live/penalty', {
      method: 'POST',
      body: JSON.stringify({ playerId, penaltyType }),
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
  };

  const reseatActivePlayers = async () => {
    const data = await authedFetch('/api/admin/live/reseat', {
      method: 'POST',
    });
    if (data.liveState) setLiveState(data.liveState);
  };

  const startNewTournament = async (params: {
    tournamentTitle: string;
    tableFormat: TableFormat;
    startingStack: number;
    selectedPlayerIds: number[];
    useRandomSeating: boolean;
  }) => {
    const data = await authedFetch('/api/admin/live/start-tournament', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (data.liveState) setLiveState(data.liveState);
  };

  // CMS Actions
  const addPlayer = async (payload: {
    name: string;
    nickname: string;
    seasonPoints?: number;
    notes?: string;
  }) => {
    const data = await authedFetch('/api/admin/players', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.players) setPlayers(data.players);
  };

  const editPlayer = async (id: number, payload: Partial<PlayerRecord>) => {
    const data = await authedFetch(`/api/admin/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (data.players) setPlayers(data.players);
  };

  const removePlayer = async (id: number) => {
    const data = await authedFetch(`/api/admin/players/${id}`, {
      method: 'DELETE',
    });
    if (data.players) setPlayers(data.players);
  };

  const addAnnouncement = async (payload: Omit<AnnouncementRecord, 'id'>) => {
    const data = await authedFetch('/api/admin/announcements', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.announcements) setAnnouncements(data.announcements);
  };

  const editAnnouncement = async (id: number, payload: Partial<AnnouncementRecord>) => {
    const data = await authedFetch(`/api/admin/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (data.announcements) setAnnouncements(data.announcements);
  };

  const removeAnnouncement = async (id: number) => {
    const data = await authedFetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
    });
    if (data.announcements) setAnnouncements(data.announcements);
  };

  const saveClubContent = async (key: string, title: string, content: string) => {
    const data = await authedFetch('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ key, title, content }),
    });
    if (data.clubContent) setClubContent(data.clubContent);
  };

  const saveBlindStructure = async (levels: Omit<BlindLevelRecord, 'id'>[]) => {
    const data = await authedFetch('/api/admin/blinds', {
      method: 'PUT',
      body: JSON.stringify({ levels }),
    });
    if (data.blindLevels) setBlindLevels(data.blindLevels);
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
        currentUser,
        authLoading,
        authError,
        signInDealer,
        signOutDealer,
        refreshAll,
        getContentByKey,
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
        editAnnouncement,
        removeAnnouncement,
        saveClubContent,
        saveBlindStructure,
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
