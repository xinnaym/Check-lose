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
  BlindLevelRecord,
  LiveTournamentState,
  TableFormat,
  TournamentResultEntry,
} from '../types/poker.ts';

// 1. Players Repository
export async function getAllPlayersOrdered() {
  try {
    return await db
      .select()
      .from(players)
      .orderBy(desc(players.seasonPoints), desc(players.winsCount), asc(players.id));
  } catch (error) {
    console.error('Database query failed (getAllPlayersOrdered):', error);
    throw new Error('Не удалось загрузить рейтинг игроков.', { cause: error });
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
    notes: string;
  }>
) {
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
    throw new Error('Не удалось начислить рейтинговые очки игроку.', { cause: error });
  }
}

export async function incrementPlayerPenalty(playerId: number) {
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
    throw new Error('Не удалось зафиксировать штраф игрока.', { cause: error });
  }
}

// 2. Announcements Repository (CMS)
export async function getAllAnnouncements() {
  try {
    return await db.select().from(announcements).orderBy(asc(announcements.id));
  } catch (error) {
    console.error('Database query failed (getAllAnnouncements):', error);
    throw new Error('Не удалось загрузить анонсы турниров.', { cause: error });
  }
}

export async function createAnnouncement(data: {
  title: string;
  eventDate: string;
  format: string;
  description: string;
  status: string;
  spotsTotal: number;
  spotsTaken: number;
}) {
  try {
    const result = await db.insert(announcements).values(data).returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (createAnnouncement):', error);
    throw new Error('Не удалось создать анонс турнира.', { cause: error });
  }
}

export async function updateAnnouncement(
  id: number,
  data: Partial<{
    title: string;
    eventDate: string;
    format: string;
    description: string;
    status: string;
    spotsTotal: number;
    spotsTaken: number;
  }>
) {
  try {
    const result = await db
      .update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (updateAnnouncement):', error);
    throw new Error('Не удалось обновить анонс турнира.', { cause: error });
  }
}

export async function deleteAnnouncement(id: number) {
  try {
    await db.delete(announcements).where(eq(announcements.id, id));
    return { success: true };
  } catch (error) {
    console.error('Database query failed (deleteAnnouncement):', error);
    throw new Error('Не удалось удалить анонс турнира.', { cause: error });
  }
}

// 3. Club Content Repository (CMS)
export async function getAllClubContent() {
  try {
    return await db.select().from(clubContent).orderBy(asc(clubContent.id));
  } catch (error) {
    console.error('Database query failed (getAllClubContent):', error);
    throw new Error('Не удалось загрузить контент клуба.', { cause: error });
  }
}

export async function upsertClubContent(key: string, title: string, content: string) {
  try {
    const result = await db
      .insert(clubContent)
      .values({ key, title, content })
      .onConflictDoUpdate({
        target: clubContent.key,
        set: { title, content, updatedAt: sql`now()` },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database query failed (upsertClubContent):', error);
    throw new Error('Не удалось сохранить раздел правил.', { cause: error });
  }
}

// 4. Blind Structure Repository (CMS)
export async function getAllBlindLevels(): Promise<BlindLevelRecord[]> {
  try {
    return await db.select().from(blindLevels).orderBy(asc(blindLevels.levelOrder));
  } catch (error) {
    console.error('Database query failed (getAllBlindLevels):', error);
    throw new Error('Не удалось загрузить структуру блайндов.', { cause: error });
  }
}

export async function replaceAllBlindLevels(levels: Omit<BlindLevelRecord, 'id'>[]) {
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

// 5. Tournaments Archive Repository
export async function getAllArchivedTournaments() {
  try {
    return await db.select().from(tournaments).orderBy(desc(tournaments.id));
  } catch (error) {
    console.error('Database query failed (getAllArchivedTournaments):', error);
    throw new Error('Не удалось загрузить архив турниров.', { cause: error });
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
    throw new Error('Не удалось сохранить турнир в архив.', { cause: error });
  }
}

// 6. Persist / Load Live Tournament State in clubContent under key 'live_tournament_state'
export async function saveLiveStateSnapshot(state: LiveTournamentState) {
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

export async function loadLiveStateSnapshot(): Promise<LiveTournamentState | null> {
  try {
    const rows = await db
      .select()
      .from(clubContent)
      .where(eq(clubContent.key, 'live_tournament_state'));
    if (!rows.length) return null;
    return JSON.parse(rows[0].content) as LiveTournamentState;
  } catch (error) {
    console.error('Database query failed (loadLiveStateSnapshot):', error);
    return null;
  }
}
