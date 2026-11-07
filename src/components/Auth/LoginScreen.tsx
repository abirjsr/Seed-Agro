import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sprout, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth, AUTHORIZED_EMAIL, DEFAULT_MASTER_PASS } from '../../context/AuthContext';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const LoginScreen: React.FC = () => {
  const { 
    signInWithPassword, 
    error: authError, 
    clearError 
  } = useAuth();

  const [email, setEmail] = useState(AUTHORIZED_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter the authorized administrator email.');
      return;
    }
    if (email.trim().toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
      setLocalError(`Access restricted: Only ${AUTHORIZED_EMAIL} is authorized to access this dashboard.`);
      return;
    }
    if (!password) {
      setLocalError('Please enter your administrator password.');
      return;
    }

    setLoading(true);
    try {
      await signInWithPassword(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillDefault = () => {
    setEmail(AUTHORIZED_EMAIL);
    setPassword(DEFAULT_MASTER_PASS);
    setLocalError(null);
    clearError();
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] flex flex-col justify-between selection:bg-[#007AFF]/20 text-[#1C1C1E] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#34C759] to-[#30D158] flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[#1C1C1E] flex items-center gap-2">
              <span>Sujala Seeds Enterprise CRM</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                PostgreSQL Live
              </span>
            </h1>
            <p className="text-xs text-gray-500 font-medium">Authorized Seed Management & Billing Portal</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-[#34C759]" />
          <span>Restricted Single-Tenant Access</span>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-6 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl shadow-black/5 border border-black/[0.08] p-6 sm:p-8"
        >
          {/* Headline */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authorized Account: Sujalaseed@gmail.com</span>
            </div>
            <h2 className="text-2xl font-extrabold text-[#1C1C1E] tracking-tight">
              Administrator Login
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Enter your master password to access the Sujala Seed dashboard
            </p>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {(localError || authError) && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">
                  {localError || authError}
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Authorized Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Master Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-[#007AFF] hover:underline font-semibold cursor-pointer"
                >
                  Forgot Password? (Google OTP)
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071E3] text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper */}
          <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <button
              type="button"
              onClick={handleAutoFillDefault}
              className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Autofill Master Pass</span>
            </button>
            <button
              type="button"
              onClick={() => setIsForgotModalOpen(true)}
              className="text-[#007AFF] font-medium hover:underline cursor-pointer"
            >
              OTP Verification
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer Attributions */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
          <span>Created by</span>
          <span className="font-semibold text-gray-800">Abir Das</span>
          <span>by</span>
          <a 
            href="https://animesoft.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#007AFF] hover:underline font-semibold"
          >
            animesoft.com
          </a>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://www.facebook.com/profile.php?id=100087771241931"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-all"
          >
            <span>Facebook</span>
          </a>
          <a
            href="https://www.instagram.com/anemosoft?fbclid=IwY2xjawT-muJwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMWZvVUVMN0lOQ051eEo2WHlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeGF4v2QLluqE3gDmLjTq1caN-APyroH8uWCmn5OgwNIEzrwvMbYpgqpUsa58_aem_KMBcjCDK-Fk76FBxL2V5vQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 font-medium transition-all"
          >
            <span>Instagram</span>
          </a>
        </div>
      </footer>

      {/* Forgot Password / Google OTP Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        defaultEmail={AUTHORIZED_EMAIL}
      />
    </div>
  );
};


