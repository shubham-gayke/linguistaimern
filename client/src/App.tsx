import { motion } from 'framer-motion';
import { Languages, Sparkles, LogIn, UserPlus, LogOut, MessageSquare, Crown, ShieldAlert } from 'lucide-react';
import { TranslationCard } from './components/TranslationCard';
import { Background } from './components/Background';
import { Signup } from './pages/Signup';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { Chat } from './pages/Chat';
import { Pricing } from './pages/Pricing';
import { AdminDashboard } from './pages/AdminDashboard';

import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedChatRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (!user?.isPremium) {
    return <Navigate to="/pricing" />;
  }

  return children;
};

function MainApp() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isPremium = user?.isPremium;

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text relative overflow-hidden font-sans selection:bg-primary-500/30 selection:text-primary-400">
      {/* Animated Background */}
      <Background />

      <div className="container mx-auto px-4 py-8 relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-12 md:mb-16 pointer-events-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative p-2">
              <div className="absolute inset-0 bg-primary-500/20 rounded-lg blur-md group-hover:blur-xl transition-all duration-500" />
              <div className="relative p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                <Languages className="w-6 h-6 text-primary-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white relative">
              Linguist<span className="text-primary-400">AI</span>
              <Sparkles className="w-4 h-4 text-primary-400 absolute -top-1 -right-4 animate-pulse" />
            </h1>
          </motion.div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.email === 'shubhamgayke9168@gmail.com' && (
                  <Link to="/admin">
                    <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="hidden md:inline">Admin</span>
                    </button>
                  </Link>
                )}

                {!isPremium && (
                  <Link to="/pricing">
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-200 border border-yellow-500/30 hover:border-yellow-500/50 transition-all flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="hidden md:inline">Upgrade</span>
                    </button>
                  </Link>
                )}

                <Link to="/chat">
                  <button className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${isPremium
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    }`}>
                    <MessageSquare className="w-4 h-4" />
                    Chat Room
                  </button>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="text-dark-muted text-sm hidden md:block">
                    {user?.email}
                  </span>
                  {isPremium && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" /> PRO
                    </span>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <button className="px-4 py-2 rounded-lg text-dark-muted hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route
            path="/chat"
            element={
              <ProtectedChatRoute>
                <Chat />
              </ProtectedChatRoute>
            }
          />
          <Route
            path="/"
            element={
              <main className="flex-grow flex flex-col items-center justify-center max-w-6xl mx-auto w-full pointer-events-auto">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, type: "spring" }}
                  className="text-center mb-16 relative"
                >
                  {/* Text Glow Effect */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/20 blur-[100px] -z-10 rounded-full opacity-0 animate-pulse-slow" />

                  <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white tracking-tight drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="block"
                    >
                      Break Language Barriers
                    </motion.span>
                    <motion.span
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-white to-primary-600 animate-gradient-x"
                    >
                      with Generative AI
                    </motion.span>
                  </h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.2 }}
                    className="text-dark-muted text-xl max-w-2xl mx-auto font-light leading-relaxed backdrop-blur-sm py-2 rounded-xl"
                  >
                    Seamless translation between English, Hindi, and Marathi with advanced dialect adaptation.
                  </motion.p>
                </motion.div>

                {/* Translation Component */}
                <TranslationCard />
              </main>
            }
          />
        </Routes>

        <footer className="mt-20 py-8 border-t border-white/5 text-center backdrop-blur-sm pointer-events-auto">
          <p className="text-dark-muted text-sm font-medium hover:text-white transition-colors cursor-default">
            All rights reserved Shubham Gayke 2025
          </p>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

export default App;
