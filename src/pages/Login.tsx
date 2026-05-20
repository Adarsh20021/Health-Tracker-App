import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { HeartPulse, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Both email address and password are required.');
      return;
    }

    setIsLogging(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login attempt failed. Check your credentials.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand identity */}
        <div className="flex justify-center flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mb-3 shadow-md">
            <HeartPulse className="h-7 w-7 text-white animate-pulse" />
          </div>
          <h2 className="text-center text-2xl font-sans font-extrabold text-slate-800 tracking-tight">
            Welcome to HealthSync
          </h2>
          <p className="mt-1 text-center text-xs font-sans text-slate-500">
            Sign in to track calories, sleep, steps, and hydration.
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="bg-white py-6 px-6 border border-slate-200 rounded-xl shadow-sm sm:px-8">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Fail banner */}
            {errorMsg && (
              <div
                id="login-error-banner"
                className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold font-sans"
              >
                {errorMsg}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLogging}
                  className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLogging}
                  className="block w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Trigger Button */}
            <div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLogging}
                className="w-full flex justify-center items-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-semibold text-sm rounded-lg transition-all shadow-md shadow-indigo-100 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed focus:outline-none"
              >
                {isLogging ? (
                  'Signing in...'
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1.5" />
                    <span>Sign in</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Registration link */}
          <div className="mt-5 border-t border-slate-100 pt-4 text-center">
            <span className="text-xs text-slate-500 font-sans">Don't have an account? </span>
            <Link
              to="/register"
              className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 font-sans"
            >
              <span>Register here</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
