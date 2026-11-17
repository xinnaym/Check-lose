import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Таблица пользователей (администраторов / дилеров), привязанная к Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('dealer'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Таблица игроков клуба и сезонного рейтинга
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  nickname: text('nickname').notNull().default(''),
  seasonPoints: integer('season_points').notNull().default(0),
  gamesPlayed: integer('games_played').notNull().default(0),
  winsCount: integer('wins_count').notNull().default(0),
  finalTablesCount: integer('final_tables_count').notNull().default(0),
  penaltiesCount: integer('penalties_count').notNull().default(0),
  notes: text('notes').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Таблица анонсов предстоящих турниров и новостей клуба (CMS)
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  eventDate: text('event_date').notNull(),
  format: text('format').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('registration'), // 'registration' | 'upcoming' | 'completed'
  spotsTotal: integer('spots_total').notNull().default(20),
  spotsTaken: integer('spots_taken').notNull().default(14),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Таблица контента и правил клуба (CMS)
export const clubContent = pgTable('club_content', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Таблица структуры блайндов и перерывов турнира (CMS)
export const blindLevels = pgTable('blind_levels', {
  id: serial('id').primaryKey(),
  levelOrder: integer('level_order').notNull(),
  levelNumber: integer('level_number'),
  isBreak: boolean('is_break').notNull().default(false),
  breakTitle: text('break_title').notNull().default(''),
  smallBlind: integer('small_blind').notNull().default(0),
  bigBlind: integer('big_blind').notNull().default(0),
  ante: integer('ante').notNull().default(0),
  durationSeconds: integer('duration_seconds').notNull().default(600),
});

// 6. Архив завершенных турниров и распределение очков
export const tournaments = pgTable('tournaments', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  playedAt: text('played_at').notNull(),
  tableFormat: text('table_format').notNull(), // '1_table' | '2_tables'
  startingStack: integer('starting_stack').notNull().default(25000),
  totalPlayers: integer('total_players').notNull(),
  winnerName: text('winner_name').notNull().default(''),
  resultsJson: text('results_json').notNull(),
  createdByUid: text('created_by_uid').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  tournaments: many(tournaments),
}));

export const tournamentsRelations = relations(tournaments, ({ one }) => ({
  creator: one(users, {
    fields: [tournaments.createdByUid],
    references: [users.uid],
  }),
}));
