
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Set initial theme based on saved preference or system preference
    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  // Don't render until we've determined the initial theme
  if (isDark === undefined) return null;

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
        "bg-slate-800/50 hover:bg-slate-700 dark:bg-slate-700/50 dark:hover:bg-slate-600",
        "text-slate-300 dark:text-slate-200",
        "focus:outline-none focus:ring-2 focus:ring-[#9b87f5] dark:focus:ring-[#9b87f5]/70",
        "relative overflow-hidden"
      )}
      whileTap={{ scale: 0.95 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 0 : 360,
          scale: 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 15 
        }}
      >
        {isDark ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </motion.div>
      
      <motion.div 
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: isDark 
            ? "rgba(30, 41, 59, 0)" 
            : "rgba(156, 135, 245, 0)",
          scale: [1, 1.15, 1]
        }}
        transition={{
          duration: 0.3,
          times: [0, 0.5, 1]
        }}
      />
    </motion.button>
  );
};

export default ThemeToggle;
