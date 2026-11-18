import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  refreshAll: () => Promise<void>;
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
  addPlayer: (data: { name: string; nickname: string; seasonPoints?: number; notes?: string }) => Promise<void>;
  editPlayer: (id: number, data: Partial<PlayerRecord>) => Promise<void>;
  removePlayer: (id: number) => Promise<void>;
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
            if (msg.payload.liveState) setLiveState(msg.payload.liveState);
            if (msg.payload.blindLevels) setBlindLevels(msg.payload.blindLevels);
          } else if (msg.type === 'data:refresh' && msg.payload) {
            if (msg.payload.players) setPlayers(msg.payload.players);
            if (msg.payload.announcements) setAnnouncements(msg.payload.announcements);
            if (msg.payload.clubContent) setClubContent(msg.payload.clubContent);
            if (msg.payload.tournaments) setTournaments(msg.payload.tournaments);
          }
        } catch (parseErr) {
          console.error('WS parse error:', parseErr);
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
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [refreshAll]);

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Ошибка выполнения запроса');
    }
    return data;
  };

  const controlTimer = async (
    action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute'
  ) => {
    const data = await apiCall('/api/admin/live/control', {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    if (data.liveState) setLiveState(data.liveState);
  };

  const eliminatePlayer = async (playerId: number) => {
    const data = await apiCall('/api/admin/live/eliminate', {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
    if (data.tournaments) setTournaments(data.tournaments);
  };

  const undoLastElimination = async () => {
    const data = await apiCall('/api/admin/live/undo-eliminate', {
      method: 'POST',
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
  };

  const issuePenalty = async (
    playerId: number,
    penaltyType: 'show_cards_500' | 'check_nuts_5min' | 'collusion_1000'
  ) => {
    const data = await apiCall('/api/admin/live/penalty', {
      method: 'POST',
      body: JSON.stringify({ playerId, penaltyType }),
    });
    if (data.liveState) setLiveState(data.liveState);
    if (data.players) setPlayers(data.players);
  };

  const reseatActivePlayers = async () => {
    const data = await apiCall('/api/admin/live/reseat', {
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
    const data = await apiCall('/api/admin/live/start-tournament', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (data.liveState) setLiveState(data.liveState);
  };

  const addPlayer = async (payload: {
    name: string;
    nickname: string;
    seasonPoints?: number;
    notes?: string;
  }) => {
    const data = await apiCall('/api/admin/players', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.players) setPlayers(data.players);
  };

  const editPlayer = async (id: number, payload: Partial<PlayerRecord>) => {
    const data = await apiCall(`/api/admin/players/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (data.players) setPlayers(data.players);
  };

  const removePlayer = async (id: number) => {
    const data = await apiCall(`/api/admin/players/${id}`, {
      method: 'DELETE',
    });
    if (data.players) setPlayers(data.players);
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
        refreshAll,
        controlTimer,
        eliminatePlayer,
        undoLastElimination,
        issuePenalty,
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
