import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  blindLevels,
  clubContent,
  players,
  tournaments,
} from './schema.ts';
import {
  AnnouncementRecord,
  BlindLevelRecord,
  ClubContentRecord,
  LiveTournamentState,
  PlayerRecord,
  TableFormat,
  TournamentArchiveRecord,
  TournamentResultEntry,
} from '../types/poker.ts';

// Local fallback data when running `npm run dev` locally without Cloud SQL socket
let localPlayers: PlayerRecord[] = [
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

let localAnnouncements: AnnouncementRecord[] = [
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

let localBlindLevels: BlindLevelRecord[] = [
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

let localTournaments: TournamentArchiveRecord[] = [];
let localClubContent: ClubContentRecord[] = [];

function isDbConfigured(): boolean {
  const host = process.env.SQL_HOST;
  return Boolean(host && host !== '/cloudsql/instance' && process.env.SQL_DB_NAME && process.env.SQL_USER);
}

// 1. Players Repository
export async function getAllPlayersOrdered(): Promise<PlayerRecord[]> {
  if (!isDbConfigured()) {
    return [...localPlayers].sort((a, b) => b.seasonPoints - a.seasonPoints || b.winsCount - a.winsCount);
  }
  try {
    return await db
      .select()
      .from(players)
      .orderBy(desc(players.seasonPoints), desc(players.winsCount), asc(players.id));
  } catch (error) {
    console.error('Database query failed (getAllPlayersOrdered), using fallback:', error);
    return [...localPlayers].sort((a, b) => b.seasonPoints - a.seasonPoints);
  }
}

export async function createPlayer(data: {
  name: string;
  nickname: string;
  seasonPoints?: number;
  gamesPlayed?: number;
  winsCount?: number;
  finalTablesCount?: number;
  notes?: string;
}) {
  if (!isDbConfigured()) {
    const created: PlayerRecord = {
      id: Date.now(),
      name: data.name.trim(),
      nickname: (data.nickname || '').trim(),
      seasonPoints: data.seasonPoints ?? 0,
      gamesPlayed: data.gamesPlayed ?? 0,
      winsCount: data.winsCount ?? 0,
      finalTablesCount: data.finalTablesCount ?? 0,
      penaltiesCount: 0,
      isBanned: false,
      banReason: '',
      notes: (data.notes || '').trim(),
    };
    localPlayers.push(created);
    return created;
  }
  try {
    const result = await db
      .insert(players)
      .values({
        name: data.name.trim(),
        nickname: (data.nickname || '').trim(),
        seasonPoints: data.seasonPoints ?? 0,
        gamesPlayed: data.gamesPlayed ?? 0,
        winsCount: data.winsCount ?? 0,
        finalTablesCount: data.finalTablesCount ?? 0,
        isBanned: false,
        banReason: '',
        notes: (data.notes || '').trim(),
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (createPlayer):', error);
    throw new Error('Не удалось добавить нового игрока.', { cause: error });
  }
}

export async function updatePlayer(
  id: number,
  data: Partial<{
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
  }>
) {
  if (!isDbConfigured()) {
    const idx = localPlayers.findIndex((p) => p.id === id);
    if (idx !== -1) {
      localPlayers[idx] = { ...localPlayers[idx], ...data };
      return localPlayers[idx];
    }
    return null;
  }
  try {
    const result = await db
      .update(players)
      .set(data)
      .where(eq(players.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (updatePlayer):', error);
    throw new Error('Не удалось обновить профиль игрока.', { cause: error });
  }
}

export async function deletePlayer(id: number) {
  if (!isDbConfigured()) {
    localPlayers = localPlayers.filter((p) => p.id !== id);
    return { success: true };
  }
  try {
    await db.delete(players).where(eq(players.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (deletePlayer):', error);
    throw new Error('Не удалось удалить игрока.', { cause: error });
  }
}

export async function awardPlayerTournamentPoints(
  playerId: number,
  pointsDelta: number,
  place: number,
  isUndo = false
) {
  if (!isDbConfigured()) {
    const target = localPlayers.find((p) => p.id === playerId);
    if (!target) return null;
    const gamesDelta = isUndo ? -1 : 1;
    const winsDelta = place === 1 ? (isUndo ? -1 : 1) : 0;
    const ftDelta = place <= 10 ? (isUndo ? -1 : 1) : 0;
    target.seasonPoints = Math.max(0, target.seasonPoints + (isUndo ? -pointsDelta : pointsDelta));
    target.gamesPlayed = Math.max(0, target.gamesPlayed + gamesDelta);
    target.winsCount = Math.max(0, target.winsCount + winsDelta);
    target.finalTablesCount = Math.max(0, target.finalTablesCount + ftDelta);
    return target;
  }
  try {
    const existing = await db
      .select()
      .from(players)
      .where(eq(players.id, playerId));
    if (!existing.length) return null;

    const current = existing[0];
    const gamesDelta = isUndo ? -1 : 1;
    const winsDelta = place === 1 ? (isUndo ? -1 : 1) : 0;
    const ftDelta = place <= 10 ? (isUndo ? -1 : 1) : 0;

    const updated = await db
      .update(players)
      .set({
        seasonPoints: Math.max(0, current.seasonPoints + (isUndo ? -pointsDelta : pointsDelta)),
        gamesPlayed: Math.max(0, current.gamesPlayed + gamesDelta),
        winsCount: Math.max(0, current.winsCount + winsDelta),
        finalTablesCount: Math.max(0, current.finalTablesCount + ftDelta),
      })
      .where(eq(players.id, playerId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (awardPlayerTournamentPoints):', error);
    return null;
  }
}

export async function incrementPlayerPenalty(playerId: number) {
  if (!isDbConfigured()) {
    const target = localPlayers.find((p) => p.id === playerId);
    if (target) target.penaltiesCount += 1;
    return target ?? null;
  }
  try {
    const existing = await db.select().from(players).where(eq(players.id, playerId));
    if (!existing.length) return null;
    const updated = await db
      .update(players)
      .set({ penaltiesCount: existing[0].penaltiesCount + 1 })
      .where(eq(players.id, playerId))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Database query failed (incrementPlayerPenalty):', error);
    return null;
  }
}

export async function getAllAnnouncements(): Promise<AnnouncementRecord[]> {
  if (!isDbConfigured()) return localAnnouncements;
  try {
    return await db.select().from(announcements).orderBy(asc(announcements.id));
  } catch (error) {
    console.error('Database query failed (getAllAnnouncements):', error);
    return localAnnouncements;
  }
}

export async function getAllClubContent(): Promise<ClubContentRecord[]> {
  if (!isDbConfigured()) return localClubContent;
  try {
    return await db.select().from(clubContent).orderBy(asc(clubContent.id));
  } catch (error) {
    console.error('Database query failed (getAllClubContent):', error);
    return localClubContent;
  }
}

export async function getAllBlindLevels(): Promise<BlindLevelRecord[]> {
  if (!isDbConfigured()) return localBlindLevels;
  try {
    return await db.select().from(blindLevels).orderBy(asc(blindLevels.levelOrder));
  } catch (error) {
    console.error('Database query failed (getAllBlindLevels):', error);
    return localBlindLevels;
  }
}

export async function replaceAllBlindLevels(levels: Omit<BlindLevelRecord, 'id'>[]) {
  if (!isDbConfigured()) {
    localBlindLevels = levels.map((lvl, idx) => ({ ...lvl, id: idx + 1 }));
    return localBlindLevels;
  }
  try {
    await db.delete(blindLevels);
    if (levels.length > 0) {
      await db.insert(blindLevels).values(levels);
    }
    return await db.select().from(blindLevels).orderBy(asc(blindLevels.levelOrder));
  } catch (error) {
    console.error('Database query failed (replaceAllBlindLevels):', error);
    throw new Error('Не удалось обновить структуру блайндов.', { cause: error });
  }
}

export async function getAllArchivedTournaments(): Promise<TournamentArchiveRecord[]> {
  if (!isDbConfigured()) return localTournaments;
  try {
    const rows = await db.select().from(tournaments).orderBy(desc(tournaments.id));
    return rows.map((row) => ({
      ...row,
      tableFormat: row.tableFormat as TableFormat,
    }));
  } catch (error) {
    console.error('Database query failed (getAllArchivedTournaments):', error);
    return localTournaments;
  }
}

export async function saveArchivedTournament(data: {
  title: string;
  playedAt: string;
  tableFormat: TableFormat;
  startingStack: number;
  totalPlayers: number;
  winnerName: string;
  results: TournamentResultEntry[];
  createdByUid?: string;
}) {
  if (!isDbConfigured()) {
    const created: TournamentArchiveRecord = {
      id: Date.now(),
      title: data.title,
      playedAt: data.playedAt,
      tableFormat: data.tableFormat,
      startingStack: data.startingStack,
      totalPlayers: data.totalPlayers,
      winnerName: data.winnerName,
      resultsJson: JSON.stringify(data.results),
    };
    localTournaments.unshift(created);
    return created;
  }
  try {
    const result = await db
      .insert(tournaments)
      .values({
        title: data.title,
        playedAt: data.playedAt,
        tableFormat: data.tableFormat,
        startingStack: data.startingStack,
        totalPlayers: data.totalPlayers,
        winnerName: data.winnerName,
        resultsJson: JSON.stringify(data.results),
        createdByUid: data.createdByUid,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (saveArchivedTournament):', error);
    return null;
  }
}

export async function saveLiveStateSnapshot(state: LiveTournamentState) {
  if (!isDbConfigured()) return;
  try {
    await db
      .insert(clubContent)
      .values({
        key: 'live_tournament_state',
        title: 'Live Tournament State Snapshot',
        content: JSON.stringify(state),
      })
      .onConflictDoUpdate({
        target: clubContent.key,
        set: {
          content: JSON.stringify(state),
          updatedAt: sql`now()`,
        },
      });
  } catch (error) {
    console.error('Database query failed (saveLiveStateSnapshot):', error);
  }
}
