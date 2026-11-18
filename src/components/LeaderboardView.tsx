import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { Search, Ban, AlertTriangle, Trophy } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { players } = useClub();
  const [searchQuery, setSearchQuery] = useState('');

  const cutoffScore = players[9]?.seasonPoints ?? 0;

  const rankedPlayers = useMemo(() => {
    return players.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      inFinalTable: idx < 10 && !p.isBanned,
      deltaToCutoff: idx < 10 ? p.seasonPoints - cutoffScore : cutoffScore - p.seasonPoints,
    }));
  }, [players, cutoffScore]);

  const filteredPlayers = useMemo(() => {
    return rankedPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rankedPlayers, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-5 rounded-3xl p-5 sm:p-8 lg:flex-row lg:items-center">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316]">
            <Trophy className="h-3.5 w-3.5" />
            <span>СЕЗОННЫЙ РЕЙТИНГ (2 МЕСЯЦА) · ОТБОР В ТОП-10</span>
          </div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-4xl">
            Гонка за «Финальный стол»
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Первые 10 игроков по итогам двухмесячного сезона проходят за главный Финальный стол клуба.
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти игрока по имени..."
            className="glass-well w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-[#F97316] focus:outline-none"
          />
        </div>
      </div>

      {/* MOBILE CARDS VIEW (< 768px) — Zero horizontal scroll needed */}
      <div className="space-y-2.5 md:hidden">
        {filteredPlayers.map((player) => {
          const isCutoffRow = player.rank === 10 && !searchQuery;
          return (
            <React.Fragment key={player.id}>
              <div
                className={`rounded-2xl p-4 ${
                  player.isBanned
                    ? 'border border-rose-500/40 bg-rose-950/20'
                    : player.rank <= 3
                      ? 'glass-crimson'
                      : 'glass-panel'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`font-mono-tabular flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-sm font-extrabold ${
                        player.rank <= 3 ? 'text-[#F97316]' : 'text-white'
                      }`}
                    >
                      #{player.rank}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-white">
                          {player.name}
                        </span>
                        {player.isBanned && (
                          <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-300">
                            БАН
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Игр: {player.gamesPlayed} · Побед: {player.winsCount}
                        {player.penaltiesCount > 0 && (
                          <span className="text-[#F97316]"> · Штрафов: {player.penaltiesCount}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono-tabular text-lg font-extrabold text-white">
                      {player.seasonPoints}
                    </div>
                    <div className="font-mono-tabular text-[11px]">
                      {player.inFinalTable ? (
                        <span className="text-emerald-400">+{player.deltaToCutoff} к #10</span>
                      ) : (
                        <span className="text-orange-400">−{player.deltaToCutoff} до #10</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {isCutoffRow && (
                <div className="rounded-xl bg-[#F97316]/20 border border-[#F97316]/40 py-2.5 px-4 text-center text-[11px] font-extrabold tracking-wider text-[#F97316]">
                  ↑ ЗОНА «ФИНАЛЬНОГО СТОЛА СЕЗОНА» (ТОП-10) ↑
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= 768px) */}
      <div className="glass-panel hidden md:block overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-xs text-slate-400">
                <th className="py-4 pl-6 pr-3 font-medium">Место</th>
                <th className="py-4 px-3 font-medium">Игрок</th>
                <th className="py-4 px-3 font-medium">Статус / Дисциплина</th>
                <th className="py-4 px-3 text-right font-medium">Игр</th>
                <th className="py-4 px-3 text-right font-medium">Побед</th>
                <th className="py-4 px-3 text-right font-medium">До #10 места</th>
                <th className="py-4 pl-3 pr-6 text-right font-medium">Очки сезона</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredPlayers.map((player) => {
                const isCutoffRow = player.rank === 10 && !searchQuery;
                return (
                  <React.Fragment key={player.id}>
                    <tr
                      className={`transition-colors hover:bg-white/[0.04] ${
                        player.isBanned
                          ? 'bg-rose-950/20'
                          : player.inFinalTable
                            ? 'bg-white/[0.02]'
                            : ''
                      }`}
                    >
                      <td className="font-mono-tabular py-4 pl-6 pr-3 font-bold">
                        <span
                          className={
                            player.rank <= 3
                              ? 'text-[#F97316] text-base'
                              : player.inFinalTable
                                ? 'text-white'
                                : 'text-slate-500'
                          }
                        >
                          #{player.rank}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="font-semibold text-white">{player.name}</div>
                        {player.nickname && (
                          <div className="text-xs text-slate-400">{player.nickname}</div>
                        )}
                      </td>
                      <td className="py-4 px-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {player.isBanned ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 font-bold text-rose-300">
                              <Ban className="h-3 w-3" />
                              ЗАБАНЕН В КЛУБЕ
                            </span>
                          ) : player.inFinalTable ? (
                            <span className="font-semibold text-emerald-400">
                              Финальный стол (Топ-10)
                            </span>
                          ) : (
                            <span className="text-slate-400">В гонке за Топ-10</span>
                          )}

                          {player.penaltiesCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#F97316]/15 px-2 py-0.5 text-[11px] font-bold text-[#F97316]">
                              <AlertTriangle className="h-3 w-3" />
                              Штрафов: {player.penaltiesCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="font-mono-tabular py-4 px-3 text-right text-slate-300">
                        {player.gamesPlayed}
                      </td>
                      <td className="font-mono-tabular py-4 px-3 text-right text-slate-300">
                        {player.winsCount}
                      </td>
                      <td className="font-mono-tabular py-4 px-3 text-right text-xs">
                        {player.inFinalTable ? (
                          <span className="text-emerald-400">+{player.deltaToCutoff}</span>
                        ) : (
                          <span className="text-orange-400">−{player.deltaToCutoff}</span>
                        )}
                      </td>
                      <td className="font-mono-tabular py-4 pl-3 pr-6 text-right text-base font-extrabold text-white">
                        {player.seasonPoints}
                      </td>
                    </tr>

                    {isCutoffRow && (
                      <tr className="bg-[#F97316]/15">
                        <td
                          colSpan={7}
                          className="py-2.5 px-6 text-center text-xs font-bold tracking-wider text-[#F97316]"
                        >
                          ↑ ЗОНА ПОПАДАНИЯ ЗА «ФИНАЛЬНЫЙ СТОЛ СЕЗОНА» (ТОП-10) ↑
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
