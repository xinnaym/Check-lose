/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ClubProvider, useClub } from './context/ClubContext.tsx';
import { HomeView } from './components/HomeView.tsx';
import { LeaderboardView } from './components/LeaderboardView.tsx';
import { LiveTimerView } from './components/LiveTimerView.tsx';
import { AdminView } from './components/AdminView.tsx';

type NavTab = 'home' | 'leaderboard' | 'live' | 'admin';

export const CLUB_LOGO_PATH = '/assets/aistudio/IMG_1509_1a4ff1a5.png';

const ClubLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const { loading, error, refreshAll } = useClub();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060608] text-[#F8FAFC]">
      {/* Ambient Lighting Matched to Club Logo (Obsidian + Vibrant Orange + Silver) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-44 left-1/4 h-[520px] w-[620px] rounded-full opacity-25 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.55) 0%, rgba(234, 88, 12, 0.05) 70%, transparent 100%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[540px] w-[540px] rounded-full opacity-15 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-48 -left-24 h-[500px] w-[580px] rounded-full opacity-20 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060608]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          {/* Zone 1: Brand with Attached Club Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer"
          >
            <img
              src={CLUB_LOGO_PATH}
              alt="Покерный клуб Чек это проигрыш"
              className="h-11 w-11 rounded-full border border-white/15 object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-lg font-extrabold tracking-tight text-white">
              Чек это <span className="rounded-md bg-[#F97316] px-1.5 py-0.5 text-[#060608]">проигрыш</span>
            </span>
          </button>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('home')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-white ${
                activeTab === 'home'
                  ? 'text-white font-semibold underline underline-offset-8 decoration-[#F97316] decoration-2'
                  : ''
              }`}
            >
              Клуб и правила
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-white ${
                activeTab === 'leaderboard'
                  ? 'text-white font-semibold underline underline-offset-8 decoration-[#F97316] decoration-2'
                  : ''
              }`}
            >
              Рейтинг сезона
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-white ${
                activeTab === 'admin'
                  ? 'text-white font-semibold underline underline-offset-8 decoration-[#F97316] decoration-2'
                  : ''
              }`}
            >
              Пульт дилера
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('live')}
              className={`rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'live' ? 'btn-glass text-white' : 'btn-crimson'
              }`}
            >
              Live-Таймер (ТВ)
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Strip */}
      <div className="relative z-30 flex md:hidden items-center justify-around border-b border-white/10 bg-[#060608]/90 px-4 py-2.5 text-xs font-medium text-slate-400 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('home')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'home' ? 'text-[#F97316] font-bold' : ''}`}
        >
          Клуб и правила
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'leaderboard' ? 'text-[#F97316] font-bold' : ''}`}
        >
          Рейтинг
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`whitespace-nowrap shrink-0 ${activeTab === 'admin' ? 'text-[#F97316] font-bold' : ''}`}
        >
          Пульт дилера
        </button>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto w-full max-w-[1360px] flex-1 px-4 pt-8 sm:px-6 lg:px-8">
        {error && (
          <div className="glass-panel mb-6 flex items-center justify-between rounded-2xl border border-[#F97316]/40 px-5 py-4 text-xs text-white">
            <span>{error}</span>
            <button
              onClick={() => refreshAll()}
              className="btn-glass rounded-lg px-3.5 py-1.5 font-medium cursor-pointer"
            >
              Обновить
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 py-8">
            <div className="glass-panel h-64 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="glass-panel h-44 animate-pulse rounded-2xl" />
              <div className="glass-panel h-44 animate-pulse rounded-2xl" />
              <div className="glass-panel h-44 animate-pulse rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}
            {activeTab === 'leaderboard' && <LeaderboardView />}
            {activeTab === 'live' && (
              <LiveTimerView onOpenAdmin={() => setActiveTab('admin')} />
            )}
            {activeTab === 'admin' && <AdminView />}
          </>
        )}
      </main>

      {/* Clean Footer with Club Logo & Mandatory Legal Notice */}
      <footer className="relative z-10 mt-12 border-t border-white/10 bg-[#060608]/90 py-6 text-xs text-slate-400 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={CLUB_LOGO_PATH}
              alt="Логотип клуба Чек это проигрыш"
              className="h-9 w-9 rounded-full border border-white/15 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="font-display font-bold text-white">
              Покерный клуб «Чек это проигрыш» · Техасский Холдем
            </div>
          </div>
          <p className="text-slate-400">
            Исключительно спортивно-интеллектуальный формат. Игры на реальные деньги строго запрещены (УК РФ).
          </p>
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
