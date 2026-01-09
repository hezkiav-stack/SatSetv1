
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { GraduationCap, Loader2, Lock, Mail, CheckCircle } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Menampilkan pesan sukses di UI, bukan alert
        setSuccessMsg('Registrasi berhasil! Silakan cek email Anda untuk verifikasi, lalu login.');
        setIsLogin(true); // Otomatis pindah ke halaman login
      }
    } catch (error: any) {
      // Menampilkan pesan error dari Supabase, misal "User already registered"
      setErrorMsg(error.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 p-4 rounded-full">
              <GraduationCap size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Smart Study</h1>
          <p className="text-blue-100 mt-2">Login untuk menyimpan tugasmu di cloud.</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 animate-in fade-in">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-200 flex items-start gap-2 animate-in fade-in">
                <CheckCircle size={18} className="mt-0.5 text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/10 transition flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : (isLogin ? 'Masuk' : 'Daftar Akun')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={toggleAuthMode}
              className="text-blue-600 font-bold hover:underline"
            >
              {isLogin ? 'Daftar Sekarang' : 'Login Disini'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
