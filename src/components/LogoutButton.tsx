'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, AlertTriangle } from 'lucide-react';

export default function LogoutButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-ink/60 hover:text-ink transition-colors border-2 border-transparent hover:border-ink/10 rounded"
      >
        <LogOut className="w-4 h-4" />
        Close Ledger
      </button>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotate: 2 }}
              className="relative w-full max-w-sm bg-paper-yellow p-8 shadow-2xl rough-edge border-2 border-yellow-600/20 text-ink"
              style={{ backgroundImage: 'url("https:
            >
              <button 
                onClick={() => setShowConfirm(false)}
                className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="bg-yellow-600/10 p-3 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-yellow-700" />
                </div>
                
                <h3 className="font-serif text-2xl font-bold italic">Seal the Ledger?</h3>
                
                <p className="font-serif text-ink/70 leading-relaxed">
                  Are you sure you wish to close the current financial session? All archived specimens will remain safe.
                </p>

                <div className="flex w-full gap-4 pt-4">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-3 border-2 border-ink/10 font-mono text-sm hover:bg-ink/5 transition-colors uppercase tracking-widest"
                  >
                    Stay
                  </button>
                  <button
                    onClick={() => {
                      
                      window.location.href = '/';
                    }}
                    className="flex-1 py-3 bg-ink text-paper-light font-mono text-sm hover:bg-ink/90 transition-all uppercase tracking-widest shadow-lg"
                  >
                    Seal
                  </button>
                </div>
              </div>

              {/* Sticky note "tape" effect */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm -rotate-1 shadow-sm border border-white/20" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
