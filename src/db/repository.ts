import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE_PATH = path.resolve(__dirname, '../../data/club-db.json');

export interface StoredUserRecord extends UserAccount {
  passwordHash: string;
}

interface LocalDatabaseSchema {
  users: StoredUserRecord[];
  players: PlayerRecord[];
  announcements: AnnouncementRecord[];
  blindLevels: BlindLevelRecord[];
  tournaments: TournamentArchiveRecord[];
  clubContent: ClubContentRecord[];
  liveState?: LiveTournamentState;
}

const DEFAULT_DB_DATA: LocalDatabaseSchema = {
  users: [
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
  ],
  players: [
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
  ],
  announcements: [
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
  ],
  blindLevels: [
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
  ],
  tournaments: [],
  clubContent: [],
};

let dbCache: LocalDatabaseSchema | null = null;

function loadLocalDb(): LocalDatabaseSchema {
  if (dbCache) return dbCache;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<LocalDatabaseSchema>;
      dbCache = {
        users: Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : DEFAULT_DB_DATA.users,
        players: Array.isArray(parsed.players) && parsed.players.length > 0 ? parsed.players : DEFAULT_DB_DATA.players,
        announcements:
          Array.isArray(parsed.announcements) && parsed.announcements.length > 0
            ? parsed.announcements
            : DEFAULT_DB_DATA.announcements,
        blindLevels:
          Array.isArray(parsed.blindLevels) && parsed.blindLevels.length > 0
            ? parsed.blindLevels
            : DEFAULT_DB_DATA.blindLevels,
        tournaments: Array.isArray(parsed.tournaments) ? parsed.tournaments : [],
        clubContent: Array.isArray(parsed.clubContent) ? parsed.clubContent : [],
        liveState: parsed.liveState,
      };
      return dbCache;
    }
  } catch (err) {
    console.error('Failed to read local DB file, initializing defaults:', err);
  }
  dbCache = JSON.parse(JSON.stringify(DEFAULT_DB_DATA));
  persistLocalDb();
  return dbCache!;
}

function persistLocalDb() {
  if (!dbCache) return;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbCache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local DB file:', err);
  }
}

function toUserAccount(row: StoredUserRecord): UserAccount {
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

// --- User Accounts & Auth Repository (Strictly Role 'player' on registration) ---

export async function registerUserAccount(data: {
  firstName: string;
  lastName: string;
  nickname?: string;
  email: string;
  password: string;
}): Promise<{ user: UserAccount; player: PlayerRecord }> {
  const store = loadLocalDb();
  const cleanEmail = data.email.trim().toLowerCase();
  const firstName = data.firstName.trim();
  const lastName = data.lastName.trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const nickname = (data.nickname || '').trim();

  if (data.password.trim().length < 6) {
    throw new Error('Пароль должен содержать минимум 6 символов');
  }

  const exists = store.users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    throw new Error('Пользователь с таким логином или Email уже зарегистрирован');
  }

  let linkedPlayer = store.players.find(
    (p) => p.name.toLowerCase() === fullName.toLowerCase()
  );
  if (!linkedPlayer) {
    linkedPlayer = await createPlayer({
      name: fullName,
      nickname,
      notes: 'Участник клуба',
    });
  }

  // Registration is strictly in the 'player' role; dealer accounts are pre-configured in DB
  const role: UserRole = 'player';
  const createdUser: StoredUserRecord = {
    id: Date.now(),
    uid: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    email: cleanEmail,
    firstName,
    lastName,
    passwordHash: data.password.trim(),
    role,
    playerId: linkedPlayer.id,
  };

  store.users.push(createdUser);
  persistLocalDb();

  return { user: toUserAccount(createdUser), player: linkedPlayer };
}

