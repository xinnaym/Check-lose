import React from 'react';
import { useClub } from '../context/ClubContext.tsx';

export const RulesView: React.FC = () => {
  const { getContentByKey, blindLevels } = useClub();

  const etiquetteText = getContentByKey(
    'rules_etiquette',
    'Взаимное уважение, запрет на оскорбления, подсказки и умышленное затягивание времени.'
  );
  const penaltiesText = getContentByKey(
    'rules_penalties',
    'Штраф 500 фишек за показ карт до конца раздачи, удаление на 5 минут за «чек» с натсом, штраф 1000 фишек за сговор.'
  );
  const disclaimerText = getContentByKey(
    'rules_disclaimer',
    'Строгое уведомление о запрете игры на реальные деньги согласно УК РФ.'
  );

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#94A39E]">
          <span>Официальный регламент клуба</span>
          <span aria-hidden="true">·</span>
          <span>Спортивный Техасский Холдем</span>
          <span aria-hidden="true">·</span>
          <span>Стартовый стек 25 000 фишек</span>
        </div>
        <h1 className="font-serif-display mt-2 text-3xl font-bold text-[#F4F1EA] sm:text-4xl">
          Правила, этикет и дисциплинарный регламент
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#94A39E]">
          Кодекс поведения за столом покерного клуба «Чек это проигрыш» направлен на поддержание
          честной спортивной борьбы, уважительной атмосферы и динамичного темпа каждого турнира.
        </p>
      </div>

      {/* 01. Disciplinary Penalties Grid (TZ Section 2) */}
      <section className="space-y-5">
        <div>
          <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
            01. Система штрафов за игровым столом
          </h2>
          <p className="mt-1 text-xs text-[#94A39E]">
            Штрафы фиксируются дилером в админ-панели и мгновенно отображаются на ТВ-экране зала
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <div className="text-xs text-[#94A39E]">Нарушение тайны раздачи</div>
            <div className="font-mono-tabular mt-2 text-2xl font-bold text-[#F59E0B]">
              Штраф 500 фишек
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#F4F1EA]">
              Показ карт до конца раздачи
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#94A39E]">
              Демонстрация своих карманных карт любому участнику за столом до завершения всех кругов
              торговли (при наличии активных игроков в раздаче) карается принудительным изъятием 500
              фишек из стека в пользу текущего банка.
            </p>
          </div>

          <div className="rounded-xl border border-[#D4AF37]/40 bg-[#121917] p-6">
            <div className="text-xs text-[#D4AF37]">Главное правило клуба «Чек это проигрыш»</div>
            <div className="font-mono-tabular mt-2 text-2xl font-bold text-[#D4AF37]">
              Удаление на 5 минут
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#F4F1EA]">
              «Чек» с натсом на ривере
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#94A39E]">
              Если игрок на ривере в позиции последнего слова (или без возможности получить ре-рейз)
              объявляет «Чек», имея на руках натс (абсолютно лучшую возможную комбинацию), он
              немедленно удаляется из-за стола ровно на 5 минут с автоматической постановкой блайндов.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#121917] p-6">
            <div className="text-xs text-[#94A39E]">Нарушение спортивной честности</div>
            <div className="font-mono-tabular mt-2 text-2xl font-bold text-[#EF4444]">
              Штраф 1 000 фишек
            </div>
            <h3 className="mt-3 text-base font-semibold text-[#F4F1EA]">
              Сговор (Тим-плей / Софт-плей)
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#94A39E]">
              Любые проявления командной игры, умышленный отказ от агрессии в пользу друга, подача
              условных сигналов или передача фишек между стеками наказываются штрафом 1 000 фишек с
              каждого участника сговора вплоть до дисквалификации.
            </p>
          </div>
        </div>
      </section>

      {/* 02. Etiquette & Detailed Text from CMS */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8">
          <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
            02. Этикет и поведение за столом
          </h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#94A39E]">
            {etiquetteText}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#121917] p-6 sm:p-8">
          <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
            03. Порядок применения дисциплинарных мер
          </h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[#94A39E]">
            {penaltiesText}
          </div>
        </div>
      </section>

      {/* 04. Official Blind Structure Table */}
      <section className="space-y-4">
        <div>
          <h2 className="font-serif-display text-2xl font-bold text-[#F4F1EA]">
            04. Регламент уровней блайндов и перерывов
          </h2>
          <p className="mt-1 text-xs text-[#94A39E]">
            Уровни по 10 минут (от 100/200 до 40 000/50 000) с перерывами на укрупнение фишек (Color-Up)
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#121917]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#0B0F0E]/60 text-xs text-[#94A39E]">
                  <th className="py-3 pl-6 pr-3 font-medium">Этап</th>
                  <th className="py-3 px-3 font-medium">Малый / Большой блайнд</th>
                  <th className="py-3 px-3 font-medium">Анте (BB Ante)</th>
                  <th className="py-3 pl-3 pr-6 text-right font-medium">Длительность</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blindLevels.map((lvl) => (
                  <tr
                    key={lvl.id}
                    className={
                      lvl.isBreak ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'hover:bg-white/[0.02]'
                    }
                  >
                    <td className="py-3 pl-6 pr-3 font-medium">
                      {lvl.isBreak ? 'ПЕРЕРЫВ' : `Уровень ${lvl.levelNumber}`}
                    </td>
                    <td className="font-mono-tabular py-3 px-3 font-semibold">
                      {lvl.isBreak
                        ? lvl.breakTitle
                        : `${lvl.smallBlind.toLocaleString('ru-RU')} / ${lvl.bigBlind.toLocaleString('ru-RU')}`}
                    </td>
                    <td className="font-mono-tabular py-3 px-3 text-[#94A39E]">
                      {lvl.isBreak ? '—' : lvl.ante > 0 ? lvl.ante.toLocaleString('ru-RU') : '—'}
                    </td>
                    <td className="font-mono-tabular py-3 pl-3 pr-6 text-right">
                      {Math.round(lvl.durationSeconds / 60)} мин
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 05. Legal Notice / Criminal Code Disclaimer (TZ Section 2) */}
      <section className="rounded-xl border border-[#EF4444]/30 bg-[#121917] p-6 sm:p-8">
        <div className="text-xs font-semibold text-[#EF4444]">
          Обязательное правовое уведомление (УК РФ)
        </div>
        <h2 className="font-serif-display mt-1 text-2xl font-bold text-[#F4F1EA]">
          Отказ от ответственности и запрет игры на реальные деньги
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#F4F1EA]/90">{disclaimerText}</p>
      </section>
    </div>
  );
};
