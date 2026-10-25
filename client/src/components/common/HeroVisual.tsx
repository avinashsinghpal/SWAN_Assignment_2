import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, ArrowUpRight } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';

export const HeroVisual: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[460px] lg:min-h-[540px] rounded-[36px] overflow-hidden bg-gradient-to-br from-[#EBF5FB] via-[#F4F9FC] to-[#FFFFFF] p-8 lg:p-12 flex items-center justify-center border border-primary/10">
      {/* Soft atmospheric radial glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#9ED2FC]/25 blur-3xl pointer-events-none" />

      {/* Floating Card Stack Mock */}
      <div className="relative w-full max-w-md flex flex-col gap-4 perspective-1000">
        {/* Top Mock: Active Task Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: [0.645, 0.045, 0.355, 1] }}
          className="relative bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-border shadow-[0_12px_32px_rgba(21,109,149,0.08)] transform hover:-translate-y-1 transition-transform"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <StatusBadge status="in_progress" />
            <PriorityBadge priority="high" />
          </div>
          <h4 className="text-base font-medium text-text-primary mb-1">
            Q4 Cloud Infrastructure Optimization
          </h4>
          <p className="text-xs text-text-secondary line-clamp-2 mb-4">
            Audit workload provisioning across Kubernetes pods and configure cluster auto-scaling.
          </p>
          <div className="flex items-center justify-between text-xs text-text-muted pt-3 border-t border-border">
            <div className="flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 stroke-[1.5] text-primary" />
              <span>Due in 2 days</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-medium flex items-center justify-center">
                ML
              </div>
              <span className="font-mono text-[11px] text-text-primary">Maya Lin</span>
            </div>
          </div>
        </motion.div>

        {/* Second Mock: Completed Mini Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.645, 0.045, 0.355, 1] }}
          className="relative bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-border shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Stripe Webhook Idempotency</p>
              <p className="text-xs text-text-muted font-mono">Completed today at 09:42</p>
            </div>
          </div>
          <StatusBadge status="completed" />
        </motion.div>

        {/* Third Mock: Donut & Metric Snapshot Widget */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.645, 0.045, 0.355, 1] }}
          className="relative bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-border shadow-[0_8px_24px_rgba(0,0,0,0.04)] flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            {/* SVG Donut Chart */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#E5E5E5" strokeWidth="3.5" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#156D95"
                  strokeWidth="3.5"
                  strokeDasharray="88"
                  strokeDashoffset="26"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute font-mono text-[10px] font-medium text-primary">70%</span>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-text-muted">Sprint Velocity</p>
              <p className="text-sm font-medium text-text-navy">24 of 34 tasks completed</p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-surface border border-border text-text-muted">
            <ArrowUpRight className="w-4 h-4 stroke-[1.5]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
