
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface QuickPromptButtonProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

const QuickPromptButton = ({ prompt, onClick }: QuickPromptButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        variant="outline" 
        className="w-full text-left justify-start p-4 h-auto whitespace-normal hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
        onClick={() => onClick(prompt)}
      >
        {prompt}
      </Button>
    </motion.div>
  );
};

export default QuickPromptButton;
