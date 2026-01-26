import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { Button } from '../Button';
import { speakText, playSound } from '../../utils/audio';
import { FullScreenScore } from '../FullScreenScore';
import { Grid } from '../Grid';
import * as XLSX from 'xlsx';
import { cn } from '../../utils/cn';

export const HostDashboard = () => {
    const { gameState, actions, isConnected, roomCode } = useGame();
    const [newParticipantName, setNewParticipantName] = useState('');
    const [isMuted, setIsMuted] = useState(() => localStorage.getItem('host_muted') === 'true');

    // Tie Breaker Config
    const [tbPlayers, setTbPlayers] = useState(2);
    const [tbQuestions, setTbQuestions] = useState(1);
    const [tbRoundNum, setTbRoundNum] = useState(1);

    // Sync local round num with server state if needed, or just track locally?
    // Let's defer to server state if available, or auto-increment.
    useEffect(() => {
        if (gameState?.tieBreakerState?.roundNumber) {
            // If round is active, we are on that round.
            // If not active, and we finished one, maybe suggest next?
            // For now, let's just initialize if needed, but allow manual override if user wants.
            // setTbRoundNum(gameState.tieBreakerState.roundNumber);
        }
    }, [gameState?.tieBreakerState?.roundNumber]);

    // When round changes to Tie Breaker, reset round num to 1?
    useEffect(() => {
        if (gameState?.currentRound.includes('Tie Breaker')) {
            if (gameState.tieBreakerState?.roundNumber) {
                // If we are coming back to TB, pick up where we left off?
                // or if it's a fresh start?
                // implementation detail: let's track 'next' round.
                // If server says round 1 and it's over, next is 2.
                // Simple logic check:
                const tb = gameState.tieBreakerState;
                if (tb && !tb.isRoundActive && tb.questionsAskedInCurrentRound > 0) {
                    setTbRoundNum(tb.roundNumber + 1);
                } else if (tb) {
                    setTbRoundNum(tb.roundNumber);
                }
            }
        }
    }, [gameState?.currentRound, gameState?.tieBreakerState]);

    // Auto-Play Voice when a question is selected
    useEffect(() => {
        if (gameState?.currentQuestion?.word && !isMuted) {
            speakText(gameState.currentQuestion.word);
        }
    }, [gameState?.currentQuestion?.boxNo, gameState?.currentQuestion?.word, isMuted]);

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
                            animate={{ rotate: -360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="text-blue-500"
                        >
                            ⚡
                        </motion.span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="text-2xl font-black uppercase tracking-[0.4em] text-white text-neon-blue">Commander Sync</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-400 opacity-60">Establishing Link Room: {roomCode}</div>
                </div>
            </motion.div>
        </div>
    );

    const {
        currentRound,
        currentParticipant,
        score,
        questionsAnswered,
        currentQuestion,
        questions = [],
        gridState = {},
        isScoreScreenActive,
        isGridEnabled,
        tieBreakerState
    } = gameState;

    const isTieBreaker = currentRound.includes('Tie Breaker');


    // Question Upload Handler
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });

            const rounds = ['SPELL IT', 'SPELL IT Tie Breaker', 'Meaning', 'Meaning Tie Breaker'];
            const questionsByRound = {};

            rounds.forEach((round, index) => {
                const sheetName = wb.SheetNames[index];
                if (sheetName) {
                    const ws = wb.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(ws);
                    questionsByRound[round] = data.map(row => ({
                        boxNo: row['Box No'] || row['boxNo'],
                        word: row['Word'] || row['word'],
                        meaning: row['Meaning'] || row['meaning']
                    }));
                }
            });

            actions.uploadQuestions(questionsByRound);
            alert(`Uploaded questions for ${Object.keys(questionsByRound).join(', ')}`);
        };
        reader.readAsBinaryString(file);
    };

    // TTS Handler
    // TTS Handler
    const handlePlayVoice = () => {
        if (!currentQuestion || isMuted) return;
        // Play locally
        speakText(currentQuestion.word);
        // Trigger on participants
        actions.playAudio();
    };

    const toggleFullScreen = () => {
        console.log("Toggle Fullscreen Triggered");
        const element = document.documentElement;

        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
            console.log("Attempting to enter fullscreen...");
            if (element.requestFullscreen) {
                element.requestFullscreen().catch(err => console.error("FS Error:", err));
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else {
                alert("Fullscreen not supported by this browser.");
            }
        } else {
            console.log("Attempting to exit fullscreen...");
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

    return (
        <div className="h-screen overflow-hidden mesh-gradient flex flex-col lg:flex-row font-sans text-slate-100 antialiased relative">
            <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none fixed" />

            {/* Full Screen Score Overlay (Host View) */}
            {isScoreScreenActive && (
                <FullScreenScore
                    score={score}
                    total={currentRound.includes('Tie Breaker')
                        ? (tieBreakerState?.questionsAskedInCurrentRound === 0
                            ? 0
                            : ((tieBreakerState?.totalPlayers || 0) * (tieBreakerState?.questionsPerPlayer || 0)))
                        : 5}
                    participantName={currentParticipant}
                    roundName={currentRound}
                    tieBreakerRoundNum={currentRound.includes('Tie Breaker') ? tieBreakerState?.roundNumber : null}
                    tieBreakerConfig={currentRound.includes('Tie Breaker') ? tieBreakerState : null}
                    isHost={true}
                    onClose={actions.closeScoreScreen}
                />
            )}

            {/* Column 1: Navigation & Stats (Left) - Hidden on mobile, show on LG */}
            <aside className="hidden lg:flex w-80 glass-dark flex-col flex-shrink-0 z-20 border-r border-white/10 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="pt-4 px-6 flex flex-col items-center text-center">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto mb-4 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div className="bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 rounded-full mb-4 neon-glow-blue animate-pulse-subtle">
                        <span className="text-[10px] text-blue-300 font-black tracking-[0.2em] uppercase">ROOM: {roomCode}</span>
                    </div>
                </div>

                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, type: "spring", damping: 20 }}
                    className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4"
                >
                    {/* Round Selection */}
                    <div className="space-y-4">
                        <h3 className="text-[10px] uppercase tracking-[0.3em] text-blue-400/60 mb-2 font-black">Game Rounds</h3>
                        <div className="space-y-2">
                            {['SPELL IT', 'SPELL IT Tie Breaker', 'Meaning', 'Meaning Tie Breaker'].map((round, idx) => (
                                <motion.button
                                    key={round}
                                    whileHover={{ x: 5 }}
                                    onClick={() => actions.changeRound(round)}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-xl transition-all duration-300 flex items-center justify-between group relative overflow-hidden",
                                        currentRound === round
                                            ? "bg-blue-600/20 border border-blue-500/40 text-white neon-glow-blue"
                                            : "hover:bg-white/5 border border-transparent text-slate-400 hover:text-white"
                                    )}
                                >
                                    <span className="text-[11px] font-bold uppercase tracking-widest relative z-10">
                                        R{idx + 1}: {round}
                                    </span>
                                    {currentRound === round && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,1)]" />}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Participant Stats */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative group"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                        <div className="relative glass-dark rounded-3xl p-6 border border-white/10 text-center">
                            <span className="text-[8px] uppercase tracking-[0.3em] text-blue-400 font-black mb-2 block">PARTICIPANT</span>
                            <div className="text-2xl font-black text-white mb-4 truncate tracking-tight">{currentParticipant}</div>

                            <div className="flex flex-col items-center">
                                <div className="text-3xl font-black text-white mb-2 truncate tracking-tight text-neon-blue">
                                    {score}
                                </div>
                            </div>

                            {currentRound.includes('Tie Breaker') && (
                                <Button
                                    variant="danger"
                                    className="w-full mt-6"
                                    onClick={() => actions.endTieBreaker()}
                                >
                                    FINALIZE SESSION
                                </Button>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Input Cards */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="glass-dark rounded-2xl p-5 border border-white/5"
                        >
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2 font-black">Management</h3>
                            <div className="space-y-3">
                                {isTieBreaker ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] uppercase text-slate-400 font-bold w-16">Players</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={tbPlayers}
                                                onChange={(e) => setTbPlayers(parseInt(e.target.value) || 1)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] uppercase text-slate-400 font-bold w-16">Qs/Player</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={tbQuestions}
                                                onChange={(e) => setTbQuestions(parseInt(e.target.value) || 1)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] uppercase text-slate-400 font-bold w-16">Round #</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={tbRoundNum}
                                                onChange={(e) => setTbRoundNum(parseInt(e.target.value) || 1)}
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white text-center focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                            placeholder="Enter New Player..."
                                            value={newParticipantName}
                                            onChange={(e) => setNewParticipantName(e.target.value)}
                                        />
                                        <Button
                                            variant="primary"
                                            className="w-full"
                                            disabled={!newParticipantName}
                                            onClick={() => {
                                                actions.startNewParticipant(newParticipantName);
                                                setNewParticipantName('');
                                            }}
                                        >
                                            ADD TO SESSION
                                        </Button>
                                    </>
                                )}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="glass-dark rounded-2xl p-5 border border-white/5"
                        >
                            <h3 className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-2 font-black">Question Bank</h3>
                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={() => document.getElementById('excel-upload').click()}
                            >
                                <span className="text-xl">📂</span> LOAD DATA
                                <input
                                    id="excel-upload"
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                            </Button>
                        </motion.div>

                    </div>
                </motion.div>

                <div className="p-4 glass-dark border-t border-white/10">
                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest">
                        <span className="text-slate-500">CORE STATUS</span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]" />
                            <span className="text-green-500 uppercase">Synced</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Column 2: The Grid (Middle - Main Stage) */}
            <main className="flex-1 flex flex-col relative overflow-y-auto lg:overflow-hidden">
                <header className="h-12 lg:h-14 border-b border-white/10 flex items-center justify-between px-4 lg:px-8 glass-dark z-10 sticky top-0">
                    <div>
                        <h1 className="text-2xl lg:text-4xl font-black text-white tracking-[0.3em] italic text-neon-blue">ALPHA.BET</h1>
                    </div>

                    <div className="flex gap-4 items-center">
                        <Button
                            variant={isGridEnabled ? "success" : "secondary"}
                            size="md"
                            className={cn(
                                "px-4 lg:px-8 rounded-2xl font-black text-[10px] lg:text-xs tracking-[0.2em] transition-all",
                                isGridEnabled ? "bg-green-600/20 text-green-400 border border-green-500/30" : "bg-white/5 text-slate-400 border border-white/10"
                            )}
                            disabled={isGridEnabled}
                            onClick={() => {
                                if (isTieBreaker) {
                                    actions.startTieBreakerRound({
                                        totalPlayers: tbPlayers,
                                        questionsPerPlayer: tbQuestions,
                                        roundNumber: tbRoundNum
                                    });
                                } else {
                                    actions.enableGrid(true);
                                }
                            }}
                        >
                            {isGridEnabled
                                ? "LIVE"
                                : isTieBreaker
                                    ? `START ROUND ${tbRoundNum}`
                                    : "ENABLE"
                            }
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-2 lg:p-6 flex items-center justify-center overflow-hidden relative">
                    <div className="relative w-full h-full">
                        <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
                        <Grid
                            questions={(questions || []).map(q => {
                                let status = 'neutral';
                                if (currentQuestion && currentQuestion.boxNo == q.boxNo) {
                                    status = 'selected';
                                }
                                const stateStatus = gridState[q.boxNo];
                                if (stateStatus !== 'neutral') {
                                    status = stateStatus;
                                }

                                return {
                                    ...q,
                                    status: status === 'neutral' ? 'available' : status
                                };
                            })}
                            onBoxClick={(boxNo) => actions.selectBox(boxNo)}
                            isHost={true}
                        />
                    </div>
                </div>

            </main>

            {/* Column 3: Control Panel (Right) - Full width on mobile, fixed on LG */}
            <section className="w-full lg:w-96 glass-dark border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col z-20 shadow-2xl relative">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-blue-500 to-transparent opacity-50" />

                <div className="p-6 lg:p-8 border-b border-white/10">
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase">Action Interface</h2>
                    <div className="h-1 w-10 bg-blue-500 mt-3 rounded-full" />
                </div>

                <div className="flex-1 p-6 lg:p-8 flex flex-col overflow-y-auto no-scrollbar">
                    {currentQuestion ? (
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="bg-blue-600 px-4 py-2 rounded-xl font-black shadow-[0_0_20px_rgba(59,130,246,0.4)] text-lg tracking-wider">
                                        BOX #{currentQuestion.boxNo}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em] mb-2">Broadcast Word</div>
                                        <div className="text-3xl lg:text-5xl font-black text-white break-words leading-[0.9] tracking-tighter text-shadow-sm">
                                            {currentQuestion.word}
                                        </div>
                                    </div>

                                    <div className="glass-dark p-6 rounded-2xl border border-white/10 relative group overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-40" />
                                        <div className="text-[10px] text-blue-400/40 font-black uppercase tracking-[0.4em] mb-2">Reference Meaning</div>
                                        <div className="text-lg text-slate-200 font-bold leading-relaxed italic">
                                            "{currentQuestion.meaning}"
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="secondary"
                                onClick={handlePlayVoice}
                                className="mb-6 flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-[10px] font-black tracking-[0.3em] text-white group"
                            >
                                <span className="text-xl group-hover:scale-125 transition-transform">🔊</span>
                                ANNOUNCE WORD
                            </Button>

                            <div className="mt-auto space-y-4">
                                <div className="text-[10px] text-center text-slate-500 font-black uppercase tracking-[0.5em]">Final Verdict</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="success"
                                        className="py-4 lg:py-6 rounded-2xl"
                                        onClick={() => {
                                            playSound('correct');
                                            actions.processAnswer('correct');
                                        }}
                                    >
                                        CORRECT
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="py-4 lg:py-6 rounded-2xl"
                                        onClick={() => {
                                            playSound('wrong');
                                            actions.processAnswer('wrong');
                                        }}
                                    >
                                        WRONG
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-1000">
                            <div className="w-32 h-32 glass-dark border border-white/10 rounded-[3rem] flex items-center justify-center mb-10 text-5xl shadow-2xl relative group">
                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="animate-pulse relative z-10 text-blue-500">⚡</div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-[0.2em]">Ready For Input</h3>
                            <p className="text-xs font-bold text-slate-500 max-w-[280px] leading-relaxed tracking-widest uppercase">
                                System Standby. Select A Grid Node To Initialize Protocol.
                            </p>
                            <Button
                                variant="primary"
                                className="mt-8 px-8 py-4 text-xs font-black tracking-[0.2em]"
                                onClick={() => actions.shuffleGrid()}
                            >
                                <span className="text-lg mr-2">🔀</span> SHUFFLE GRID
                            </Button>

                        </div>
                    )}
                </div>

                {/* Persistent System Controls Footer */}
                <div className="p-4 lg:p-6 border-t border-white/10 glass-dark bg-black/20">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullScreen}
                            className="text-[9px] tracking-widest uppercase font-black py-3 border-white/5 bg-white/5 hover:bg-white/10"
                        >
                            <span className="text-sm mr-2">🔲</span> EXPAND
                        </Button>
                        <Button
                            variant={isMuted ? "danger" : "secondary"}
                            size="sm"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-[9px] tracking-widest uppercase font-black py-3"
                        >
                            <span className="text-sm mr-2">{isMuted ? "🔇" : "🔊"}</span>
                            {isMuted ? "MUTE" : "UNMUTE"}
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => actions.resetGrid()}
                            className="col-span-2 bg-transparent hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/10 hover:border-red-500/30 text-[9px] tracking-widest uppercase font-black py-3"
                        >
                            Emergency Board Reset
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};
