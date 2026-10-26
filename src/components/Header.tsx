import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Layers,
  Bell,
  Brain,
  RotateCcw,
  User as UserIcon,
  ChevronDown,
  Shield,
  Briefcase,
  Users,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  FileText,
  FileCheck2,
  LogOut,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { User, Notification, UserRole } from '../types/bank.ts';
import { bankEngine } from '../services/bankEngine.ts';

interface HeaderProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAIAdvisor: () => void;
  onOpenScanPay: () => void;
  onOpenViewBalance: () => void;
  onLogout: () => void;
  notifications: Notification[];
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAIAdvisor,
  onOpenScanPay,
  onOpenViewBalance,
  onLogout,
  notifications,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleRoleChange = (role: UserRole) => {
    bankEngine.switchRole(role);
    setShowRoleMenu(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Building2 },
    { id: 'account', label: 'My Account', icon: Wallet },
    { id: 'transaction', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'payment', label: 'Payments & Bills', icon: CreditCard },
    { id: 'loan', label: 'My Loans', icon: FileCheck2 },
    { id: 'reports', label: 'Statements', icon: FileText },
    { id: 'customer', label: 'My Profile', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Digital Banking Title */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onSelectTab('dashboard')}
          >
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20"
            >
              <Building2 className="w-6 h-6" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition">
                  Digital Banking
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider hidden sm:inline">
                  Core Bank
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Secure Digital Banking Portal
              </p>
            </div>
          </div>

          {/* User Logged In Greeting Banner (Requirement 5) */}
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80 text-xs font-semibold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {/* EXACT USER REQUEST FORMAT: Hi Account name logined */}
              <span>Hi {currentUser.name}, logged in</span>
              {currentUser.accountNo && (
                <span className="font-mono text-[11px] text-emerald-700 font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                  {currentUser.accountNo}
                </span>
              )}
            </motion.div>
          )}

          {/* Right Action Tools */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Scan & Pay Button (Requirement 15) */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenScanPay}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition shadow-2xs"
              title="Scan & Pay directly by entering account number"
            >
              <QrCode className="w-4 h-4 text-purple-600" />
              <span className="hidden md:inline">Scan & Pay</span>
            </motion.button>

            {/* View Balance Button (Requirement 15) */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenViewBalance}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition shadow-2xs"
              title="View account balance by entering account number"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">View Balance</span>
            </motion.button>

            {/* AI Advisor Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onOpenAIAdvisor}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-2xs"
              title="AI Financial & Risk Advisor (High Thinking)"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="hidden xl:inline">AI Advisor</span>
            </motion.button>

            {/* Notifications */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifs(!showNotifs)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifs}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-2 z-50"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        SMS & Email Notifications ({notifications.length})
                      </span>
                      <button
                        onClick={() => setShowNotifs(false)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Close
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No notifications.</p>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.notificationId}
                            onClick={() => bankEngine.markNotificationRead(n.notificationId)}
                            className={`p-2.5 rounded-xl text-xs transition cursor-pointer border ${
                              n.read
                                ? 'bg-slate-50/70 border-slate-100 text-slate-600'
                                : 'bg-blue-50/60 border-blue-200 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-mono font-semibold">
                                {n.channel}
                              </span>
                              <span className="text-[10px] text-slate-400">{n.sentDate}</span>
                            </div>
                            <p>{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Persona Switcher & Logout */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition shadow-2xs"
                aria-label="Switch Persona"
              >
                <UserIcon className="w-4 h-4 text-blue-600" />
                <span className="max-w-[100px] truncate">{currentUser?.name || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </motion.button>

              <AnimatePresence>
                {showRoleMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 space-y-1 z-50"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      Switch User Account
                    </div>
                    {[
                      { role: 'Customer' as const, name: 'Riyas', desc: 'Customer • ACC1001' },
                      { role: 'Bank Employee' as const, name: 'Abhinesh', desc: 'Accounts & KYC Staff' },
                      { role: 'Bank Officer' as const, name: 'Muhammad Sharukh', desc: 'Loan Review' },
                      { role: 'Administrator' as const, name: 'Suriya', desc: 'Bank Manager / Admin' },
                    ].map((p) => (
                      <button
                        key={p.role}
                        onClick={() => handleRoleChange(p.role)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition flex flex-col space-y-0.5 ${
                          currentUser?.role === p.role
                            ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{p.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {p.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">{p.desc}</span>
                      </button>
                    ))}

                    <div className="pt-2 border-t border-slate-100 space-y-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left p-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition flex items-center space-x-1.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
