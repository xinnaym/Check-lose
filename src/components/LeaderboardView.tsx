import React, { useState, useMemo } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { Search, Plus } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { players, addPlayer } = useClub();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newNick, setNewNick] = useState('');

  const cutoffScore = players[9]?.seasonPoints ?? 0;

  const rankedPlayers = useMemo(() => {
    return players.map((p, idx) => ({
      ...p,
      rank: idx + 1,
      inFinalTable: idx < 10,
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

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addPlayer({ name: newName, nickname: newNick, seasonPoints: 0 });
    setNewName('');
    setNewNick('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="glass-panel flex flex-col justify-between gap-6 rounded-3xl p-6 sm:p-8 lg:flex-row lg:items-center">
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-[#F43F5E]">
            СЕЗОННЫЙ РЕЙТИНГ (2 МЕСЯЦА) · ОТБОР В ТОП-10
          </div>
          <h1 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Гонка за «Финальный стол»
          </h1>
          <p className="text-sm text-slate-400">
            Первые 10 игроков по итогам двухмесячного сезона проходят за главный Финальный стол клуба.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Найти игрока..."
              className="glass-well w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:border-[#F43F5E] focus:outline-none"
            />
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#F43F5E]" />
            <span>Новый игрок</span>
          </button>
        </div>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleQuickAdd}
          className="glass-panel flex flex-wrap items-center gap-3 rounded-2xl p-4"
        >
          <input
            type="text"
            placeholder="Имя и фамилия игрока"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="glass-well flex-1 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Никнейм (необязательно)"
            value={newNick}
            onChange={(e) => setNewNick(e.target.value)}
            className="glass-well w-56 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            className="btn-crimson rounded-xl px-5 py-2.5 text-xs font-bold cursor-pointer"
          >
            Добавить в клуб
          </button>
        </form>
      )}

      {/* Standings Table */}
      <div className="glass-panel overflow-hidden rounded-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-xs text-slate-400">
                <th className="py-4 pl-6 pr-3 font-medium">Место</th>
                <th className="py-4 px-3 font-medium">Игрок</th>
                <th className="py-4 px-3 font-medium">Статус</th>
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
                        player.inFinalTable ? 'bg-white/[0.02]' : ''
                      }`}
                    >
                      <td className="font-mono-tabular py-4 pl-6 pr-3 font-bold">
                        <span
                          className={
                            player.rank <= 3
                              ? 'text-[#F43F5E] text-base'
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
                        {player.inFinalTable ? (
                          <span className="font-semibold text-emerald-400">
                            Финальный стол (Топ-10)
                          </span>
                        ) : (
                          <span className="text-slate-400">В гонке за Топ-10</span>
                        )}
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
                          <span className="text-rose-400">−{player.deltaToCutoff}</span>
                        )}
                      </td>
                      <td className="font-mono-tabular py-4 pl-3 pr-6 text-right text-base font-extrabold text-white">
                        {player.seasonPoints}
                      </td>
                    </tr>

                    {isCutoffRow && (
                      <tr className="bg-[#E11D48]/15">
                        <td
                          colSpan={7}
                          className="py-2.5 px-6 text-center text-xs font-bold tracking-wider text-[#F43F5E]"
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
