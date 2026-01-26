import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';

export const FullScreenScore = ({
    score,
    total = 5,
    participantName,
    roundName,
    isHost,
    onClose,

    tieBreakerRoundNum,
    tieBreakerConfig
}) => {
    // Determine title text based on mode
    let smallText = roundName + " Session";
    let bigText = participantName;

    if (tieBreakerRoundNum) {
        smallText = roundName.toUpperCase(); // Show Round Name (e.g. "SPELL IT TIE BREAKER")

        if (total === 0) {
            // Start of Round
            bigText = `ROUND ${tieBreakerRoundNum}`;
        } else {
            // End of Round
            bigText = `END OF ROUND ${tieBreakerRoundNum}`;
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        },
        exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 20 }
        }
    };

    // Helper to render the content for the "Score" area
    const renderCenterContent = () => {
        if (tieBreakerRoundNum) {
            if (total === 0) {
                // START SCREEN: Show Config (Players & Qs) - VERTICAL STACK
                return (
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center glass-dark p-6 rounded-2xl border border-white/10 w-80">
                            <span className="text-[5rem] font-black text-white leading-none text-neon-blue">{tieBreakerConfig?.totalPlayers || 0}</span>
                            <span className="text-sm font-bold text-blue-300 uppercase tracking-[0.2em] mt-2">PLAYERS</span>
                        </div>

                        <div className="flex flex-col items-center glass-dark p-6 rounded-2xl border border-white/10 w-80">
                            <span className="text-[5rem] font-black text-white leading-none text-neon-blue">{tieBreakerConfig?.questionsPerPlayer || 0}</span>
                            <span className="text-sm font-bold text-blue-300 uppercase tracking-[0.2em] mt-2">QS PER PLAYER</span>
                        </div>
                    </div>
                );
            } else {
                // END SCREEN: Show Nothing (Clean)
                return null;
            }
        }

        // NORMAL ROUND: Show Score
        return (
            <div className="flex items-baseline justify-center gap-2 lg:gap-4 select-none">
                <span className="text-[8rem] lg:text-[12rem] leading-none font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                    {score}
                </span>
                <span className="text-4xl lg:text-7xl font-bold text-slate-600 italic">
                    / {total}
                </span>
            </div>
        );
    };

    // Determine if this is the "End Screen" (Tie Breaker + Total > 0)
    const isEndScreen = tieBreakerRoundNum && total !== 0;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-950 to-slate-950 blur-3xl" />
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:40px_40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-subtle" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full max-w-2xl aspect-square lg:aspect-[4/3] relative z-10 mx-auto"
            >
                {/* Main Glass Card */}
                <div className={`w-full h-full glass-dark rounded-[2.5rem] flex flex-col items-center ${isEndScreen ? 'justify-center gap-10' : 'justify-between'} p-8 lg:p-12 relative overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20`}>

                    {/* Top Glow Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-70 neon-glow-blue" />

                    {/* Host-Only Close Button (X) */}
                    {isHost && (
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-200 z-50 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Header Section */}
                    <div className="text-center space-y-4 pt-4 w-full">
                        <motion.h2 variants={itemVariants} className="text-blue-400 text-sm lg:text-lg font-bold tracking-[0.3em] uppercase opacity-80 neon-glow-blue">
                            {smallText}
                        </motion.h2>
                        <motion.h1 variants={itemVariants} className="text-white text-4xl lg:text-6xl font-black italic tracking-tighter text-shadow-lg text-neon-blue uppercase">
                            {bigText}
                        </motion.h1>
                        <div className="w-32 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent mx-auto mt-6" />
                    </div>

                    {/* Center Section: Score OR Vertical Stack */}
                    {!isEndScreen && (
                        <motion.div variants={itemVariants} className="flex-1 flex flex-col items-center justify-center relative w-full">
                            {renderCenterContent()}
                        </motion.div>
                    )}

                    {/* Footer Section */}
                    <motion.div variants={itemVariants} className="w-full flex justify-center pb-4">
                        <Button
                            variant="primary"
                            onClick={onClose}
                            className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-300 hover:text-white px-8 py-3 rounded-xl uppercase tracking-widest font-bold text-sm transition-all duration-300 neon-glow-blue backdrop-blur-md"
                        >
                            {isHost ? 'Terminate HUD' : 'Close HUD'}
                        </Button>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
