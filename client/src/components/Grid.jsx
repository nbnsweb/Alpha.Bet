import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

const container = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: {
            staggerChildren: 0.01,
            delayChildren: 0.1,
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

const item = {
    hidden: { y: 40, opacity: 0, scale: 0.5, rotateX: 45 },
    show: {
        y: 0,
        opacity: 1,
        scale: 1,
        rotateX: 0,
        transition: {
            type: "spring",
            stiffness: 260,
            damping: 20
        }
    }
};

export const Grid = ({ questions, onBoxClick, isHost = false }) => {
    if (!questions) return null;

    return (
        <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 perspective-[2000px]">
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-10 gap-1 w-full h-full max-h-[60vh] relative z-10 preserve-3d items-center justify-center p-1 content-center mx-auto"
            >
                {questions.map((q) => {
                    const isSelected = q.status === 'selected';
                    const isCorrect = q.status === 'correct';
                    const isWrong = q.status === 'wrong';
                    const isAvailable = q.status === 'available';

                    let bgClass = "glass border-white/10 text-slate-400 hover:text-white hover:border-blue-500/50";
                    if (isCorrect) bgClass = "bg-green-600/20 text-green-400 border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                    if (isWrong) bgClass = "bg-red-600/20 text-red-400 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]";
                    if (isSelected) bgClass = "bg-blue-600 text-white border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)] z-20 scale-110";

                    // Enable clicks for both Host and Participant (so Participant can trigger audio/selection if desired)
                    const isDisabled = !isAvailable;

                    return (
                        <motion.button
                            key={q.boxNo}
                            variants={item}
                            whileHover={!isDisabled ? {
                                scale: 1.15,
                                z: 50,
                                rotateY: 5,
                                rotateX: -5,
                                transition: { duration: 0.2 }
                            } : {}}
                            whileTap={!isDisabled ? { scale: 0.9 } : {}}
                            onClick={() => !isDisabled && onBoxClick(q.boxNo)}
                            disabled={isDisabled}
                            className={cn(
                                "rounded-md border text-xs sm:text-sm lg:text-xl font-black transition-all duration-300 flex items-center justify-center backdrop-blur-md aspect-square relative group",
                                bgClass,
                                isDisabled && q.status === 'available' && "opacity-40 grayscale"
                            )}
                        >
                            {/* Inner Glow */}
                            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 bg-gradient-to-br from-white/10 to-transparent transition-opacity" />

                            <span className={cn(
                                "relative z-10",
                                isSelected && "animate-pulse"
                            )}>
                                {q.boxNo}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
};
