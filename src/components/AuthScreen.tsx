import React, { useState } from 'react';
import { User, Lock, Sparkles, BookOpen, KeyRound, LogIn, UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserAccount, UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (account: UserAccount) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('중학교 2학년');
  const [targetGoal, setTargetGoal] = useState('중간고사 전과목 A등급 달성!');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    // Check existing stored accounts
    const existingAccountsRaw = localStorage.getItem('sp_accounts');
    const accounts: UserAccount[] = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];

    const found = accounts.find((a) => a.username === username.trim() && a.passwordHash === password.trim());

    if (found) {
      onLoginSuccess(found);
    } else {
      // If no account exists yet, auto-create a user account with this username for demo smoothness
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        username: username.trim(),
        passwordHash: password.trim(),
        name: username.split('@')[0] || '학생',
        grade: '중학교 2학년',
        targetGoal: '중간고사 전과목 A등급 도전!',
        avatarIcon: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7S_7fWWOL2qz-pY_yGELajA-5VO-S1m5SCSIGI8vFjpRoxtE3aprrrWzkBtn9ggu5y9PBeQ2gkQMts7G0tJW1YVm-lGQHspu8p_J6qQz0lc_szUNbE9BhtYg-beXhE-UDJwnLle7wk5NGK43ODVFEjihGpEO7dyKkTtvt5Lonl0ofqifHMKmfPNH9DCW8qXBh9WHk69pMoZ0PXnrEMaKh6V6WwmRh6-LQxCdxq3UKMof17DXi05iQ",
        createdAt: new Date().toISOString(),
      };
      accounts.push(newAcc);
      localStorage.setItem('sp_accounts', JSON.stringify(accounts));
      onLoginSuccess(newAcc);
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim() || !name.trim()) {
      setErrorMsg('필수 정보를 모두 입력해 주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    const existingAccountsRaw = localStorage.getItem('sp_accounts');
    const accounts: UserAccount[] = existingAccountsRaw ? JSON.parse(existingAccountsRaw) : [];

    if (accounts.some((a) => a.username === username.trim())) {
      setErrorMsg('이미 존재하는 아이디입니다. 다른 아이디를 사용해 주세요.');
      return;
    }

    const newAcc: UserAccount = {
      id: `user-${Date.now()}`,
      username: username.trim(),
      passwordHash: password.trim(),
      name: name.trim(),
      grade: grade.trim(),
      targetGoal: targetGoal.trim(),
      avatarIcon: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7S_7fWWOL2qz-pY_yGELajA-5VO-S1m5SCSIGI8vFjpRoxtE3aprrrWzkBtn9ggu5y9PBeQ2gkQMts7G0tJW1YVm-lGQHspu8p_J6qQz0lc_szUNbE9BhtYg-beXhE-UDJwnLle7wk5NGK43ODVFEjihGpEO7dyKkTtvt5Lonl0ofqifHMKmfPNH9DCW8qXBh9WHk69pMoZ0PXnrEMaKh6V6WwmRh6-LQxCdxq3UKMof17DXi05iQ",
      createdAt: new Date().toISOString(),
    };

    accounts.push(newAcc);
    localStorage.setItem('sp_accounts', JSON.stringify(accounts));
    onLoginSuccess(newAcc);
  };

  // Demo Login Preset
  const handleDemoLogin = () => {
    const demoAcc: UserAccount = {
      id: 'demo-user-minsu',
      username: 'minsu@study.kr',
      passwordHash: 'demo1234',
      name: '민수',
      grade: '중학교 2학년',
      targetGoal: '중간고사 전과목 A등급 도전! 🔥',
      avatarIcon: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7S_7fWWOL2qz-pY_yGELajA-5VO-S1m5SCSIGI8vFjpRoxtE3aprrrWzkBtn9ggu5y9PBeQ2gkQMts7G0tJW1YVm-lGQHspu8p_J6qQz0lc_szUNbE9BhtYg-beXhE-UDJwnLle7wk5NGK43ODVFEjihGpEO7dyKkTtvt5Lonl0ofqifHMKmfPNH9DCW8qXBh9WHk69pMoZ0PXnrEMaKh6V6WwmRh6-LQxCdxq3UKMof17DXi05iQ",
      createdAt: new Date().toISOString(),
    };
    onLoginSuccess(demoAcc);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-sky-100 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-3xl text-white shadow-lg shadow-sky-500/20">
            🏃‍♂️
          </div>
          <h1 className="text-2xl font-black text-sky-950 tracking-tight">Study Pacemaker</h1>
          <p className="text-xs text-sky-600 font-semibold">
            중학생 맞춤형 1:1 몰입 타임라인 페이스메이커
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => { setIsRegisterMode(false); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              !isRegisterMode ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            자체 로그인
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterMode(true); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all ${
              isRegisterMode ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            새 회원가입
          </button>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold p-3 rounded-2xl text-center">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Login Form */}
        {!isRegisterMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">아이디 또는 이메일</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="예: minsu123"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1.5 block">비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <LogIn className="w-4 h-4" />
              로그인하기
            </button>
          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">아이디 / 이메일 *</label>
              <input
                type="text"
                placeholder="사용할 아이디 입력"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">비밀번호 *</label>
                <input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">비밀번호 확인 *</label>
                <input
                  type="password"
                  placeholder="확인"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 mb-1 block">이름 / 닉네임 *</label>
              <input
                type="text"
                placeholder="예: 민수"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">학년</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="중학교 1학년">중학교 1학년</option>
                  <option value="중학교 2학년">중학교 2학년</option>
                  <option value="중학교 3학년">중학교 3학년</option>
                  <option value="초등학교 6학년">초등학교 6학년</option>
                  <option value="고등학교 1학년">고등학교 1학년</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">목표 등급</label>
                <input
                  type="text"
                  placeholder="목표 (예: A등급)"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-98 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              가입하고 공부 시작하기
            </button>
          </form>
        )}

        {/* Fast Demo Account Entry */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            체험 계정으로 빠른 시작 (민수 학생)
          </button>
        </div>

        <div className="text-[11px] text-slate-400 text-center leading-relaxed font-medium">
          🔒 외부 구글 로그인 없이 안전하게 자체 가입 및 로컬 세션 저장이 지원됩니다.
        </div>
      </div>
    </div>
  );
};
