import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BarFieldProps {
  count?: number;
  className?: string;
}

export const BarFieldVisualization: React.FC<BarFieldProps> = ({ count = 48, className = '' }) => {
  // Deterministic heights so there's no hydration mismatch or layout jump
  const bars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      // Pseudo-random deterministic curve based on sine/cosine
      const heightPercent = 25 + Math.abs(Math.sin(i * 0.45) * 55) + (i % 3 === 0 ? 15 : -5);
      const isUp = i % 2 === 0;
      const delay = (i % 8) * 0.08;
      return {
        id: i,
        height: Math.min(95, Math.max(18, heightPercent)),
        isUp,
        delay,
      };
    });
  }, [count]);

  return (
    <div className={`relative w-full h-44 flex items-center justify-between gap-[5px] overflow-hidden ${className}`}>
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`relative flex flex-col w-[6px] h-full ${
            bar.isUp ? 'justify-end' : 'justify-start'
          }`}
        >
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${bar.height}%` }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: bar.delay,
              ease: [0.645, 0.045, 0.355, 1],
            }}
            className="relative w-full rounded-full bg-gradient-to-t from-primary/30 to-border/40"
          >
            {/* Accent dot at the tip of each bar */}
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.3,
                delay: bar.delay + 0.6,
              }}
              className={`absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary ${
                bar.isUp ? 'top-0' : 'bottom-0'
              }`}
            />
          </motion.div>
        </div>
      ))}
    </div>
  );
};
