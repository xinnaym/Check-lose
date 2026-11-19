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
import { AuthModal } from './components/AuthModal.tsx';
import { Lock, Tv, Trophy, ShieldAlert, Spade, User, LogOut } from 'lucide-react';

export type NavTab = 'home' | 'leaderboard' | 'live' | 'admin';

export const CLUB_LOGO_PATH = `${import.meta.env.BASE_URL}assets/aistudio/IMG_1509_1a4ff1a5.png`;

const ClubLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const {
    loading,
    error,
    refreshAll,
    currentUser,
    isDealerAuthorized,
    openAuthModal,
    logoutUser,
  } = useClub();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060608] text-[#F8FAFC] selection:bg-[#F97316] selection:text-black">
      {/* Ambient Lighting Matched to Club Logo (Obsidian + Vibrant Orange + Silver) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-44 left-1/4 h-[420px] w-[480px] sm:h-[520px] sm:w-[620px] rounded-full opacity-25 blur-[140px]"
          style={{
            background:
              'radial-gradient(circle, rgba(249, 115, 22, 0.55) 0%, rgba(234, 88, 12, 0.05) 70%, transparent 100%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-40 h-[420px] w-[420px] sm:h-[540px] sm:w-[540px] rounded-full opacity-15 blur-[150px]"
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.35) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute -bottom-48 -left-24 h-[400px] w-[450px] sm:h-[500px] sm:w-[580px] rounded-full opacity-20 blur-[140px]"
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#060608]/85 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-2.5 px-3.5 py-3 sm:gap-6 sm:px-6 lg:px-8">
          {/* Zone 1: Brand with Attached Club Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 sm:gap-3 text-left whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <img
              src={CLUB_LOGO_PATH}
              alt="Покерный клуб Чек это проигрыш"
              className="h-9 w-9 sm:h-11 sm:w-11 rounded-full border border-[#F97316]/50 object-cover shadow-md transition-transform group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <span className="font-display text-sm sm:text-lg font-extrabold tracking-tight text-white">
              Чек это{' '}
              <span className="rounded-md bg-[#F97316] px-1.5 py-0.5 text-[#060608]">
                проигрыш
              </span>
            </span>
          </button>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('home')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-white ${
                activeTab === 'home'
                  ? 'text-white font-semibold underline underline-offset-8 decoration-[#F97316] decoration-2'
                  : ''
              }`}
            >
              Клуб и столы
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
              className={`inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer hover:text-white ${
                activeTab === 'admin'
                  ? 'text-white font-semibold underline underline-offset-8 decoration-[#F97316] decoration-2'
                  : ''
              }`}
            >
              {!isDealerAuthorized && <Lock className="h-3.5 w-3.5 text-[#F97316]" />}
              <span>Пульт дилера</span>
            </button>
          </nav>

          {/* Zone 3: User Account & TV Timer Action */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="glass-well flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs">
                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                    currentUser.role === 'dealer'
                      ? 'bg-[#F97316] text-black'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {currentUser.role === 'dealer' ? 'ДИЛЕР' : 'ИГРОК'}
                </span>
                <span className="max-w-[110px] sm:max-w-[150px] truncate font-bold text-white">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <button
                  onClick={logoutUser}
                  title="Выйти из аккаунта"
                  className="text-slate-400 hover:text-white cursor-pointer pl-1"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="btn-glass inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                <User className="h-3.5 w-3.5 text-[#F97316]" />
                <span>Войти</span>
                <span className="hidden sm:inline">/ Регистрация</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('live')}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 sm:px-4 sm:py-2 text-xs font-extrabold whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'live' ? 'btn-glass text-white border-[#F97316]/50' : 'btn-crimson'
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Live-Таймер</span>
              <span className="xs:hidden">ТВ</span>
            </button>
          </div>
        </div>

        {/* Mobile Segmented Navigation Bar (< 768px) */}
        <div className="grid grid-cols-4 gap-1 border-t border-white/10 bg-[#060608]/95 px-2 py-1.5 md:hidden">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'glass-crimson text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Spade className="h-3.5 w-3.5 text-[#F97316]" />
            <span>Столы</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'glass-crimson text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-[#F97316]" />
            <span>Рейтинг</span>
          </button>
          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'live'
                ? 'glass-crimson text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="h-3.5 w-3.5 text-[#F97316]" />
            <span>ТВ-Таймер</span>
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'glass-crimson text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isDealerAuthorized ? (
              <ShieldAlert className="h-3.5 w-3.5 text-[#F97316]" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-[#F97316]" />
            )}
            <span>Пульт</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 mx-auto w-full max-w-[1360px] flex-1 px-3.5 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {error && (
          <div className="glass-panel mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#F97316]/40 px-4 py-3.5 text-xs text-white">
            <span>{error}</span>
            <button
              onClick={() => refreshAll()}
              className="btn-glass self-start sm:self-auto rounded-lg px-3.5 py-1.5 font-medium cursor-pointer"
            >
              Обновить
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6 py-6">
            <div className="glass-panel h-56 sm:h-64 animate-pulse rounded-3xl" />
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="glass-panel h-40 animate-pulse rounded-2xl" />
              <div className="glass-panel h-40 animate-pulse rounded-2xl" />
              <div className="glass-panel h-40 animate-pulse rounded-2xl" />
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

      {/* Account Login / Registration Modal */}
      <AuthModal />

      {/* Clean Footer with Club Logo */}
      <footer className="relative z-10 mt-10 border-t border-white/10 bg-[#060608]/90 py-6 text-xs text-slate-400 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] flex-col justify-between gap-4 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src={CLUB_LOGO_PATH}
              alt="Логотип клуба Чек это проигрыш"
              className="h-9 w-9 shrink-0 rounded-full border border-white/15 object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="font-display font-bold text-white">
              Покерный клуб «Чек это проигрыш» · Техасский Холдем
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Дружеский турнирный покер: играем на фишки и очки рейтинга, а не на деньги.
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
