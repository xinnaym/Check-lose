import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import * as dotenv from 'dotenv';
import {
  authenticateUserAccount,
  awardPlayerTournamentPoints,
  createPlayer,
  deletePlayer,
  getAllAnnouncements,
  getAllArchivedTournaments,
  getAllBlindLevels,
  getAllClubContent,
  getAllPlayersOrdered,
  getUserByUid,
  incrementPlayerPenalty,
  registerUserAccount,
  replaceAllBlindLevels,
  saveArchivedTournament,
  saveLiveStateSnapshot,
  toggleAnnouncementTableRegistration,
  updatePlayer,
} from './src/db/repository.ts';
import {
  ActiveTournamentPlayer,
  BlindLevelRecord,
  calculatePointsForPlace,
  LivePenaltyLog,
  LiveTournamentState,
  PenaltyType,
  TableFormat,
  UserRole,
} from './src/types/poker.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_BLIND_LEVELS: BlindLevelRecord[] = [
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

let cachedBlindLevels: BlindLevelRecord[] = [...DEFAULT_BLIND_LEVELS];

let liveState: LiveTournamentState = {
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

const TABLE_1_CARDS = ['A♠', 'K♠', 'Q♠', 'J♠', '10♠', 'A♥', 'K♥', 'Q♥', 'J♥', '10♥'];
const TABLE_2_CARDS = ['A♦', 'K♦', 'Q♦', 'J♦', '10♦', 'A♣', 'K♣', 'Q♣', 'J♣', '10♣'];

function getCurrentLevelDescription(): string {
  const lvl = cachedBlindLevels[liveState.currentLevelIndex] || cachedBlindLevels[0];
  if (!lvl) return 'Уровень 1 (100/200)';
  if (lvl.isBreak) return lvl.breakTitle || 'Перерыв';
  return `Уровень ${lvl.levelNumber ?? 1} (${lvl.smallBlind}/${lvl.bigBlind})`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/live' });

  function broadcast(message: { type: string; payload: unknown }) {
    const raw = JSON.stringify(message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(raw);
      }
    });
  }

  wss.on('connection', (ws) => {
    ws.send(
      JSON.stringify({
        type: 'live:state',
        payload: {
          liveState,
          blindLevels: cachedBlindLevels,
        },
      })
    );
  });

  // 1-second authoritative tournament clock & 5-minute ban expiration check
  setInterval(() => {
    let changed = false;
    const now = Date.now();

    for (const player of liveState.activePlayers) {
      if (player.penaltyExpiresAt && now >= player.penaltyExpiresAt) {
        player.penaltyExpiresAt = null;
        player.penaltyNote = undefined;
        changed = true;
      }
    }

    if (liveState.status === 'running') {
      changed = true;
      if (liveState.remainingSeconds > 0) {
        liveState.remainingSeconds -= 1;
        liveState.lastUpdated = now;
      } else {
        if (liveState.currentLevelIndex < cachedBlindLevels.length - 1) {
          liveState.currentLevelIndex += 1;
          const nextLvl = cachedBlindLevels[liveState.currentLevelIndex];
          liveState.remainingSeconds = nextLvl ? nextLvl.durationSeconds : 600;
        } else {
          liveState.status = 'paused';
          liveState.remainingSeconds = 0;
        }
        liveState.lastUpdated = now;
      }
    }

    if (changed) {
      broadcast({
        type: 'live:state',
        payload: {
          liveState,
          blindLevels: cachedBlindLevels,
        },
      });
    }
  }, 1000);

  app.get('/api/bootstrap', async (_req, res) => {
    try {
      const [playersList, announcementsList, contentList, levelsList, archiveList] =
        await Promise.all([
          getAllPlayersOrdered(),
          getAllAnnouncements(),
          getAllClubContent(),
          getAllBlindLevels(),
          getAllArchivedTournaments(),
        ]);

      if (levelsList.length > 0) {
        cachedBlindLevels = levelsList;
      }

      res.json({
        players: playersList,
        announcements: announcementsList,
        clubContent: contentList,
        blindLevels: cachedBlindLevels,
        tournaments: archiveList,
        liveState,
      });
    } catch (error: any) {
      console.error('Failed to bootstrap club data:', error);
      res.status(500).json({
        error: error.message || 'Ошибка загрузки данных клуба',
        blindLevels: cachedBlindLevels,
        liveState,
      });
    }
  });

  // --- Full User Registration & Account Authentication ---

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, nickname, email, password } = req.body as {
        firstName?: string;
        lastName?: string;
        nickname?: string;
        email?: string;
        password?: string;
      };

      if (!firstName?.trim() || !lastName?.trim()) {
        return res.status(400).json({ error: 'Укажите ваши имя и фамилию' });
      }
      if (!email?.trim() || !password?.trim()) {
        return res.status(400).json({ error: 'Укажите логин (или Email) и пароль' });
      }
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
      }

      const { user } = await registerUserAccount({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nickname: (nickname || '').trim(),
        email: email.trim(),
        password: password.trim(),
      });

      const playersList = await getAllPlayersOrdered();
      broadcast({ type: 'data:refresh', payload: { players: playersList } });

      return res.json({
        user,
        token: user.uid,
        players: playersList,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Ошибка регистрации аккаунта',
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { login, password } = req.body as { login?: string; password?: string };
      if (!login?.trim() || !password?.trim()) {
        return res.status(400).json({ error: 'Введите логин/Email и пароль' });
      }

      const user = await authenticateUserAccount(login.trim(), password.trim());
      return res.json({
        user,
        token: user.uid,
      });
    } catch (error: any) {
      return res.status(401).json({
        error: error.message || 'Неверный логин/Email или пароль',
      });
    }
  });

  app.get('/api/auth/me', async (req, res) => {
    const tokenUid = String(req.headers['x-auth-token'] || '');
    if (!tokenUid) {
      return res.json({ user: null });
    }
    const user = await getUserByUid(tokenUid);
    return res.json({ user });
  });

  // --- Table Registration for Authenticated Players ---
  app.post('/api/tables/:id/register', async (req, res) => {
    try {
      const announcementId = Number(req.params.id);
      const tokenUid = String(req.headers['x-auth-token'] || '');
      const user = await getUserByUid(tokenUid);

      const { playerId: bodyPlayerId, playerName: bodyPlayerName, nickname: bodyNickname } =
        req.body as {
          playerId?: number;
          playerName?: string;
          nickname?: string;
        };

      if (!user && !bodyPlayerName) {
        return res.status(401).json({ error: 'Войдите в аккаунт для записи за стол' });
      }

      const allPlayers = await getAllPlayersOrdered();
      const fullName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : (bodyPlayerName || '').trim();

      let linkedPlayer = allPlayers.find(
        (p) =>
          (user?.playerId && p.id === user.playerId) ||
          (bodyPlayerId && p.id === bodyPlayerId) ||
          p.name.toLowerCase() === fullName.toLowerCase()
      );

      if (!linkedPlayer) {
        linkedPlayer = await createPlayer({
          name: fullName,
          nickname: bodyNickname || '',
          notes: 'Записался через сайт',
        });
      }

      if (linkedPlayer.isBanned) {
        return res.status(403).json({
          error: `Запись заблокирована: игрок ${linkedPlayer.name} находится в бан-листе клуба`,
        });
      }

      const { announcements: updatedAnnouncements, registered } =
        await toggleAnnouncementTableRegistration(announcementId, {
          playerId: linkedPlayer.id,
          name: linkedPlayer.name,
          nickname: linkedPlayer.nickname,
        });

      const updatedPlayers = await getAllPlayersOrdered();

      broadcast({
        type: 'data:refresh',
        payload: {
          announcements: updatedAnnouncements,
          players: updatedPlayers,
        },
      });

      return res.json({
        announcements: updatedAnnouncements,
        players: updatedPlayers,
        registered,
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message || 'Не удалось записаться за стол',
      });
    }
  });

  // --- Dealer Role Middleware ---
  const requireDealerAuth: express.RequestHandler = async (req, res, next) => {
    const tokenUid = String(req.headers['x-auth-token'] || '');
    if (!tokenUid) {
      return res.status(401).json({ error: 'Доступ запрещён: войдите под учётной записью дилера' });
    }
    const user = await getUserByUid(tokenUid);
    if (!user || user.role !== 'dealer') {
      return res.status(403).json({ error: 'Доступ к пульту разрешён только учётным записям с ролью Дилер' });
    }
    next();
  };

  // --- Protected Dealer & Tournament Controls ---

  app.post('/api/admin/live/start-tournament', requireDealerAuth, async (req, res) => {
    try {
      const {
        tournamentTitle,
        tableFormat,
        startingStack,
        selectedPlayerIds,
        useRandomSeating,
      } = req.body as {
        tournamentTitle: string;
        tableFormat: TableFormat;
        startingStack?: number;
        selectedPlayerIds: number[];
        useRandomSeating?: boolean;
      };

      const allPlayers = await getAllPlayersOrdered();
      const levels = await getAllBlindLevels();
      if (levels.length > 0) {
        cachedBlindLevels = levels;
      }

      const chosenPlayers = allPlayers.filter(
        (p) => selectedPlayerIds.includes(p.id) && !p.isBanned
      );
      if (chosenPlayers.length < 2) {
        return res.status(400).json({ error: 'Выберите минимум 2 незабаненных игроков для старта турнира' });
      }

      const ordered = [...chosenPlayers];
      if (useRandomSeating !== false) {
        for (let i = ordered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
        }
      }

      const activePlayers: ActiveTournamentPlayer[] = ordered.map((p, idx) => {
        if (tableFormat === '1_table') {
          const seatNumber = (idx % 10) + 1;
          const drawnCard = TABLE_1_CARDS[idx % TABLE_1_CARDS.length];
          return {
            playerId: p.id,
            name: p.name,
            nickname: p.nickname,
            tableNumber: 1,
            seatNumber,
            drawnCard,
          };
        } else {
          const tableNumber = idx % 2 === 0 ? 1 : 2;
          const seatNumber = Math.floor(idx / 2) + 1;
          const cardPool = tableNumber === 1 ? TABLE_1_CARDS : TABLE_2_CARDS;
          const drawnCard = cardPool[(seatNumber - 1) % cardPool.length];
          return {
            playerId: p.id,
            name: p.name,
            nickname: p.nickname,
            tableNumber,
            seatNumber,
            drawnCard,
          };
        }
      });

      const firstLevel = cachedBlindLevels[0] || DEFAULT_BLIND_LEVELS[0];

      liveState = {
        tournamentTitle: (tournamentTitle || 'Вечерний Холдем').trim(),
        tableFormat: tableFormat === '2_tables' ? '2_tables' : '1_table',
        startingStack: Number(startingStack) || 25000,
        status: 'paused',
        currentLevelIndex: 0,
        remainingSeconds: firstLevel.durationSeconds,
        totalInitialPlayers: activePlayers.length,
        activePlayers,
        eliminatedPlayers: [],
        penalties: [],
        lastUpdated: Date.now(),
      };

      await saveLiveStateSnapshot(liveState);

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });

      res.json({ liveState });
    } catch (error: any) {
      console.error('Failed to start new tournament:', error);
      res.status(500).json({ error: error.message || 'Ошибка запуска нового турнира' });
    }
  });

  app.post('/api/admin/live/control', requireDealerAuth, async (req, res) => {
    try {
      const { action } = req.body as {
        action: 'start' | 'pause' | 'next_level' | 'prev_level' | 'reset_level' | 'add_minute';
      };

      const currentLvl = cachedBlindLevels[liveState.currentLevelIndex] || DEFAULT_BLIND_LEVELS[0];

      switch (action) {
        case 'start':
          if (liveState.status !== 'completed') {
            liveState.status = 'running';
          }
          break;
        case 'pause':
          if (liveState.status === 'running') {
            liveState.status = 'paused';
          }
          break;
        case 'next_level':
          if (liveState.currentLevelIndex < cachedBlindLevels.length - 1) {
            liveState.currentLevelIndex += 1;
            liveState.remainingSeconds = cachedBlindLevels[liveState.currentLevelIndex].durationSeconds;
          }
          break;
        case 'prev_level':
          if (liveState.currentLevelIndex > 0) {
            liveState.currentLevelIndex -= 1;
            liveState.remainingSeconds = cachedBlindLevels[liveState.currentLevelIndex].durationSeconds;
          }
          break;
        case 'reset_level':
          liveState.remainingSeconds = currentLvl ? currentLvl.durationSeconds : 600;
          break;
        case 'add_minute':
          liveState.remainingSeconds += 60;
          break;
      }

      liveState.lastUpdated = Date.now();
      await saveLiveStateSnapshot(liveState);

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });

      res.json({ liveState });
    } catch (error: any) {
      console.error('Failed to control live timer:', error);
      res.status(500).json({ error: error.message || 'Ошибка управления таймером' });
    }
  });

  app.post('/api/admin/live/reseat', requireDealerAuth, async (_req, res) => {
    try {
      const shuffled = [...liveState.activePlayers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      const forceSingleTable = shuffled.length <= 10;
      liveState.activePlayers = shuffled.map((p, idx) => {
        if (liveState.tableFormat === '1_table' || forceSingleTable) {
          const seatNumber = idx + 1;
          return {
            ...p,
            tableNumber: 1,
            seatNumber,
            drawnCard: TABLE_1_CARDS[idx % TABLE_1_CARDS.length],
          };
        } else {
          const tableNumber = idx % 2 === 0 ? 1 : 2;
          const seatNumber = Math.floor(idx / 2) + 1;
          const cardPool = tableNumber === 1 ? TABLE_1_CARDS : TABLE_2_CARDS;
          return {
            ...p,
            tableNumber,
            seatNumber,
            drawnCard: cardPool[(seatNumber - 1) % cardPool.length],
          };
        }
      });

      liveState.lastUpdated = Date.now();
      await saveLiveStateSnapshot(liveState);

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });

      res.json({ liveState });
    } catch (error: any) {
      console.error('Failed to reseat players:', error);
      res.status(500).json({ error: error.message || 'Ошибка генератора рассадки' });
    }
  });

  app.post('/api/admin/live/eliminate', requireDealerAuth, async (req, res) => {
    try {
      const { playerId } = req.body as { playerId: number };

      const targetIndex = liveState.activePlayers.findIndex((p) => p.playerId === playerId);
      if (targetIndex === -1) {
        return res.status(404).json({ error: 'Игрок не найден за столом' });
      }

      const eliminatedPlayer = liveState.activePlayers[targetIndex];
      const currentPlace = liveState.activePlayers.length;
      const pointsAwarded = calculatePointsForPlace(liveState.tableFormat, currentPlace);
      const levelDesc = getCurrentLevelDescription();
      const nowTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

      liveState.activePlayers.splice(targetIndex, 1);

      liveState.eliminatedPlayers.unshift({
        place: currentPlace,
        playerId: eliminatedPlayer.playerId,
        playerName: eliminatedPlayer.name,
        nickname: eliminatedPlayer.nickname,
        pointsAwarded,
        eliminatedAtLevel: levelDesc,
        timestamp: nowTime,
      });

      await awardPlayerTournamentPoints(eliminatedPlayer.playerId, pointsAwarded, currentPlace, false);

      if (liveState.activePlayers.length === 1) {
        const winner = liveState.activePlayers[0];
        const firstPlacePoints = calculatePointsForPlace(liveState.tableFormat, 1);
        liveState.activePlayers = [];
        liveState.eliminatedPlayers.unshift({
          place: 1,
          playerId: winner.playerId,
          playerName: winner.name,
          nickname: winner.nickname,
          pointsAwarded: firstPlacePoints,
          eliminatedAtLevel: `${levelDesc} • Победитель`,
          timestamp: nowTime,
        });
        liveState.status = 'completed';

        await awardPlayerTournamentPoints(winner.playerId, firstPlacePoints, 1, false);

        const playedAtFormatted = new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        await saveArchivedTournament({
          title: liveState.tournamentTitle,
          playedAt: playedAtFormatted,
          tableFormat: liveState.tableFormat,
          startingStack: liveState.startingStack,
          totalPlayers: liveState.totalInitialPlayers,
          winnerName: winner.name,
          results: liveState.eliminatedPlayers,
        });
      }

      liveState.lastUpdated = Date.now();
      await saveLiveStateSnapshot(liveState);

      const [updatedPlayers, updatedArchive] = await Promise.all([
        getAllPlayersOrdered(),
        getAllArchivedTournaments(),
      ]);

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });
      broadcast({
        type: 'data:refresh',
        payload: { players: updatedPlayers, tournaments: updatedArchive },
      });

      res.json({
        liveState,
        players: updatedPlayers,
        tournaments: updatedArchive,
      });
    } catch (error: any) {
      console.error('Failed to eliminate player:', error);
      res.status(500).json({ error: error.message || 'Ошибка фиксации выбывания игрока' });
    }
  });

  app.post('/api/admin/live/undo-eliminate', requireDealerAuth, async (_req, res) => {
    try {
      if (liveState.eliminatedPlayers.length === 0) {
        return res.status(400).json({ error: 'Список выбывших пуст' });
      }

      const topEntry = liveState.eliminatedPlayers[0];
      if (topEntry.place === 1 && liveState.eliminatedPlayers.length >= 2) {
        const winnerEntry = liveState.eliminatedPlayers.shift()!;
        const runnerUpEntry = liveState.eliminatedPlayers.shift()!;

        await awardPlayerTournamentPoints(
          winnerEntry.playerId,
          winnerEntry.pointsAwarded,
          1,
          true
        );
        await awardPlayerTournamentPoints(
          runnerUpEntry.playerId,
          runnerUpEntry.pointsAwarded,
          runnerUpEntry.place,
          true
        );

        liveState.activePlayers.push(
          {
            playerId: winnerEntry.playerId,
            name: winnerEntry.playerName,
            nickname: winnerEntry.nickname || '',
            tableNumber: 1,
            seatNumber: 1,
            drawnCard: 'A♠',
          },
          {
            playerId: runnerUpEntry.playerId,
            name: runnerUpEntry.playerName,
            nickname: runnerUpEntry.nickname || '',
            tableNumber: 1,
            seatNumber: 2,
            drawnCard: 'K♠',
          }
        );
        liveState.status = 'paused';
      } else {
        const lastEliminated = liveState.eliminatedPlayers.shift()!;
        if (lastEliminated.pointsAwarded > 0) {
          await awardPlayerTournamentPoints(
            lastEliminated.playerId,
            lastEliminated.pointsAwarded,
            lastEliminated.place,
            true
          );
        }
        liveState.activePlayers.push({
          playerId: lastEliminated.playerId,
          name: lastEliminated.playerName,
          nickname: lastEliminated.nickname || '',
          tableNumber: 1,
          seatNumber: liveState.activePlayers.length + 1,
          drawnCard: TABLE_1_CARDS[liveState.activePlayers.length % TABLE_1_CARDS.length],
        });
      }

      liveState.lastUpdated = Date.now();
      await saveLiveStateSnapshot(liveState);

      const updatedPlayers = await getAllPlayersOrdered();

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });
      broadcast({
        type: 'data:refresh',
        payload: { players: updatedPlayers },
      });

      res.json({ liveState, players: updatedPlayers });
    } catch (error: any) {
      console.error('Failed to undo elimination:', error);
      res.status(500).json({ error: error.message || 'Ошибка отмены выбывания' });
    }
  });

  app.post('/api/admin/live/penalty', requireDealerAuth, async (req, res) => {
    try {
      const { playerId, penaltyType, banInClub } = req.body as {
        playerId: number;
        penaltyType: PenaltyType;
        banInClub?: boolean;
      };

      const targetIndex = liveState.activePlayers.findIndex((p) => p.playerId === playerId);
      if (targetIndex === -1) {
        return res.status(404).json({ error: 'Игрок не найден за столом' });
      }
      const target = liveState.activePlayers[targetIndex];

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

      liveState.penalties.unshift(logItem);

      if (penaltyType === 'tournament_ban') {
        const currentPlace = liveState.activePlayers.length;
        liveState.activePlayers.splice(targetIndex, 1);
        liveState.eliminatedPlayers.unshift({
          place: currentPlace,
          playerId: target.playerId,
          playerName: target.name,
          nickname: target.nickname,
          pointsAwarded: 0,
          eliminatedAtLevel: 'ДИСКВАЛИФИКАЦИЯ (БАН • 0 ОЧКОВ)',
          timestamp: nowTime,
        });
        if (banInClub) {
          await updatePlayer(playerId, {
            isBanned: true,
            banReason: 'Дисквалификация за грубое нарушение правил турнира',
          });
        }
      } else {
        target.penaltyNote = penaltyDescriptions[penaltyType];
        if (penaltyType === 'check_nuts_5min') {
          target.penaltyExpiresAt = Date.now() + 5 * 60 * 1000;
        }
      }

      await incrementPlayerPenalty(playerId);
      liveState.lastUpdated = Date.now();
      await saveLiveStateSnapshot(liveState);
      const updatedPlayers = await getAllPlayersOrdered();

      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });
      broadcast({
        type: 'data:refresh',
        payload: { players: updatedPlayers },
      });

      res.json({ liveState, players: updatedPlayers });
    } catch (error: any) {
      console.error('Failed to issue penalty:', error);
      res.status(500).json({ error: error.message || 'Ошибка начисления штрафа' });
    }
  });

  app.post('/api/admin/live/clear-penalty', requireDealerAuth, async (req, res) => {
    try {
      const { playerId } = req.body as { playerId: number };
      const target = liveState.activePlayers.find((p) => p.playerId === playerId);
      if (target) {
        target.penaltyNote = undefined;
        target.penaltyExpiresAt = null;
        liveState.lastUpdated = Date.now();
        await saveLiveStateSnapshot(liveState);
      }
      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });
      res.json({ liveState });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка снятия штрафа' });
    }
  });

  app.post('/api/admin/players', requireDealerAuth, async (req, res) => {
    try {
      const created = await createPlayer(req.body);
      const playersList = await getAllPlayersOrdered();
      broadcast({ type: 'data:refresh', payload: { players: playersList } });
      res.json({ player: created, players: playersList });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка добавления игрока' });
    }
  });

  app.put('/api/admin/players/:id', requireDealerAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await updatePlayer(id, req.body);
      const playersList = await getAllPlayersOrdered();
      broadcast({ type: 'data:refresh', payload: { players: playersList } });
      res.json({ player: updated, players: playersList });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка обновления игрока' });
    }
  });

  app.post('/api/admin/players/:id/ban', requireDealerAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { isBanned, banReason } = req.body as { isBanned: boolean; banReason?: string };
      const updated = await updatePlayer(id, {
        isBanned: Boolean(isBanned),
        banReason: isBanned ? (banReason || 'Нарушение регламента клуба').trim() : '',
      });
      const playersList = await getAllPlayersOrdered();
      broadcast({ type: 'data:refresh', payload: { players: playersList } });
      res.json({ player: updated, players: playersList });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка изменения статуса бана' });
    }
  });

  app.delete('/api/admin/players/:id', requireDealerAuth, async (req, res) => {
    try {
      const id = Number(req.params.id);
      await deletePlayer(id);
      const playersList = await getAllPlayersOrdered();
      broadcast({ type: 'data:refresh', payload: { players: playersList } });
      res.json({ players: playersList });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка удаления игрока' });
    }
  });

  app.put('/api/admin/blinds', requireDealerAuth, async (req, res) => {
    try {
      const { levels } = req.body as { levels: Omit<BlindLevelRecord, 'id'>[] };
      const updated = await replaceAllBlindLevels(levels);
      cachedBlindLevels = updated;
      broadcast({
        type: 'live:state',
        payload: { liveState, blindLevels: cachedBlindLevels },
      });
      res.json({ blindLevels: cachedBlindLevels });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Ошибка сохранения блайндов' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log('\n============================================================');
    console.log('  ♠  Покерный клуб «Чек это проигрыш» — Сервер запущен!');
    console.log(`  ➜  Локальный адрес (Local):   http://localhost:${PORT}/`);
    console.log(`  ➜  Адрес в сети (Network):    http://127.0.0.1:${PORT}/`);
    console.log(`  ➜  Live-Таймер (WebSocket):   ws://localhost:${PORT}/ws/live`);
    console.log('============================================================\n');
  });
}

startServer();
