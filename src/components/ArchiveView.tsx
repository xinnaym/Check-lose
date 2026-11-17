import React, { useState } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { TournamentResultEntry } from '../types/poker.ts';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ArchiveView: React.FC = () => {
  const { tournaments } = useClub();
  const [expandedId, setExpandedId] = useState<number | null>(
    tournaments.length > 0 ? tournaments[0].id : null
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A39E]">
          <span>История игр сезона</span>
          <span aria-hidden="true">·</span>
          <span>Протоколы начисления очков</span>
          <span aria-hidden="true">·</span>
          <span>База данных PostgreSQL</span>
        </div>
        <h1 className="font-serif-display mt-2 text-3xl font-bold text-[#F4F1EA] sm:text-4xl">
          Архив завершённых турниров клуба
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#94A39E]">
          Каждый завершённый игровой вечер автоматически сохраняется в архив с полным протоколом
          занятых мест, уровней выбывания и начисленных рейтинговых очков.
        </p>
      </div>

      <div className="space-y-4">
        {tournaments.map((item) => {
          let parsedResults: TournamentResultEntry[] = [];
          try {
            parsedResults = JSON.parse(item.resultsJson);
          } catch {
            parsedResults = [];
          }
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="overflow-hidden rounded-xl border border-white/10 bg-[#121917]"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="flex w-full flex-col justify-between gap-4 p-6 text-left transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center cursor-pointer"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A39E]">
                    <span>{item.playedAt}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {item.tableFormat === '2_tables'
                        ? 'Шаблон B (2 стола)'
                        : 'Шаблон A (1 стол)'}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Участников: {item.totalPlayers}</span>
                  </div>
                  <h2 className="text-lg font-semibold text-[#F4F1EA]">{item.title}</h2>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-xs text-[#94A39E]">Победитель турнира</div>
                    <div className="text-sm font-semibold text-[#D4AF37]">
                      {item.winnerName || '—'}
                    </div>
                  </div>
                  <div className="text-[#94A39E]">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 bg-[#0B0F0E]/50 p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-xs text-[#94A39E]">
                          <th className="py-2.5 pr-4 font-medium">Место</th>
                          <th className="py-2.5 px-4 font-medium">Игрок</th>
                          <th className="py-2.5 px-4 font-medium">Момент завершения</th>
                          <th className="py-2.5 pl-4 text-right font-medium">
                            Начислено в рейтинг
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {parsedResults
                          .slice()
                          .sort((a, b) => a.place - b.place)
                          .map((resEntry) => (
                            <tr key={`${item.id}-${resEntry.place}`}>
                              <td className="font-mono-tabular py-2.5 pr-4 font-bold text-[#D4AF37]">
                                #{resEntry.place}
                              </td>
                              <td className="py-2.5 px-4 font-medium text-[#F4F1EA]">
                                {resEntry.playerName}
                              </td>
                              <td className="py-2.5 px-4 text-xs text-[#94A39E]">
                                {resEntry.eliminatedAtLevel}
                              </td>
                              <td className="font-mono-tabular py-2.5 pl-4 text-right font-bold text-[#10B981]">
                                +{resEntry.pointsAwarded} очк.
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {tournaments.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-[#121917] p-12 text-center text-sm text-[#94A39E]">
            Архив турниров пока пуст. Завершённые через Live-таймер игры появятся здесь автоматически.
          </div>
        )}
      </div>
    </div>
  );
};
