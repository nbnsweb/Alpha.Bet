import React, { useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { cn } from '../../utils/cn';
import { speakText, unlockAudio } from '../../utils/audio';
import { FullScreenScore } from '../FullScreenScore';
import { Grid } from '../Grid';
import { AnimatePresence, motion } from 'framer-motion';

export const ParticipantView = () => {
    const { gameState, actions, isConnected, roomCode } = useGame();
    const [isMuted, setIsMuted] = React.useState(() => localStorage.getItem('part_muted') === 'true');

    useEffect(() => {
        localStorage.setItem('part_muted', isMuted);
    }, [isMuted]);

    // Auto-Play Voice when a question is selected
    useEffect(() => {
        if (gameState?.currentQuestion?.word && !isMuted) {
            speakText(gameState.currentQuestion.word);
        }
    }, [gameState?.currentQuestion?.boxNo, gameState?.currentQuestion?.word, isMuted]);

    // Audio Trigger Listener
    useEffect(() => {
        if (!gameState?.socket) return;

        const handleAudioTrigger = (word) => {
            const targetWord = word || gameState?.currentQuestion?.word;
            if (targetWord && !isMuted) {
                speakText(targetWord);
            }
        };

        gameState.socket.on('trigger_audio', handleAudioTrigger);
        return () => {
            gameState.socket.off('trigger_audio', handleAudioTrigger);
        };
    }, [gameState?.socket, gameState?.currentQuestion?.word, isMuted]);

    if (!gameState) return (
        <div className="h-screen mesh-gradient flex items-center justify-center font-sans antialiased relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center relative z-10"
            >
                <div className="w-24 h-24 mb-8 mx-auto relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative w-full h-full glass-dark rounded-3xl border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
                        <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="text-blue-500"
                        >
                            🌀
                        </motion.span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-2xl font-black uppercase tracking-[0.4em] text-white text-neon-blue">Initializing</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400 opacity-60">Syncing Room Protocol: {roomCode}</div>
                </div>
            </motion.div>
        </div>
    );

    const {
        currentRound,
        currentParticipant,
        score,
        gridState,
        isScoreScreenActive,
        isGridEnabled,
        currentQuestion
    } = gameState;

    // Question Display Logic
    const showWord = currentRound.includes('Meaning') && currentQuestion;

    const toggleFullScreen = () => {
        const element = document.documentElement;
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => console.error("FS Error:", err));
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            onClickCapture={() => {
                // Global audio unlocker: Any tap/click on screen ensures audio context is ready
                unlockAudio();
            }}
            className="h-screen overflow-hidden mesh-gradient flex flex-col lg:flex-row font-sans antialiased relative text-slate-100"
        >
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none fixed" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 fixed" />


            {/* Full Screen Score Overlay */}
            <AnimatePresence>
                {isScoreScreenActive && (
                    <FullScreenScore
                        score={score}
                        total={currentRound.includes('Tie Breaker')
                            ? (gameState.tieBreakerState?.questionsAskedInCurrentRound === 0
                                ? 0
                                : ((gameState.tieBreakerState?.totalPlayers || 0) * (gameState.tieBreakerState?.questionsPerPlayer || 0)))
                            : 5}
                        participantName={currentParticipant}
                        roundName={currentRound}
                        tieBreakerRoundNum={currentRound.includes('Tie Breaker') ? gameState?.tieBreakerState?.roundNumber : null}
                        tieBreakerConfig={currentRound.includes('Tie Breaker') ? gameState?.tieBreakerState : null}
                        isHost={false}
                        onClose={actions.closeScoreScreen}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Section - Responsive (Header on mobile, Sidebar on LG) */}
            <aside className="w-full lg:w-80 lg:h-full glass-dark flex flex-col flex-shrink-0 z-20 border-b lg:border-b-0 lg:border-r border-white/10 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="p-6 lg:pt-10 lg:px-8 flex lg:flex-col items-center justify-between lg:justify-start text-center gap-4 flex-1">

                    <div className="flex lg:flex-col items-center gap-4 lg:gap-8 w-auto lg:w-full">
                        {/* Room Info */}
                        <div className="bg-blue-600/10 border border-blue-500/20 px-4 py-2 lg:p-4 rounded-xl lg:rounded-2xl neon-glow-blue flex flex-col justify-center">
                            <div className="hidden lg:block text-[8px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1 opacity-60">ROOM_PROTOCOL</div>
                            <div className="text-xs lg:text-xl font-black text-white tracking-widest uppercase">#{roomCode}</div>
                        </div>

                        {/* Participant Score */}
                        <div className="relative group flex flex-col justify-center">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl lg:rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                            <div className="relative glass-dark rounded-xl lg:rounded-3xl px-4 py-2 lg:p-6 border border-white/10 text-center">
                                <span className="hidden lg:block text-[8px] uppercase tracking-[0.4em] text-blue-400 font-black mb-2">SCORE_INDEX</span>
                                <div className="text-lg lg:text-5xl font-black text-white tracking-tighter text-neon-blue">
                                    {score}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Controls integrated into Sidebar */}
                <div className="p-4 lg:p-8 border-t border-white/10 lg:bg-black/20 flex lg:flex-col gap-3">
                    <button
                        onClick={() => {
                            const newMutedState = !isMuted;
                            setIsMuted(newMutedState);
                            if (!newMutedState) {
                                // User clicked UNMUTE - Attempt to unlock Android Audio
                                unlockAudio();
                            }
                        }}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all text-[10px] font-black tracking-widest uppercase",
                            isMuted
                                ? "bg-red-500/20 border-red-500/50 text-red-400"
                                : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                        )}
                    >
                        <span>{isMuted ? "🔇" : "🔊"}</span>
                        <span className="hidden lg:inline">{isMuted ? "UNMUTE" : "MUTE"}</span>
                    </button>
                    <button
                        onClick={toggleFullScreen}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black tracking-widest uppercase"
                    >
                        <span>🔲</span>
                        <span className="hidden lg:inline">EXPAND</span>
                    </button>
                </div>

                <div className="hidden lg:flex p-4 opacity-30">
                    <div className="text-[8px] font-black tracking-[0.5em] text-center w-full uppercase">System Active</div>
                </div>
            </aside>

            <motion.main
                variants={itemVariants}
                className="flex-1 flex flex-col p-4 lg:p-12 relative z-10 overflow-hidden"
            >
                {/* Header for Main Stage with Logo */}
                {/* Header for Main Stage with Logo */}
                <div className="mb-4 lg:mb-6 flex flex-row items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                        <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em] mb-1 lg:mb-2 opacity-60">ACTIVE PROTOCOL</div>
                        <h2 className="text-2xl lg:text-5xl font-black text-white tracking-widest text-neon-blue italic uppercase">{currentRound}</h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={cn(
                            "px-4 py-2 rounded-xl border font-black text-[10px] lg:text-xs tracking-[0.2em] flex items-center gap-2 transition-all",
                            isGridEnabled
                                ? "bg-green-500/10 border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                                : "bg-red-500/10 border-red-500/30 text-red-400"
                        )}>
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                isGridEnabled ? "bg-green-500 animate-pulse" : "bg-red-500"
                            )} />
                            {isGridEnabled ? "GRID LIVE" : "GRID LOCKED"}
                        </div>
                        <img src="/logo.png" alt="Logo" className="h-auto w-auto max-h-12 lg:max-h-24 object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>
                {/* Grid Section - Responsive layout for 50 boxes */}
                <div className="w-full h-full glass-dark rounded-[2rem] lg:rounded-[3rem] p-2 lg:p-4 border border-white/10 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.8)] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                    <Grid
                        questions={Array.from({ length: 50 }, (_, i) => {
                            const num = i + 1;
                            const status = gridState[num];
                            let resolvedStatus = status;
                            if (status === 'neutral' && currentQuestion && currentQuestion.boxNo === num) {
                                resolvedStatus = 'selected';
                            }
                            return {
                                boxNo: num,
                                status: resolvedStatus === 'neutral' ? 'available' : resolvedStatus
                            };
                        })}
                        onBoxClick={(boxNo) => actions.selectBox(boxNo)}
                        isHost={false}
                    />
                </div>

                {/* Flip-Up Word Modal */}
                <AnimatePresence>
                    {currentQuestion && (
                        <div className="fixed inset-0 z-[9999] flex items-start pt-[10vh] justify-center px-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-[#020617]/80 backdrop-blur-2xl"
                            />

                            <motion.div
                                initial={{ rotateY: -90, opacity: 0, scale: 0.8 }}
                                animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                                exit={{ rotateY: 90, opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.8, type: "spring", damping: 15 }}
                                className="w-1/2 glass-dark rounded-[2rem] lg:rounded-[4rem] shadow-[0_64px_128px_-32px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center border border-white/20 relative z-10"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600 neon-glow-blue" />

                                <div className="w-full py-4 lg:py-8 px-6 lg:px-12 flex justify-between items-center">
                                    <h3 className="text-[8px] lg:text-xs font-black uppercase tracking-[0.5em] text-blue-400">TRANSMISSION_ACTIVE</h3>
                                    {currentQuestion.boxNo > 0 && (
                                        <div className="bg-blue-600 text-white px-4 lg:px-6 py-1 lg:py-2 rounded-xl lg:rounded-2xl text-sm lg:text-lg font-black tracking-wider shadow-lg neon-glow-blue">BOX {currentQuestion.boxNo}</div>
                                    )}
                                </div>

                                <div className="p-10 lg:p-20 text-center w-full">
                                    {showWord ? (
                                        <div className="space-y-6 lg:space-y-10">
                                            <div className="text-[8px] lg:text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] mb-2 lg:mb-4 opacity-70">DISPLAYING_WORD</div>
                                            <motion.h2
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.4 }}
                                                className="text-4xl lg:text-8xl font-black text-white tracking-tighter whitespace-nowrap leading-[0.9] text-shadow-sm text-neon-blue italic"
                                                style={{ fontSize: 'clamp(2rem, 5vw, 6rem)' }}
                                            >
                                                {currentQuestion.word}
                                            </motion.h2>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 lg:space-y-8">
                                            <div className="text-5xl lg:text-9xl mb-4 lg:mb-10 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">🎙️</div>
                                            <div className="text-[8px] lg:text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] mb-2 lg:mb-4 opacity-70">AUDIO_PROTOCOL_ENGAGED</div>
                                            <h2 className="text-3xl lg:text-7xl font-black text-white tracking-tight italic">LISTEN CAREFULLY</h2>
                                        </div>
                                    )}

                                    <div className="mt-8 lg:mt-16 pt-6 lg:pt-12 border-t border-white/5 flex flex-col items-center">
                                        <div className="w-12 lg:w-20 h-1 bg-blue-600 rounded-full mb-4 lg:mb-8 neon-glow-blue opacity-50" />
                                        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-sm max-w-md leading-relaxed">
                                            {currentRound.includes('SPELL IT')
                                                ? "Announcing word transmission. Precise spelling required."
                                                : "Input dictionary semantic value for transmission."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.main>
        </motion.div>
    );
};
