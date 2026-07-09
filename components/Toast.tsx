"use client";

import { AnimatePresence, motion } from "framer-motion";

export function Toast({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-orange text-[#1A140A] font-bold text-sm px-6 py-3 rounded-full shadow-glow z-50"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
