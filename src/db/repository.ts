import { asc, desc, eq, sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  announcements,
  blindLevels,
  clubContent,
  players,
  tournaments,
  users,
} from './schema.ts';
import {
  AnnouncementRecord,
  BlindLevelRecord,
  ClubContentRecord,
  LiveTournamentState,
  parseRegisteredPlayers,
  PlayerRecord,
  TableFormat,
  TableRegisteredPlayer,
  TournamentArchiveRecord,
  TournamentResultEntry,
  UserAccount,
  UserRole,
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

interface LocalUserStored extends UserAccount {
  passwordHash: string;
}

let localUsers: LocalUserStored[] = [
  {
    id: 1,
    uid: 'dealer-main',
    email: 'dealer',
    firstName: 'Главный',
    lastName: 'Дилер',
    passwordHash: 'dealer25000',
    role: 'dealer',
    playerId: null,
  },
  {
    id: 2,
    uid: 'dealer-email',
    email: 'dealer@checkclub.ru',
    firstName: 'Главный',
    lastName: 'Дилер',
    passwordHash: 'dealer25000',
    role: 'dealer',
    playerId: null,
  },
  {
    id: 3,
    uid: 'player-1',
    email: 'lekalin@checkclub.ru',
    firstName: 'Илья',
    lastName: 'Лекалин',
    passwordHash: '25000',
    role: 'dealer',
    playerId: 1,
  },
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
    spotsTaken: 6,
    registeredPlayersJson: JSON.stringify([
      { playerId: 1, name: 'Илья Лекалин', nickname: 'Shark_IL' },
      { playerId: 2, name: 'Дмитрий Воронов', nickname: 'Raven' },
      { playerId: 3, name: 'Александр Соколов', nickname: 'Falcon' },
      { playerId: 4, name: 'Максим Волков', nickname: 'GreyWolf' },
      { playerId: 5, name: 'Илья Морозов', nickname: 'Frost' },
      { playerId: 6, name: 'Евгений Козлов', nickname: 'Architect' },
    ]),
  },
  {
    id: 2,
    title: 'Турнир #2 • Главное Событие Вечера (2 стола)',
    eventDate: 'Пятница • 21:15',
    format: '2 стола (18–20 мест) • Стек 25 000 • Уровни по 10 мин',
    description: 'Основной рейтинговый турнир вечера с объединением в финальный стол. Повышенная сетка очков по Шаблону B (1 место — 280 очков).',
    status: 'registration',
    spotsTotal: 20,
    spotsTaken: 8,
    registeredPlayersJson: JSON.stringify([
      { playerId: 1, name: 'Илья Лекалин', nickname: 'Shark_IL' },
      { playerId: 2, name: 'Дмитрий Воронов', nickname: 'Raven' },
      { playerId: 3, name: 'Александр Соколов', nickname: 'Falcon' },
      { playerId: 4, name: 'Максим Волков', nickname: 'GreyWolf' },
      { playerId: 7, name: 'Роман Лебедев', nickname: 'CheckRaise' },
      { playerId: 8, name: 'Сергей Новиков', nickname: 'Novik' },
      { playerId: 9, name: 'Кирилл Павлов', nickname: 'K_Ace' },
      { playerId: 10, name: 'Никита Семёнов', nickname: 'AllIn_Nik' },
    ]),
  },
  {
    id: 3,
    title: 'Турнир #3 • Ночной Финал «Чек это проигрыш»',
    eventDate: 'Пятница • 23:30',
    format: '1 стол (10 мест) • Стек 25 000 • Уровни по 10 мин',
    description: 'Заключительный динамичный турнир вечера для самых стойких стратегов клуба. Начисление очков в сезонный рейтинг по Шаблону A.',
    status: 'upcoming',
    spotsTotal: 10,
    spotsTaken: 4,
    registeredPlayersJson: JSON.stringify([
      { playerId: 1, name: 'Илья Лекалин', nickname: 'Shark_IL' },
      { playerId: 5, name: 'Илья Морозов', nickname: 'Frost' },
      { playerId: 7, name: 'Роман Лебедев', nickname: 'CheckRaise' },
      { playerId: 11, name: 'Андрей Голубев', nickname: 'Vegas' },
    ]),
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

// --- User Accounts & Auth Repository ---

function toUserAccount(row: {
  id: number;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  playerId: number | null;
}): UserAccount {
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    firstName: row.firstName,
    lastName: row.lastName,
    role: row.role === 'dealer' ? 'dealer' : 'player',
    playerId: row.playerId,
  };
}

export async function registerUserAccount(data: {
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  password: string;
  role?: UserRole;
}): Promise<{ user: UserAccount; player: PlayerRecord }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const nickname = (data.nickname || '').trim();
  const role: UserRole = data.role === 'dealer' ? 'dealer' : 'player';

  if (!isDbConfigured()) {
    const exists = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      throw new Error('Пользователь с таким логином или Email уже зарегистрирован');
    }

    let linkedPlayer = localPlayers.find(
      (p) => p.name.toLowerCase() === fullName.toLowerCase()
    );
    if (!linkedPlayer) {
      linkedPlayer = await createPlayer({
        name: fullName,
        nickname,
        notes: 'Участник клуба',
      });
    }

    const createdUser: LocalUserStored = {
      id: Date.now(),
      uid: `user-${Date.now()}`,
      email: cleanEmail,
      firstName,
      lastName,
      passwordHash: data.password,
      role,
      playerId: linkedPlayer.id,
    };
    localUsers.push(createdUser);
    return { user: toUserAccount(createdUser), player: linkedPlayer };
  }

  try {
    const existingUsers = await db.select().from(users);
    const duplicate = existingUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error('Пользователь с таким логином или Email уже зарегистрирован');
    }

    const allPlayers = await getAllPlayersOrdered();
    let linkedPlayer = allPlayers.find(
      (p) => p.name.toLowerCase() === fullName.toLowerCase()
    );
    if (!linkedPlayer) {
      linkedPlayer = await createPlayer({
        name: fullName,
        nickname,
        notes: 'Участник клуба',
      });
    }

    const uid = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const inserted = await db
      .insert(users)
      .values({
        uid,
        email: cleanEmail,
        firstName,
        lastName,
        passwordHash: data.password,
        role,
        playerId: linkedPlayer.id,
      })
      .returning();

    return {
      user: toUserAccount(inserted[0]),
      player: linkedPlayer,
    };
  } catch (error: any) {
    console.error('Database query failed (registerUserAccount):', error);
    throw new Error(error.message || 'Не удалось зарегистрировать аккаунт');
  }
}

