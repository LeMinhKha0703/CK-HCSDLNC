// src/components/student/AuthForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { login as apiLogin, register as apiRegister } from '../../api/auth';
import axios from 'axios';

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [isTeacher, setIsTeacher] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const signatureGradient = 'bg-gradient-to-r from-[#003d9b] to-[#0052cc]';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await apiLogin({ email: loginEmail, password: loginPassword });
      const { access_token, role, fullName, userId } = res.data;
      login(access_token, { userId, fullName, role: role as 'Student' | 'Teacher' | 'Admin' });
      // Chuyển hướng theo role
      if (role === 'Teacher') navigate('/teacher/groupmanagement');
      else if (role === 'Admin') navigate('/admin/usermanagement');
      else navigate('/student/mygroups');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Incorrect email or password');
      } else {
        setError('Server connection error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await apiRegister({ fullName: regFullName, email: regEmail, password: regPassword, isTeacher });
      setIsLogin(true);
      setError('');
      setLoginEmail(regEmail);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail || 'Registration failed');
      } else {
        setError('Server connection error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full font-body text-[#191c1d] bg-[#f8f9fa] overflow-hidden">
      {/* CỘT TRÁI */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#003d9b]">
        <div className="absolute inset-0 z-0">
          <img
            alt="E-Learning Analytics"
            className="w-full h-full object-cover opacity-70"
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-end p-16 text-white w-full h-full bg-gradient-to-t from-[#003d9b]/90 to-transparent">
          <div className="mb-4">
            <span className="font-headline font-black text-3xl tracking-tight">E-LEARNING ANALYTICS</span>
          </div>
          <h1 className="font-headline text-5xl font-extrabold leading-tight mb-6">
            Transforming data into academic insight.
          </h1>
          <p className="text-xl text-[#c4d2ff] max-w-md font-light">
            Advanced e-learning analytics platform for modern educational institutions.
          </p>
        </div>
      </section>

      {/* CỘT PHẢI */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#f3f4f5]">
        <div className="w-full max-w-md space-y-8">
          <div className="bg-white p-8 lg:p-10 rounded-xl shadow-sm border border-[#c3c6d6]/30">
            {/* Tab Login/Register */}
            <div className="flex items-center p-1 bg-[#e7e8e9] rounded-lg mb-8">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`flex-1 py-2.5 text-sm rounded-md transition-all font-medium ${isLogin ? `${signatureGradient} text-white shadow-sm` : 'text-slate-600 hover:text-[#003d9b]'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`flex-1 py-2.5 text-sm rounded-md transition-all font-medium ${!isLogin ? `${signatureGradient} text-white shadow-sm` : 'text-slate-600 hover:text-[#003d9b]'}`}
              >
                Register
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            {isLogin ? (
              /* FORM ĐĂNG NHẬP */
              <form onSubmit={handleLogin} className="space-y-5" key="login-form">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20 transition-all outline-none"
                    placeholder="name@organization.edu"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full bg-[#e7e8e9] border-none rounded-lg pl-4 pr-10 py-3 focus:ring-2 focus:ring-[#003d9b]/20 transition-all outline-none"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#003d9b]"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${signatureGradient} text-white font-headline font-bold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60`}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            ) : (
              /* FORM ĐĂNG KÝ */
              <form onSubmit={handleRegister} className="space-y-4" key="register-form">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Full name</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20 outline-none"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20 outline-none"
                    placeholder="name@organization.edu"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#434654]">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#434654] text-xs">Confirm Password</label>
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={e => setRegConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-white border-[#c3c6d6]/30">
                  <input
                    type="checkbox"
                    id="teacher-role"
                    checked={isTeacher}
                    onChange={e => setIsTeacher(e.target.checked)}
                    className="rounded w-5 h-5 text-[#003d9b] cursor-pointer"
                  />
                  <label htmlFor="teacher-role" className="text-sm font-medium cursor-pointer text-[#434654]">
                    I am a Teacher
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full ${signatureGradient} text-white font-headline font-bold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60`}
                >
                  {isLoading ? 'Registering...' : 'Register'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default AuthForm;
