import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';

export const Button = ({ children, onClick, variant = 'primary', className, disabled, ...props }) => {
    const baseStyles = "px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed border flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white neon-glow-blue",
        danger: "bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]",
        success: "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600 hover:text-white shadow-[0_0_20px_rgba(34,197,94,0.2)]",
        secondary: "glass-dark text-slate-400 border-white/5 hover:text-white hover:border-white/20",
        outline: "bg-transparent border-white/10 text-slate-500 hover:text-white hover:border-blue-500/50",
        ghost: "bg-transparent border-transparent text-slate-500 hover:text-white"
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            onClick={onClick}
            disabled={disabled}
            className={cn(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </motion.button>
    );
};
