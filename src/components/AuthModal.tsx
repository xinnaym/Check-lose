import React, { useState, useEffect } from 'react';
import { useClub } from '../context/ClubContext.tsx';
import { CLUB_LOGO_PATH } from '../App.tsx';
import { UserRole } from '../types/poker.ts';
import { X, User, KeyRound, Mail, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    loginUser,
    registerUser,
  } = useClub();

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('player');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(authModalMode);
    setError(null);
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'login') {
        await loginUser(loginInput, passwordInput);
      } else {
        await registerUser({
          firstName,
          lastName,
          nickname,
          email: loginInput,
          password: passwordInput,
          role: selectedRole,
        });
      }
      closeAuthModal();
      setLoginInput('');
      setPasswordInput('');
      setFirstName('');
      setLastName('');
      setNickname('');
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
      <div className="glass-panel relative w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={closeAuthModal}
          className="btn-glass absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-slate-300 hover:text-white cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Club Header */}
        <div className="flex items-center gap-3.5">
          <img
            src={CLUB_LOGO_PATH}
            alt="Чек это проигрыш"
            className="h-12 w-12 shrink-0 rounded-full border border-[#F97316]/60 object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="text-xs font-bold text-[#F97316]">
              ЛИЧНЫЙ КАБИНЕТ КЛУБА
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
              {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация в клубе'}
            </h2>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="glass-well mt-5 flex items-center gap-1 rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'login' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
            }`}
          >
            Вход
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-extrabold transition-all cursor-pointer ${
              mode === 'register' ? 'btn-crimson' : 'text-slate-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Имя *
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Илья"
                      className="glass-well w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Лекалин"
                    className="glass-well w-full rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Покерный никнейм (необязательно)
                </label>
                <div className="relative">
                  <Sparkles className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Например: Shark_IL"
                    className="glass-well w-full rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  Тип учётной записи
                </label>
                <div className="glass-well flex items-center gap-1 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('player')}
                    className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedRole === 'player'
                        ? 'bg-white/15 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Игрок клуба
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('dealer')}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      selectedRole === 'dealer'
                        ? 'bg-[#F97316] text-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Дилер клуба</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Логин или Email *
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Ваш логин или email..."
                className="glass-well w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-300">
              Пароль *
            </label>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Минимум 4 символа..."
                className="glass-well w-full rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-[#F97316] focus:outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2.5 text-xs font-semibold text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="btn-crimson w-full rounded-xl py-3 text-sm font-extrabold disabled:opacity-40 cursor-pointer"
          >
            {busy
              ? 'Подождите...'
              : mode === 'login'
                ? 'Войти в аккаунт'
                : 'Создать аккаунт и войти'}
          </button>
        </form>
      </div>
    </div>
  );
};
