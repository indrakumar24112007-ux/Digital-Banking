import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  Smartphone,
  Mail,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  KeyRound,
  CheckCircle2,
  CreditCard,
  User,
} from 'lucide-react';
import { bankEngine } from '../services/bankEngine.ts';
import { AccountType } from '../types/bank.ts';
import { Rupee } from './Rupee.tsx';

interface LoginPageProps {
  onLoginSuccess: (accountName: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginAccountNo, setLoginAccountNo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Account Not Found Popup state
  const [showNotFoundPopup, setShowNotFoundPopup] = useState(false);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'enterAccount' | 'enterOTP'>('enterAccount');
  const [forgotAccountNo, setForgotAccountNo] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [generatedOTPInfo, setGeneratedOTPInfo] = useState<{ otp: string; maskedPhone: string } | null>(null);
  const [showOtpToast, setShowOtpToast] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Register form state (Points 8-14)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAccountType, setRegAccountType] = useState<AccountType>('Savings');
  const [regAccountNo, setRegAccountNo] = useState(() => `ACC${1000 + bankEngine.getState().accounts.length + 1}`);
  const [regError, setRegError] = useState<string | null>(null);

  const handleAutofillOTP = () => {
    if (generatedOTPInfo?.otp) {
      setOtpCode(generatedOTPInfo.otp);
      setForgotSuccess('OTP autofilled from SMS alert!');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginAccountNo.trim()) {
      setLoginError('Please enter your Account Number.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your Password.');
      return;
    }

    const res = bankEngine.loginWithAccountAndPassword(loginAccountNo, loginPassword);

    if (res.success && res.user) {
      onLoginSuccess(res.user.name);
    } else if (res.notFound) {
      setShowNotFoundPopup(true);
    } else {
      setLoginError(res.error || 'Failed to sign in. Please verify your password.');
    }
  };

