import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, X, ShieldCheck, KeyRound, Lock, Eye, EyeOff, Sparkles } from 'lucide-react';
import { useAuth, AUTHORIZED_EMAIL } from '../../context/AuthContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = AUTHORIZED_EMAIL
}) => {
  const { requestGoogleEmailOTP, verifyOTPAndResetPassword, error: authError, clearError } = useAuth();
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState(defaultEmail || AUTHORIZED_EMAIL);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [demoDispatchedOtp, setDemoDispatchedOtp] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setEmail(AUTHORIZED_EMAIL);
      setStep('request');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setLocalError(null);
      setDemoDispatchedOtp(null);
      setSuccessMessage(null);
      clearError();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Step 1: Request 6-digit Google OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim()) {
      setLocalError('Please enter your authorized email address.');
      return;
    }

    if (email.trim().toLowerCase() !== AUTHORIZED_EMAIL.toLowerCase()) {
      setLocalError(`Access restricted: Only the authorized account (${AUTHORIZED_EMAIL}) can request OTP verification.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestGoogleEmailOTP(email);
      if (res.otp) {
        setDemoDispatchedOtp(res.otp);
      }
      setStep('verify');
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send Google verification OTP code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP and apply new password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!otp.trim() || otp.trim().length !== 6) {
      setLocalError('Please enter the valid 6-digit OTP code sent to your Google inbox.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('New passwords do not match. Please re-check.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOTPAndResetPassword(email, otp.trim(), newPassword);
      setSuccessMessage(res.message);
      setStep('success');
    } catch (err: any) {
      setLocalError(err.message || 'OTP verification failed. Please re-enter the code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLocalError(null);
    clearError();
    setStep('request');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 tracking-tight">
                  Google OTP Security Verification
                </h3>
                <p className="text-xs text-gray-500">
                  {step === 'request' && 'Send 6-digit code to authorized Gmail'}
                  {step === 'verify' && 'Enter OTP & set your new password'}
                  {step === 'success' && 'Password successfully updated'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {(localError || authError) && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 font-medium">
                  {localError || authError}
                </p>
              </div>
            )}

            {/* Step 1: Send OTP to Google Email */}
            {step === 'request' && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Authorized Google Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5">
                    A secure 6-digit one-time passcode (OTP) will be generated for <span className="font-semibold text-gray-600">{AUTHORIZED_EMAIL}</span>.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0071E3] transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Sending OTP...</span>
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Enter OTP & New Password */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                {/* Visual OTP Banner Notification */}
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Google OTP Code Dispatched</p>
                      <p className="text-[11px] text-emerald-700">
                        Check <span className="font-semibold">{AUTHORIZED_EMAIL}</span> inbox.
                      </p>
                      {demoDispatchedOtp && (
                        <p className="text-[11px] text-emerald-800 font-mono mt-1">
                          Security OTP Code: <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded font-bold tracking-widest text-emerald-950">{demoDispatchedOtp}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  {demoDispatchedOtp && (
                    <button
                      type="button"
                      onClick={() => setOtp(demoDispatchedOtp)}
                      className="px-2 py-1 text-[10px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
                    >
                      Autofill OTP
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter 6-Digit Google OTP Code
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 text-base tracking-widest font-mono font-bold bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Administrator Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#34C759] hover:bg-[#30D158] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Verifying...</span>
                    ) : (
                      <>
                        <span>Verify & Save</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Confirmation */}
            {step === 'success' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">Password Changed Successfully!</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {successMessage || 'You can now sign in to the Sujala Seed dashboard with your updated password.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#0071E3] transition-colors shadow-2xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

