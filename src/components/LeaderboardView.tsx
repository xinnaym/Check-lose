import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { Search, Trophy, Award, AlertTriangle } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { players, getContentByKey } = useClub();
  const [searchQuery, setSearchQuery] = useState('');
  const [zoneFilter, setZoneFilter] = useState<'all' | 'top10' | 'contenders'>('all');

  const seasonInfo = getContentByKey(
    'season_info',
    'Длительность сезона — 2 месяца. Топ-10 игроков сезона выходят за Финальный стол.'
  );

  // Cutoff score is the 10th place player's score
  const cutoffScore = players[9]?.seasonPoints ?? 0;
  const leaderScore = players[0]?.seasonPoints ?? 0;

  const rankedPlayers = useMemo(() => {
    return players.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      inFinalTable: idx < 10,
      deltaToCutoff: idx < 10 ? p.seasonPoints - cutoffScore : cutoffScore - p.seasonPoints,
    }));
  }, [players, cutoffScore]);

  const filteredPlayers = useMemo(() => {
    return rankedPlayers.filter((p) => {
      const matchesQuery =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nickname.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesQuery) return false;
      if (zoneFilter === 'top10') return p.rank <= 10;
      if (zoneFilter === 'contenders') return p.rank > 10;
      return true;
    });
  }, [rankedPlayers, searchQuery, zoneFilter]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Season Summary */}
      <div className="rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <div className="space-y-2 lg:col-span-8">
            <div className="flex items-center gap-2 text-xs text-[#94A39E]">
              <span>Сезонный рейтинг клуба</span>
              <span aria-hidden="true">·</span>
              <span>Длительность сезона: 2 месяца</span>
              <span aria-hidden="true">·</span>
              <span>Отбор в Топ-10</span>
            </div>
            <h1 className="font-serif-display text-3xl font-bold text-[#F4F1EA] sm:text-4xl">
              Турнирная таблица и отбор за «Финальный стол»
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-[#94A39E]">{seasonInfo}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 lg:col-span-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <div>
              <div className="text-xs text-[#94A39E]">Лидер сезона (#1)</div>
              <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#D4AF37]">
                {leaderScore} очк.
              </div>
              <div className="mt-0.5 truncate text-xs text-[#F4F1EA]">
                {players[0]?.name || '—'}
              </div>
            </div>
            <div>
              <div className="text-xs text-[#94A39E]">Порог Финального стола (#10)</div>
              <div className="font-mono-tabular mt-1 text-2xl font-bold text-[#10B981]">
                {cutoffScore} очк.
              </div>
              <div className="mt-0.5 truncate text-xs text-[#F4F1EA]">
                {players[9]?.name || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#121917] p-1">
          <button
            onClick={() => setZoneFilter('all')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              zoneFilter === 'all'
                ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
                : 'text-[#94A39E] hover:text-[#F4F1EA]'
            }`}
          >
            Все игроки ({rankedPlayers.length})
          </button>
          <button
            onClick={() => setZoneFilter('top10')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              zoneFilter === 'top10'
                ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
                : 'text-[#94A39E] hover:text-[#F4F1EA]'
            }`}
          >
            Топ-10 • Финальный стол
          </button>
          <button
            onClick={() => setZoneFilter('contenders')}
            className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              zoneFilter === 'contenders'
                ? 'bg-[#D4AF37] text-[#0B0F0E] font-semibold'
                : 'text-[#94A39E] hover:text-[#F4F1EA]'
            }`}
          >
            Претенденты (11+ место)
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A39E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по имени или никнейму..."
            className="w-full rounded-lg border border-white/10 bg-[#121917] py-2 pl-9 pr-4 text-sm text-[#F4F1EA] placeholder-[#94A39E] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121917]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-[#0B0F0E]/60 text-xs text-[#94A39E]">
                <th className="py-3.5 pl-6 pr-3 font-medium">Ранг</th>
                <th className="py-3.5 px-3 font-medium">Участник клуба</th>
                <th className="py-3.5 px-3 font-medium">Статус отбора</th>
                <th className="py-3.5 px-3 text-right font-medium">Турниров</th>
                <th className="py-3.5 px-3 text-right font-medium">Побед (Топ-1)</th>
                <th className="py-3.5 px-3 text-right font-medium">Финальных столов</th>
                <th className="py-3.5 px-3 text-right font-medium">Запас / Отставание</th>
                <th className="py-3.5 pl-3 pr-6 text-right font-medium">Очки сезона</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPlayers.map((player) => {
                const isCutoffRow = player.rank === 10 && zoneFilter === 'all' && !searchQuery;
                return (
                  <React.Fragment key={player.id}>
                    <tr
                      className={`transition-colors hover:bg-white/[0.03] ${
                        player.inFinalTable ? 'bg-[#D4AF37]/[0.03]' : ''
                      }`}
                    >
                      <td className="font-mono-tabular py-3.5 pl-6 pr-3 font-bold">
                        <span
                          className={
                            player.rank === 1
                              ? 'text-[#D4AF37] text-base'
                              : player.inFinalTable
                                ? 'text-[#F4F1EA]'
                                : 'text-[#94A39E]'
                          }
                        >
                          #{player.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-[#F4F1EA]">{player.name}</div>
                        <div className="flex items-center gap-2 text-xs text-[#94A39E]">
                          <span>{player.nickname || 'Участник клуба'}</span>
                          {player.notes && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate max-w-xs">{player.notes}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs">
                        {player.inFinalTable ? (
                          <span className="font-medium text-[#10B981]">
                            Зона Финального стола (Топ-10)
                          </span>
                        ) : (
                          <span className="text-[#94A39E]">Зона борьбы за Топ-10</span>
                        )}
                      </td>
                      <td className="font-mono-tabular py-3.5 px-3 text-right text-[#F4F1EA]">
                        {player.gamesPlayed}
                      </td>
                      <td className="font-mono-tabular py-3.5 px-3 text-right text-[#F4F1EA]">
                        {player.winsCount}
                      </td>
                      <td className="font-mono-tabular py-3.5 px-3 text-right text-[#94A39E]">
                        {player.finalTablesCount}
                      </td>
                      <td className="font-mono-tabular py-3.5 px-3 text-right text-xs">
                        {player.inFinalTable ? (
                          <span className="text-[#10B981]">
                            +{player.deltaToCutoff} от #10 места
                          </span>
                        ) : (
                          <span className="text-[#F59E0B]">
                            −{player.deltaToCutoff} до #10 места
                          </span>
                        )}
                      </td>
                      <td className="font-mono-tabular py-3.5 pl-3 pr-6 text-right text-base font-bold text-[#D4AF37]">
                        {player.seasonPoints}
                      </td>
                    </tr>

                    {isCutoffRow && (
                      <tr className="bg-[#D4AF37]/10">
                        <td
                          colSpan={8}
                          className="py-2 px-6 text-center text-xs font-semibold tracking-wide text-[#D4AF37]"
                        >
                          ↑ ГРАНИЦА ОТБОРА ЗА «ФИНАЛЬНЫЙ СТОЛ СЕЗОНА» (ТОП-10 ИГРОКОВ) ↑
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredPlayers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-[#94A39E]">
                    По вашему запросу игроки не найдены.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
