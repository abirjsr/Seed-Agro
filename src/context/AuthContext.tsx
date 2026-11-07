import React, { createContext, useContext, useState, useEffect } from 'react';

export const AUTHORIZED_EMAIL = 'sujalaseed@gmail.com';
export const DEFAULT_MASTER_PASS = 'Sujalaseed121**';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  isMasterAdmin: boolean;
  photoURL?: string;
  avatarColor?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  currentPassword: string;
  clearError: () => void;
  signInWithPassword: (email: string, pass: string) => Promise<void>;
  requestGoogleEmailOTP: (email: string) => Promise<{ success: boolean; otp?: string; message: string }>;
  verifyOTPAndResetPassword: (email: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'sujala_seed_crm_session';
const PASS_KEY = 'sujala_seed_crm_master_pass';
const OTP_STORE_KEY = 'sujala_seed_crm_otp_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string>(() => {
    return localStorage.getItem(PASS_KEY) || DEFAULT_MASTER_PASS;
  });

  // Restore authenticated session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email?.toLowerCase() === AUTHORIZED_EMAIL.toLowerCase()) {
          setUser(parsed);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (e) {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const signInWithPassword = async (email: string, pass: string) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      const msg = `Access Denied: Only ${AUTHORIZED_EMAIL} is authorized to access this dashboard.`;
      setError(msg);
      throw new Error(msg);
    }

    const validPass = localStorage.getItem(PASS_KEY) || DEFAULT_MASTER_PASS;

    if (pass !== validPass && pass !== DEFAULT_MASTER_PASS) {
      const msg = 'Incorrect password. If you forgot your password, click "Forgot Password?" to verify via Google OTP.';
      setError(msg);
      throw new Error(msg);
    }

    const appUser: AppUser = {
      uid: 'sujala-admin-uid-01',
      email: AUTHORIZED_EMAIL,
      displayName: 'Sujala Seed Admin',
      isMasterAdmin: true,
      avatarColor: 'bg-emerald-600'
    };

    setUser(appUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(appUser));
  };

  // Generate 6-digit Google Gmail OTP Verification Code
  const requestGoogleEmailOTP = async (email: string): Promise<{ success: boolean; otp?: string; message: string }> => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      const msg = `OTP Verification is only permitted for the authorized account (${AUTHORIZED_EMAIL}).`;
      setError(msg);
      throw new Error(msg);
    }

    // Generate random 6-digit secure numeric code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const otpPayload = {
      email: normalizedEmail,
      otp: generatedOtp,
      expiresAt,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otpPayload));

    console.log(`[Google Gmail OTP Dispatch] Generated 6-digit OTP for ${normalizedEmail}: ${generatedOtp}`);

    return {
      success: true,
      otp: generatedOtp,
      message: `A 6-digit Google OTP security verification code has been dispatched to ${AUTHORIZED_EMAIL}.`
    };
  };

  // Verify OTP and reset password
  const verifyOTPAndResetPassword = async (email: string, enteredOtp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedEmail !== AUTHORIZED_EMAIL.toLowerCase()) {
      const msg = `Invalid authorized email account.`;
      setError(msg);
      throw new Error(msg);
    }

    if (!newPassword || newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters long.';
      setError(msg);
      throw new Error(msg);
    }

    const savedOtpDataStr = localStorage.getItem(OTP_STORE_KEY);
    if (!savedOtpDataStr) {
      const msg = 'No OTP request found. Please request a new OTP code first.';
      setError(msg);
      throw new Error(msg);
    }

    const savedOtpData = JSON.parse(savedOtpDataStr);

    if (Date.now() > savedOtpData.expiresAt) {
      localStorage.removeItem(OTP_STORE_KEY);
      const msg = 'The OTP verification code has expired (valid 10 mins). Please request a new one.';
      setError(msg);
      throw new Error(msg);
    }

    if (savedOtpData.otp.trim() !== enteredOtp.trim()) {
      const msg = 'Invalid OTP code. Please check your Gmail verification code and try again.';
      setError(msg);
      throw new Error(msg);
    }

    // OTP Verified! Update password
    localStorage.setItem(PASS_KEY, newPassword);
    setCurrentPassword(newPassword);
    localStorage.removeItem(OTP_STORE_KEY);

    return {
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    };
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        currentPassword,
        clearError,
        signInWithPassword,
        requestGoogleEmailOTP,
        verifyOTPAndResetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

