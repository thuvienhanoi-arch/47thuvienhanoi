import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthProps {
  onLogin: (token: string) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/dang-nhap' : '/api/auth/dang-ky';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(isLogin ? 'Sai tài khoản hoặc mật khẩu' : 'Đăng ký thất bại');
      }

      const data = await res.json();
      if (isLogin) {
        onLogin(data.token);
      } else {
        setIsLogin(true);
        alert('Đăng ký thành công! Hãy đăng nhập.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--border-main)] rounded-3xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-2">AI Podcast</h1>
          <p className="text-[var(--text-muted)]">{isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] opacity-50" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[var(--glass-bg)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)] opacity-50" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[var(--glass-bg)] border border-[var(--border-main)] rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? 'Đăng nhập' : 'Đăng ký'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-sm"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
