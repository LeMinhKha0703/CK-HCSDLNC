import React, { useState } from 'react';
// 1. Import useNavigate
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  // Trạng thái để chuyển đổi giữa Login (true) và Register (false)
  const [isLogin, setIsLogin] = useState(true);
  // Trạng thái để ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // 2. Khởi tạo điều hướng
  const navigate = useNavigate();

  // 3. Hàm xử lý khi submit form login
  const handleLogin = (e) => {
    e.preventDefault();
    // Bạn có thể thêm logic kiểm tra đăng nhập ở đây
    navigate('/dashboard'); 
  };

  // Gradient màu xanh đặc trưng của thiết kế
  const signatureGradient = "bg-gradient-to-r from-[#003d9b] to-[#0052cc]";
  
  return (
    <main className="flex h-screen w-full font-body text-[#191c1d] bg-[#f8f9fa] overflow-hidden">
      {/* CỘT TRÁI: Hình ảnh minh họa (Ẩn trên mobile) */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#003d9b]">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Editorial Analytics" 
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

      {/* CỘT PHẢI: Form Đăng nhập / Đăng ký */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#f3f4f5]">
        <div className="w-full max-w-md space-y-8">
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center mb-8">
            <span className="font-headline font-black text-2xl tracking-tight text-[#003d9b]">Analytics System</span>
          </div>

          <div className="bg-white p-8 lg:p-10 rounded-xl shadow-sm border border-[#c3c6d6]/30">
            {/* Nút chuyển đổi Tab */}
            <div className="flex items-center p-1 bg-[#e7e8e9] rounded-lg mb-10">
              <button 
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2.5 text-sm rounded-md transition-all font-medium ${isLogin ? `${signatureGradient} text-white shadow-sm` : 'text-slate-600 hover:text-[#003d9b]'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2.5 text-sm rounded-md transition-all font-medium ${!isLogin ? `${signatureGradient} text-white shadow-sm` : 'text-slate-600 hover:text-[#003d9b]'}`}
              >
                Register
              </button>
            </div>

            {isLogin ? (
              /* FORM ĐĂNG NHẬP - Đã thêm onSubmit */
              <form onSubmit={handleLogin} className="space-y-6 animate-in" key="login-form">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">mail</span>
                    Email
                  </label>
                  <input 
                    type="email" 
                    className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20 transition-all"
                    placeholder="name@organization.edu"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className="w-full bg-[#e7e8e9] border-none rounded-lg pl-4 pr-10 py-3 focus:ring-2 focus:ring-[#003d9b]/20 transition-all"
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
                <button type="submit" className={`w-full ${signatureGradient} text-white font-headline font-bold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}>
                  Login
                </button>
                {/* Temporary teacher button */}
                <button
                  type="button"
                  onClick={() => navigate('/teacher')}
                  className="w-full mt-3 border border-[#003d9b] text-[#003d9b] font-headline font-bold py-4 rounded-lg shadow-sm hover:bg-[#003d9b]/10 transition-all"
                >
                  Teacher Preview
                </button>
              </form>
            ) : (
              /* FORM ĐĂNG KÝ */
              <form className="space-y-5 animate-in" key="register-form">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Full name</label>
                  <input type="text" className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#434654]">Email</label>
                  <input type="email" className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#003d9b]/20" placeholder="name@organization.edu" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#434654]">Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#434654] text-xs">Confirm Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#e7e8e9] border-none rounded-lg px-4 py-3" required />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-white border-[#c3c6d6]/30">
                  <input type="checkbox" id="teacher-role" className="rounded w-5 h-5 text-[#003d9b] focus:ring-[#003d9b] cursor-pointer" />
                  <label htmlFor="teacher-role" className="text-sm font-medium cursor-pointer text-[#434654]">I am a Teacher</label>
                </div>
                <button type="submit" className={`w-full ${signatureGradient} text-white font-headline font-bold py-4 rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all`}>
                  Register
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