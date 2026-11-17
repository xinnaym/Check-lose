/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClubProvider, useClub } from './context/ClubContext.tsx';
import { HomeView } from './components/HomeView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { RulesView } from './components/RulesView.tsx';
import { ArchiveView } from './components/ArchiveView.tsx';
import { LiveTimerView } from './components/LiveTimerView.tsx';
import { AdminView } from './components/AdminView.tsx';

type NavTab = 'home' | 'leaderboard' | 'rules' | 'archive' | 'live' | 'admin';

const ClubLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const { loading, error, refreshAll } = useClub();

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F0E] text-[#F4F1EA]">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 border-b border-white/10 bg-[#0B0F0E]/95 px-6 py-4 backdrop-blur-sm">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="font-serif-display text-xl font-bold tracking-tight text-[#F4F1EA] whitespace-nowrap shrink-0 cursor-pointer"
        >
          Чек это проигрыш
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#94A39E]">
          <button
            onClick={() => setActiveTab('home')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#F4F1EA] ${
              activeTab === 'home' ? 'text-[#F4F1EA] underline underline-offset-8 decoration-[#D4AF37]' : ''
            }`}
          >
            Клуб
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#F4F1EA] ${
              activeTab === 'leaderboard' ? 'text-[#F4F1EA] underline underline-offset-8 decoration-[#D4AF37]' : ''
            }`}
          >
            Рейтинг
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#F4F1EA] ${
              activeTab === 'rules' ? 'text-[#F4F1EA] underline underline-offset-8 decoration-[#D4AF37]' : ''
            }`}
          >
            Регламент
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#F4F1EA] ${
              activeTab === 'archive' ? 'text-[#F4F1EA] underline underline-offset-8 decoration-[#D4AF37]' : ''
            }`}
          >
            Архив
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-[#F4F1EA] ${
              activeTab === 'admin' ? 'text-[#F4F1EA] underline underline-offset-8 decoration-[#D4AF37]' : ''
            }`}
          >
            Админ-панель
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('live')}
            className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'live'
                ? 'bg-[#F4F1EA] text-[#0B0F0E]'
                : 'bg-[#D4AF37] text-[#0B0F0E] hover:bg-[#e3be42]'
            }`}
          >
            Live-Таймер (ТВ)
          </button>
        </div>
      </header>

      {/* Mobile Navigation Strip (visible only below md) */}
      <div className="flex md:hidden items-center gap-4 overflow-x-auto border-b border-white/10 bg-[#121917] px-4 py-2.5 text-xs font-medium text-[#94A39E]">
        <button
          onClick={() => setActiveTab('home')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'home' ? 'text-[#D4AF37] font-semibold' : ''}`}
        >
          Клуб
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'leaderboard' ? 'text-[#D4AF37] font-semibold' : ''}`}
        >
          Рейтинг
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'rules' ? 'text-[#D4AF37] font-semibold' : ''}`}
        >
          Регламент
        </button>
        <button
          onClick={() => setActiveTab('archive')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'archive' ? 'text-[#D4AF37] font-semibold' : ''}`}
        >
          Архив
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'admin' ? 'text-[#D4AF37] font-semibold' : ''}`}
        >
          Админ-панель
        </button>
      </div>

      {/* Main Content Container */}
      <main className="mx-auto w-full max-w-[1360px] flex-1 px-4 pt-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-[#EF4444]/40 bg-[#121917] px-5 py-4 text-xs text-[#F4F1EA]">
            <span>{error}</span>
            <button
              onClick={() => refreshAll()}
              className="rounded-lg bg-white/10 px-3 py-1.5 font-medium hover:bg-white/15 cursor-pointer"
            >
              Повторить
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 py-8">
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-[#121917]" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="h-44 animate-pulse rounded-xl border border-white/10 bg-[#121917]" />
              <div className="h-44 animate-pulse rounded-xl border border-white/10 bg-[#121917]" />
              <div className="h-44 animate-pulse rounded-xl border border-white/10 bg-[#121917]" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
            {activeTab === 'rules' && <RulesView />}
            {activeTab === 'archive' && <ArchiveView />}
            {activeTab === 'live' && (
              <LiveTimerView onOpenAdmin={() => setActiveTab('admin')} />
            )}
            {activeTab === 'admin' && <AdminView />}
          </>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-white/10 bg-[#0B0F0E] py-8 text-xs text-[#94A39E]">
        <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="space-y-1">
            <div className="font-serif-display text-base font-bold text-[#F4F1EA]">
              Покерный клуб «Чек это проигрыш»
            </div>
            <p>
              Спортивно-развлекательный клуб интеллектуального досуга (Техасский Холдем). Игры на
              реальные деньги строго запрещены согласно УК РФ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <button
              onClick={() => setActiveTab('home')}
              className="hover:text-[#F4F1EA] cursor-pointer"
            >
              Главная
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="hover:text-[#F4F1EA] cursor-pointer"
            >
              Сезонный рейтинг
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className="hover:text-[#F4F1EA] cursor-pointer"
            >
              Правила и штрафы
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className="hover:text-[#F4F1EA] cursor-pointer"
            >
              Live-Таймер (16:9)
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="hover:text-[#F4F1EA] cursor-pointer"
            >
              Пульт дилера
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClubProvider>
      <ClubLayout />
    </ClubProvider>
  );
}
