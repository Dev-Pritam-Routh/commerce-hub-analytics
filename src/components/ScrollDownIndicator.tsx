import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface ScrollDownIndicatorProps {
  targetId: string;
}

const ScrollDownIndicator = ({ targetId }: ScrollDownIndicatorProps) => {
  const scrollToTarget = () => {
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div 
      className="flex justify-center mt-8 mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <motion.button
        onClick={scrollToTarget}
        className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        aria-label="Scroll down"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.button>
    </motion.div>
  );
};

export default ScrollDownIndicator;