export async function authenticateUserAccount(
  loginOrEmail: string,
  password: string
): Promise<UserAccount> {
  const cleanLogin = loginOrEmail.trim().toLowerCase();

  if (!isDbConfigured()) {
    const found = localUsers.find(
      (u) =>
        (u.email.toLowerCase() === cleanLogin ||
          `${u.firstName} ${u.lastName}`.toLowerCase() === cleanLogin) &&
        u.passwordHash === password
    );
    if (!found) {
      throw new Error('Неверный логин/Email или пароль');
    }
    return toUserAccount(found);
  }

  try {
    const allUsers = await db.select().from(users);
    const found = allUsers.find(
      (u) =>
        (u.email.toLowerCase() === cleanLogin ||
          `${u.firstName} ${u.lastName}`.toLowerCase() === cleanLogin) &&
        u.passwordHash === password
    );

    if (found) {
      return toUserAccount(found);
    }

    // Fallback check against built-in default dealer accounts
    const fallbackDealer = localUsers.find(
      (u) => u.email.toLowerCase() === cleanLogin && u.passwordHash === password
    );
    if (fallbackDealer) {
      return toUserAccount(fallbackDealer);
    }

    throw new Error('Неверный логин/Email или пароль');
  } catch (error: any) {
    console.error('Database query failed (authenticateUserAccount):', error);
    throw new Error(error.message || 'Неверный логин/Email или пароль');
  }
}

export async function getUserByUid(uid: string): Promise<UserAccount | null> {
  if (!uid) return null;
  if (!isDbConfigured()) {
    const found = localUsers.find((u) => u.uid === uid);
    return found ? toUserAccount(found) : null;
  }
  try {
    const rows = await db.select().from(users).where(eq(users.uid, uid));
    if (rows.length > 0) {
      return toUserAccount(rows[0]);
    }
    const localFound = localUsers.find((u) => u.uid === uid);
    return localFound ? toUserAccount(localFound) : null;
  } catch {
    const localFound = localUsers.find((u) => u.uid === uid);
    return localFound ? toUserAccount(localFound) : null;
  }
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

// 2. Announcements & Table Registration Repository
export async function getAllAnnouncements(): Promise<AnnouncementRecord[]> {
  if (!isDbConfigured()) return localAnnouncements;
  try {
    return await db.select().from(announcements).orderBy(asc(announcements.id));
  } catch (error) {
    console.error('Database query failed (getAllAnnouncements):', error);
    return localAnnouncements;
  }
}

export async function toggleAnnouncementTableRegistration(
  announcementId: number,
  playerEntry: TableRegisteredPlayer
): Promise<{ announcements: AnnouncementRecord[]; registered: boolean }> {
  const list = await getAllAnnouncements();
  const target = list.find((a) => a.id === announcementId);
  if (!target) {
    throw new Error('Турнирный стол не найден');
  }

  const currentReg = parseRegisteredPlayers(target.registeredPlayersJson);
  const alreadyIdx = currentReg.findIndex(
    (r) =>
      r.playerId === playerEntry.playerId ||
      r.name.toLowerCase() === playerEntry.name.toLowerCase()
  );

  let nextReg: TableRegisteredPlayer[];
  let registered: boolean;

  if (alreadyIdx !== -1) {
    nextReg = currentReg.filter((_, idx) => idx !== alreadyIdx);
    registered = false;
  } else {
    if (currentReg.length >= target.spotsTotal) {
      throw new Error('За этим столом уже заняты все места');
    }
    nextReg = [...currentReg, playerEntry];
    registered = true;
  }

  const nextJson = JSON.stringify(nextReg);
  const nextSpotsTaken = nextReg.length;

  if (!isDbConfigured()) {
    localAnnouncements = localAnnouncements.map((a) =>
      a.id === announcementId
        ? { ...a, registeredPlayersJson: nextJson, spotsTaken: nextSpotsTaken }
        : a
    );
    return { announcements: localAnnouncements, registered };
  }

  try {
    await db
      .update(announcements)
      .set({
        registeredPlayersJson: nextJson,
        spotsTaken: nextSpotsTaken,
      })
      .where(eq(announcements.id, announcementId));

    const updatedList = await db.select().from(announcements).orderBy(asc(announcements.id));
    return { announcements: updatedList, registered };
  } catch (error: any) {
    console.error('Database query failed (toggleAnnouncementTableRegistration):', error);
    throw new Error('Не удалось обновить запись за стол');
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