export async function authenticateUserAccount(
  loginOrEmail: string,
  password: string
): Promise<UserAccount> {
  const store = loadLocalDb();
  const cleanLogin = loginOrEmail.trim().toLowerCase();

  const found = store.users.find(
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

export async function getUserByUid(uid: string): Promise<UserAccount | null> {
  if (!uid) return null;
  const store = loadLocalDb();
  const found = store.users.find((u) => u.uid === uid);
  return found ? toUserAccount(found) : null;
}

// 1. Players Repository
export async function getAllPlayersOrdered(): Promise<PlayerRecord[]> {
  const store = loadLocalDb();
  return [...store.players].sort(
    (a, b) => b.seasonPoints - a.seasonPoints || b.winsCount - a.winsCount || a.id - b.id
  );
}

export async function createPlayer(data: {
  name: string;
  nickname: string;
  seasonPoints?: number;
  gamesPlayed?: number;
  winsCount?: number;
  finalTablesCount?: number;
  notes?: string;
}): Promise<PlayerRecord> {
  const store = loadLocalDb();
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
  store.players.push(created);
  persistLocalDb();
  return created;
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
): Promise<PlayerRecord | null> {
  const store = loadLocalDb();
  const idx = store.players.findIndex((p) => p.id === id);
  if (idx !== -1) {
    store.players[idx] = { ...store.players[idx], ...data };
    persistLocalDb();
    return store.players[idx];
  }
  return null;
}

export async function deletePlayer(id: number) {
  const store = loadLocalDb();
  store.players = store.players.filter((p) => p.id !== id);
  persistLocalDb();
  return { success: true };
}

export async function awardPlayerTournamentPoints(
  playerId: number,
  pointsDelta: number,
  place: number,
  isUndo = false
) {
  const store = loadLocalDb();
  const target = store.players.find((p) => p.id === playerId);
  if (!target) return null;
  const gamesDelta = isUndo ? -1 : 1;
  const winsDelta = place === 1 ? (isUndo ? -1 : 1) : 0;
  const ftDelta = place <= 10 ? (isUndo ? -1 : 1) : 0;
  target.seasonPoints = Math.max(0, target.seasonPoints + (isUndo ? -pointsDelta : pointsDelta));
  target.gamesPlayed = Math.max(0, target.gamesPlayed + gamesDelta);
  target.winsCount = Math.max(0, target.winsCount + winsDelta);
  target.finalTablesCount = Math.max(0, target.finalTablesCount + ftDelta);
  persistLocalDb();
  return target;
}

export async function incrementPlayerPenalty(playerId: number) {
  const store = loadLocalDb();
  const target = store.players.find((p) => p.id === playerId);
  if (target) {
    target.penaltiesCount += 1;
    persistLocalDb();
  }
  return target ?? null;
}

// 2. Announcements & Table Registration Repository
export async function getAllAnnouncements(): Promise<AnnouncementRecord[]> {
  const store = loadLocalDb();
  return store.announcements;
}

export async function toggleAnnouncementTableRegistration(
  announcementId: number,
  playerEntry: TableRegisteredPlayer
): Promise<{ announcements: AnnouncementRecord[]; registered: boolean }> {
  const store = loadLocalDb();
  const target = store.announcements.find((a) => a.id === announcementId);
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

  target.registeredPlayersJson = JSON.stringify(nextReg);
  target.spotsTaken = nextReg.length;
  persistLocalDb();

  return { announcements: store.announcements, registered };
}

export async function getAllClubContent(): Promise<ClubContentRecord[]> {
  const store = loadLocalDb();
  return store.clubContent;
}

export async function getAllBlindLevels(): Promise<BlindLevelRecord[]> {
  const store = loadLocalDb();
  return [...store.blindLevels].sort((a, b) => a.levelOrder - b.levelOrder);
}

export async function replaceAllBlindLevels(levels: Omit<BlindLevelRecord, 'id'>[]) {
  const store = loadLocalDb();
  store.blindLevels = levels.map((lvl, idx) => ({ ...lvl, id: idx + 1 }));
  persistLocalDb();
  return store.blindLevels;
}

export async function getAllArchivedTournaments(): Promise<TournamentArchiveRecord[]> {
  const store = loadLocalDb();
  return store.tournaments;
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
  const store = loadLocalDb();
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
  store.tournaments.unshift(created);
  persistLocalDb();
  return created;
}

export async function saveLiveStateSnapshot(state: LiveTournamentState) {
  const store = loadLocalDb();
  store.liveState = state;
  persistLocalDb();
}