  const handleQuickDemoLogin = (acc: (typeof quickDemoAccounts)[0], directLogin = false) => {
    setLoginAccountNo(acc.accountNo);
    setLoginPassword(acc.pass);
    setLoginError(null);

    if (directLogin) {
      const res = bankEngine.loginWithAccountAndPassword(acc.accountNo, acc.pass);
      if (res.success && res.user) {
        onLoginSuccess(res.user.name);
      } else if (res.notFound) {
        setShowNotFoundPopup(true);
      } else {
        setLoginError(res.error || 'Failed to sign in.');
      }
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (!forgotAccountNo.trim()) {
      setForgotError('Please enter your Account Number or mobile number.');
      return;
    }

    const res = bankEngine.sendForgotPasswordOTP(forgotAccountNo);
    if (res.success && res.otp && res.maskedPhone) {
      setGeneratedOTPInfo({ otp: res.otp, maskedPhone: res.maskedPhone });
      setForgotStep('enterOTP');
      setOtpCode(''); // User can click Auto-Fill from the animated toast or modal
      setShowOtpToast(true);
      setForgotSuccess(`OTP has been sent to registered mobile number ${res.maskedPhone}`);
    } else if (res.notFound) {
      setShowForgotModal(false);
      setShowNotFoundPopup(true);
    } else {
      setForgotError(res.error || 'Account not found.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!otpCode.trim()) {
      setForgotError('Please enter the 6-digit OTP.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }

    const res = bankEngine.verifyOTPAndResetPassword(forgotAccountNo, otpCode, newPassword);
    if (res.success) {
      setForgotSuccess('Password reset successfully! You can now log in with your new password.');
      setLoginPassword(newPassword);
      setLoginAccountNo(forgotAccountNo);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep('enterAccount');
        setForgotSuccess(null);
      }, 1500);
    } else {
      setForgotError(res.error || 'Failed to reset password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword || !regAccountNo.trim()) {
      setRegError('All fields are mandatory. Please fill in all required details.');
      return;
    }

    const res = bankEngine.registerAccountWithDetails({
      accountName: regName,
      email: regEmail,
      phone: regPhone,
      password: regPassword,
      accountType: regAccountType,
      accountNo: regAccountNo,
    });

    if (res.success && res.user) {
      onLoginSuccess(res.user.name);
    } else {
      setRegError(res.error || 'Failed to register account.');
    }
  };

  const quickDemoAccounts = [
    { name: 'Riyas', accountNo: 'ACC1001', role: 'Customer', pass: 'password123' },
    { name: 'Abhinesh', accountNo: 'ACC1002', role: 'Bank Employee', pass: 'password123' },
    { name: 'Sharukh', accountNo: 'ACC1003', role: 'Bank Officer', pass: 'password123' },
    { name: 'Suriya', accountNo: 'ACC1004', role: 'Administrator', pass: 'password123' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Digital Banking
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                  256-bit Secure
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Core Banking Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Protected by ISO 27001</span>
              <span className="sm:hidden">Secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login / Register Card Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-xl">
          {/* Card Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-10 relative overflow-hidden"
          >
            {/* Ambient subtle glow at top right */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/50 via-indigo-50/20 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

            {/* Title & Tabs */}
            <div className="relative z-10 space-y-3 mb-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                <span>Authorized User Access</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {activeTab === 'login' ? 'Sign in to your account' : 'Open a new bank account'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {activeTab === 'login'
                  ? 'Access secure transactions, instant transfers, deposits, and loan management.'
                  : 'Register your account to receive a welcome deposit between ₹1,000 and ₹1,00,000.'}
              </p>

              {/* Tabs Switcher */}
              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl mt-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError(null);
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setRegError(null);
                  }}
                  className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Register New Account
                </motion.button>
              </div>
            </div>

            {/* TAB 1: LOGIN FORM */}
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  {loginError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Account Number
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. ACC1001"
                        value={loginAccountNo}
                        onChange={(e) => setLoginAccountNo(e.target.value.toUpperCase())}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>
                  </div>

                  {/* Password with hide/show UI toggle (hidden by default) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">Password</label>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter your account password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 p-1 rounded text-slate-400 hover:text-slate-600 transition"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Forgot Password Link Button below Password */}
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotAccountNo(loginAccountNo || 'ACC1001');
                          setShowForgotModal(true);
                          setForgotStep('enterAccount');
                          setForgotError(null);
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex items-center space-x-1"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Forgot password? Send OTP to mobile</span>
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/25 transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <span>Sign In to Digital Banking</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>

                  {/* Register prompt */}
                  <div className="pt-2 text-center text-xs text-slate-500">
                    New user without an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setRegError(null);
                      }}
                      className="font-bold text-blue-600 hover:underline"
                    >
                      Register an Account now
                    </button>
                  </div>

                  {/* One-Click Quick Test Accounts */}
                  <div className="border-t border-slate-100 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Quick Demo Accounts:
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Click to auto-fill or sign in</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {quickDemoAccounts.map((acc) => (
                        <motion.div
                          key={acc.accountNo}
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={() => handleQuickDemoLogin(acc, false)}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/90 hover:border-blue-300 text-left text-xs transition space-y-1.5 cursor-pointer group relative"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 group-hover:text-blue-700 transition">
                              {acc.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono border border-slate-200">
                              {acc.accountNo}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>{acc.role}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickDemoLogin(acc, true);
                              }}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 group-hover:underline"
                            >
                              <span>Sign in</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.form>
              ) : (
                /* TAB 2: REGISTER ACCOUNT FORM (Requirements 8-14) */
                <motion.form
                  key="register-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleRegister}
                  className="space-y-4 text-xs"
                >
                  {regError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* 9. Account Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">9. Account Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Anand Sharma"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* 10. Email Address */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">10. Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="anand.sharma@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* 11. Phone Number */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">11. Phone Number (Mobile) *</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Used for sending OTP and transaction alerts.
                    </span>
                  </div>

                  {/* 12. Password */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">12. Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        placeholder="Create secure password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* 13. Account Type & 14. Account Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">13. Account Type *</label>
                      <select
                        value={regAccountType}
                        onChange={(e) => setRegAccountType(e.target.value as AccountType)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      >
                        <option value="Savings">Savings Account (4.0% interest)</option>
                        <option value="Current">Current Account (₹50k Overdraft)</option>
                        <option value="Fixed">Fixed Deposit (7.2% interest)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">14. Account Number *</label>
                      <input
                        type="text"
                        required
                        value={regAccountNo}
                        onChange={(e) => setRegAccountNo(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Random Balance Notice (Point 6) */}
                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Welcome Balance Promotion:</span>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        Your account will automatically be funded with a random initial deposit between{' '}
                        <strong>₹1,000</strong> and <strong>₹1,00,000</strong> upon successful registration.
                      </p>
                    </div>
                  </div>

                  {/* Register Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-500/25 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Register & Create Account</span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        Digital Banking • Encrypted Core Banking System • ISO 20022 Compliant
      </footer>

      {/* POPUP: ACCOUNT NOT FOUND MODAL (Requirement 4) */}
      <AnimatePresence>
        {showNotFoundPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">Account Not Found</h3>
                {/* EXACT REQUIRED TEXT FROM USER PROMPT: */}
                <p className="text-sm text-slate-600 mt-2 font-medium bg-rose-50/70 p-3 rounded-xl border border-rose-100">
                  account not found kindly make sure You have register before login
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowNotFoundPopup(false);
                    setActiveTab('register');
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Register Account Now
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowNotFoundPopup(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FORGOT PASSWORD MODAL WITH MOBILE OTP (Requirement 3) */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Forgot Password</h3>
                    <p className="text-xs text-slate-400">Mobile OTP Verification</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {forgotError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {forgotError}
                </div>
              )}

              {forgotSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
                  {forgotSuccess}
                </div>
              )}

              {forgotStep === 'enterAccount' ? (
                <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Enter Registered Account Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ACC1001"
                      value={forgotAccountNo}
                      onChange={(e) => setForgotAccountNo(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      We will dispatch a 6-digit OTP to the registered mobile number on file.
                    </span>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center justify-center space-x-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Send OTP to Registered Mobile</span>
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-blue-900">
                    <p className="font-semibold text-xs">
                      OTP dispatched to: <span className="font-mono font-bold">{generatedOTPInfo?.maskedPhone}</span>
                    </p>
                    <p className="text-[11px] text-blue-700 mt-0.5">
                      Demo OTP Code: <strong className="font-mono text-blue-900 font-bold">{generatedOTPInfo?.otp}</strong> (Logged in SMS Notification)
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit OTP *</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="e.g. 482910"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono tracking-widest text-center text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        type="button"
                        onClick={handleAutofillOTP}
                        className="px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center space-x-1 shrink-0"
                        title="Auto-fill OTP from dispatched SMS"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Auto-Fill</span>
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Enter New Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimum 4 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                  >
                    Verify OTP & Reset Password
                  </motion.button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ANIMATED MOBILE SMS OTP NOTIFICATION TOAST (Requirement 3 + Clarifications) */}
      <AnimatePresence>
        {showOtpToast && generatedOTPInfo && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            className="fixed top-5 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Messages • Digital Banking
                  </span>
                  <p className="text-[10px] text-slate-400">Just now • Carrier SMS</p>
                </div>
              </div>
              <button
                onClick={() => setShowOtpToast(false)}
                className="text-slate-400 hover:text-white p-1 rounded transition"
                aria-label="Dismiss SMS alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs">
              <p className="text-slate-200 leading-relaxed">
                Dear Customer, your OTP for Digital Banking password reset is{' '}
                <strong className="text-emerald-400 font-mono text-sm tracking-wider font-bold">
                  {generatedOTPInfo.otp}
                </strong>
                . Valid for 10 minutes.
              </p>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-400">
                To mobile: <strong className="text-slate-200">{generatedOTPInfo.maskedPhone}</strong>
              </span>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => {
                  handleAutofillOTP();
                  setShowOtpToast(false);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Auto-Fill OTP</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
