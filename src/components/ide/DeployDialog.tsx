import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Rocket, Globe, Zap, CheckCircle2, Loader2, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DeployDialog({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'idle' | 'deploying' | 'success'>('idle');
  
  const handleDeploy = () => {
    setStatus('deploying');
    
    // Mock deployment sequence
    setTimeout(() => {
      setStatus('success');
    }, 4000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="bg-[#0a0a0c] border border-white/[0.06] text-white p-0 overflow-hidden max-w-md">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Rocket className="w-5 h-5 text-violet-400" />
              Deploy to Production
            </DialogTitle>
            <DialogDescription className="text-[var(--text-muted)] text-sm">
              Push your Polyglot workspace directly to Vercel&apos;s global edge network.
            </DialogDescription>
          </DialogHeader>

          {status === 'idle' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-sky-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Global Edge Network</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Instant deployments across the world</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white">Next.js Optimized</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Automatic build configs and caching</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleDeploy}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-[0_4px_14px_rgba(124,110,248,0.3)] hover:shadow-[0_6px_20px_rgba(124,110,248,0.4)]"
              >
                Deploy Now <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {status === 'deploying' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
              <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Deploying to Vercel</p>
                <p className="text-xs text-[var(--text-muted)] animate-pulse mt-1">Building Next.js application...</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Deployment Complete!</p>
                <a href="#" className="text-xs text-sky-400 hover:underline flex items-center justify-center gap-1">
                  https://polyglot-app-h78f.vercel.app <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <button 
                onClick={() => setStatus('idle')}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2.5 rounded-lg transition-colors mt-2"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
