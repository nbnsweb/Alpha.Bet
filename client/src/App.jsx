import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameProvider, useGame } from './context/GameContext';
import { HostDashboard } from './components/HostScreen/HostDashboard';
import { ParticipantView } from './components/ParticipantScreen/ParticipantView';
import { Button } from './components/Button';

function AppContent() {
    const [path, setPath] = useState(window.location.pathname);
    const { roomCode, actions } = useGame();

    useEffect(() => {
        const handlePopState = () => setPath(window.location.pathname);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (newPath, code = null) => {
        window.history.pushState({}, '', newPath);
        setPath(newPath);
    };

    const renderContent = () => {
        // If we have a path but no room code, force landing page unless it's just /
        if ((path === '/host' || path === '/participant') && !roomCode) {
            return <LandingPage navigate={navigate} initialRole={path === '/host' ? 'host' : 'participant'} />;
        }

        switch (path) {
            case '/host':
                return <HostDashboard />;
            case '/participant':
                return <ParticipantView />;
            default:
                return <LandingPage navigate={navigate} />;
        }
    };

    return renderContent();
}

function App() {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
}

const LandingPage = ({ navigate, initialRole = null }) => {
    const [code, setCode] = useState('');
    const [role, setRole] = useState(initialRole);
    const { actions } = useGame();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    const handleJoin = (selectedRole) => {
        if (!code.trim()) {
            alert('Please enter a Room Code');
            return;
        }
        const cleanCode = code.trim().toUpperCase();
        actions.joinRoom(cleanCode, selectedRole);
        navigate(selectedRole === 'host' ? '/host' : '/participant');
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="h-screen overflow-hidden mesh-gradient flex flex-col items-center justify-center p-4 lg:p-8 relative uppercase"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none fixed" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[150px] rounded-full animate-pulse-subtle fixed" />

            <motion.div variants={itemVariants} className="text-center relative z-10 mb-8 lg:mb-16 space-y-4 lg:space-y-6">
                <img src="/logo.png" alt="Logo" className="h-20 lg:h-32 w-auto mx-auto mb-4 lg:mb-8 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-pulse-subtle" />
                <h1 className="text-4xl lg:text-7xl font-black text-white tracking-[0.2em] lg:tracking-[0.2em] italic text-neon-blue">ALPHA.BET</h1>
                <p className="text-[8px] lg:text-xs font-black text-blue-400 uppercase tracking-[0.4em] lg:tracking-[0.6em] opacity-60">Multiplex Interactive Network</p>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full max-w-xl glass-dark p-6 lg:p-12 rounded-[2rem] lg:rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] space-y-8 lg:space-y-12 border border-white/10 relative z-10 group">
                <div className="absolute top-0 left-0 w-full h-1 lg:h-2 bg-blue-600 neon-glow-blue opacity-50 transition-opacity group-hover:opacity-100" />

                <div className="space-y-4 lg:space-y-6">
                    <label className="block text-[8px] lg:text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] text-center mb-2 lg:mb-4">Initialize Session ID</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="SESSION_CODE"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl lg:rounded-3xl px-4 lg:px-8 py-4 lg:py-6 text-2xl lg:text-4xl font-black text-white placeholder:text-slate-700 focus:outline-none focus:border-blue-500 neon-glow-blue transition-all text-center tracking-[0.2em] lg:tracking-[0.3em] font-mono italic"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4 lg:gap-8 pt-2 lg:pt-4">
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoin('host')}
                        className="py-4 lg:py-6 rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-xs tracking-[0.2em] lg:tracking-[0.3em] bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all shadow-[0_0_20px_rgba(79,70,229,0.1)] active:scale-95 flex flex-col items-center gap-1 lg:gap-2 group"
                    >
                        <span className="text-xl lg:text-2xl group-hover:scale-125 transition-transform mb-1">🎮</span>
                        COMMANDER
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleJoin('participant')}
                        className="py-4 lg:py-6 rounded-2xl lg:rounded-3xl font-black text-[10px] lg:text-xs tracking-[0.2em] lg:tracking-[0.3em] bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] active:scale-95 flex flex-col items-center gap-1 lg:gap-2 group"
                    >
                        <span className="text-xl lg:text-2xl group-hover:scale-125 transition-transform mb-1">🕹️</span>
                        OPERATOR
                    </motion.button>
                </div>
            </motion.div>


            <motion.div variants={itemVariants} className="mt-8 lg:mt-16 text-center space-y-2 opacity-30 relative z-10">
                <p className="text-[9px] font-black text-slate-500 tracking-[0.5em] uppercase">
                    Continuous Sync Enabled • Secure Tunnel Established
                </p>
                <div className="flex items-center justify-center gap-1.5">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-ping" />
                    <span className="text-[8px] font-black text-green-500 tracking-widest uppercase">Network Status: Nominal</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default App;
