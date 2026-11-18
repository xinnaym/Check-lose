export type TableFormat = '1_table' | '2_tables';

export const TEMPLATE_A_POINTS: Record<number, number> = {
  1: 150,
  2: 110,
  3: 85,
  4: 65,
  5: 50,
  6: 40,
  7: 30,
  8: 20,
  9: 15,
  10: 10,
};

export const TEMPLATE_B_POINTS: Record<number, number> = {
  1: 280,
  2: 230,
  3: 190,
  4: 160,
  5: 140,
  6: 120,
  7: 100,
  8: 85,
  9: 70,
  10: 60,
  11: 50,
  12: 45,
  13: 40,
  14: 35,
  15: 30,
  16: 25,
  17: 22,
  18: 20,
  19: 18,
  20: 15,
};

export function calculatePointsForPlace(format: TableFormat, place: number): number {
  if (format === '1_table') {
    return TEMPLATE_A_POINTS[place] ?? 10;
  }
  return TEMPLATE_B_POINTS[place] ?? 15;
}

export type PenaltyType = 'show_cards_500' | 'check_nuts_5min' | 'collusion_1000' | 'tournament_ban';

export interface PlayerRecord {
  id: number;
  name: string;
  nickname: string;
  seasonPoints: number;
  gamesPlayed: number;
  winsCount: number;
  finalTablesCount: number;
  penaltiesCount: number;
  isBanned: boolean;
  banReason: string;
  notes: string;
}

export interface AnnouncementRecord {
  id: number;
  title: string;
  eventDate: string;
  format: string;
  description: string;
  status: string;
  spotsTotal: number;
  spotsTaken: number;
}

export interface ClubContentRecord {
  id: number;
  key: string;
  title: string;
  content: string;
}

export interface BlindLevelRecord {
  id: number;
  levelOrder: number;
  levelNumber: number | null;
  isBreak: boolean;
  breakTitle: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  durationSeconds: number;
}

export interface TournamentResultEntry {
  place: number;
  playerId: number;
  playerName: string;
  nickname?: string;
  pointsAwarded: number;
  eliminatedAtLevel: string;
  timestamp?: string;
}

export interface TournamentArchiveRecord {
  id: number;
  title: string;
  playedAt: string;
  tableFormat: TableFormat;
  startingStack: number;
  totalPlayers: number;
  winnerName: string;
  resultsJson: string;
}

export interface ActiveTournamentPlayer {
  playerId: number;
  name: string;
  nickname: string;
  tableNumber: number;
  seatNumber: number;
  drawnCard: string;
  penaltyNote?: string;
  penaltyExpiresAt?: number | null;
}

export interface LivePenaltyLog {
  id: string;
  playerId: number;
  playerName: string;
  type: PenaltyType;
  description: string;
  timestamp: string;
}

export interface LiveTournamentState {
  tournamentTitle: string;
  tableFormat: TableFormat;
  startingStack: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  currentLevelIndex: number; // index into blindLevels array
  remainingSeconds: number;
  totalInitialPlayers: number;
  activePlayers: ActiveTournamentPlayer[];
  eliminatedPlayers: TournamentResultEntry[];
  penalties: LivePenaltyLog[];
  lastUpdated: number;
}
