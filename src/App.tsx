import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { bankEngine } from './services/bankEngine.ts';
import { Receipt } from './types/bank.ts';
import { Header } from './components/Header.tsx';
import { LoginPage } from './components/LoginPage.tsx';
import { AccountActionModal } from './components/AccountActionModal.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';
import { AIAdvisorModal } from './components/AIAdvisorModal.tsx';

// Views
import { DashboardView } from './components/views/DashboardView.tsx';
import { CustomerManagementView } from './components/views/CustomerManagementView.tsx';
import { AccountManagementView } from './components/views/AccountManagementView.tsx';
import { TransactionView } from './components/views/TransactionView.tsx';
import { PaymentView } from './components/views/PaymentView.tsx';
import { LoanManagementView } from './components/views/LoanManagementView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';

export default function App() {
  const [engineState, setEngineState] = useState(() => bankEngine.getState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [accountActionType, setAccountActionType] = useState<'scanPay' | 'viewBalance' | null>(null);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = bankEngine.subscribe(() => {
      setEngineState({ ...bankEngine.getState() });
    });
    return unsubscribe;
  }, []);

  const handleOpenReceipt = (receipt: Receipt) => {
    setActiveReceipt(receipt);
  };

  const handleLoginSuccess = (accountName: string) => {
    setWelcomeToast(`Hi ${accountName}, logged in`);
    setTimeout(() => {
      setWelcomeToast(null);
    }, 4000);
  };

  const handleLogout = () => {
    bankEngine.logout();
    setWelcomeToast(null);
  };

  // If not logged in, show dedicated Login Page
  if (!engineState.currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans pb-16 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={engineState.currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onOpenScanPay={() => setAccountActionType('scanPay')}
        onOpenViewBalance={() => setAccountActionType('viewBalance')}
        onLogout={handleLogout}
        notifications={engineState.notifications}
      />

      {/* Floating Welcome Toast: "Hi Account name logined" */}
      <AnimatePresence>
        {welcomeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center space-x-2 text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{welcomeToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Viewport with Motion Spring Animation */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="tab-dashboard"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <DashboardView
                onSelectTab={setActiveTab}
                onOpenReceipt={handleOpenReceipt}
                onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
                onOpenScanPay={() => setAccountActionType('scanPay')}
                onOpenViewBalance={() => setAccountActionType('viewBalance')}
              />
            </motion.div>
          )}

          {activeTab === 'customer' && (
            <motion.div
              key="tab-customer"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <CustomerManagementView />
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              key="tab-account"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <AccountManagementView onGoHome={() => setActiveTab('dashboard')} />
            </motion.div>
          )}

          {activeTab === 'transaction' && (
            <motion.div
              key="tab-transaction"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <TransactionView
                onOpenReceipt={handleOpenReceipt}
              />
            </motion.div>
          )}

          {activeTab === 'payment' && (
            <motion.div
              key="tab-payment"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <PaymentView
                onOpenReceipt={handleOpenReceipt}
              />
            </motion.div>
          )}

          {activeTab === 'loan' && (
            <motion.div
              key="tab-loan"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <LoanManagementView
                onOpenReceipt={handleOpenReceipt}
              />
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div
              key="tab-reports"
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            >
              <ReportsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Account Direct Navigation Action: Scan & Pay / View Balance */}
      <AccountActionModal
        type={accountActionType}
        onClose={() => setAccountActionType(null)}
        onOpenReceipt={handleOpenReceipt}
      />

      {/* Receipt Modal */}
      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />

      {/* AI Financial & Risk Intelligence Modal (Thinking Mode) */}
      <AIAdvisorModal isOpen={isAIAdvisorOpen} onClose={() => setIsAIAdvisorOpen(false)} />
    </div>
  );
}
