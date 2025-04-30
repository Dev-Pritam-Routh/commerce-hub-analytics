
import React from 'react';
import { motion } from 'framer-motion';

interface QuickPromptButtonProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

const QuickPromptButton: React.FC<QuickPromptButtonProps> = ({ prompt, onClick }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-3 border border-slate-700/60 rounded-xl text-left text-sm text-slate-300 hover:bg-slate-700/30 transition-colors bg-slate-800/50 backdrop-blur-md"
      onClick={() => onClick(prompt)}
    >
      {prompt}
    </motion.button>
  );
};

export default QuickPromptButton;
