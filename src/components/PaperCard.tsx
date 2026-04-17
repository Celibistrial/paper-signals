'use client';

import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaperCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export default function PaperCard({ children, className, delay = 0, hover = true }: PaperCardProps) {
  const classSeed = className?.length || 0;
  const rotation = (((delay * 1000) + classSeed) % 7) * 0.25 - 0.75;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, rotate: rotation + 5 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={hover ? { 
        y: -5, 
        rotate: 0,
        scale: 1.01,
        transition: { duration: 0.2 } 
      } : undefined}
      className={cn(
        "paper-card rough-edge",
        className
      )}
    >
      {/* Texture mask overlay handled by globals.css paper-card class */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
