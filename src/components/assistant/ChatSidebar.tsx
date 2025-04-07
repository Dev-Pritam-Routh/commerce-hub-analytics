
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, History } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatSidebarProps {
  onNewChat: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  onLoadHistory: () => void;
}

interface ConversationProps {
  title: string;
  date: string;
  isActive?: boolean;
  onClick: () => void;
}

const ConversationItem = ({ title, date, isActive, onClick }: ConversationProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01 }}
    className={`p-3 rounded-md cursor-pointer mb-1 transition-colors ${
      isActive
        ? "bg-gold-light/20 dark:bg-gold-dark/20"
        : "hover:bg-accent"
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-3">
      <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <div className="font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{date}</div>
      </div>
    </div>
  </motion.div>
);

const ChatSidebar = ({ onNewChat, isSidebarOpen, toggleSidebar, onLoadHistory }: ChatSidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? (isMobile ? "100%" : "320px") : "0px" }}
      className={`fixed top-0 left-0 z-40 h-screen bg-background border-r transition-all overflow-hidden ${
        isMobile && isSidebarOpen ? "pt-16" : "pt-24 md:pt-28"
      }`}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gold">Shopping Assistant</h2>
          <ThemeToggle />
        </div>

        <div className="space-y-2 mb-4">
          <Button
            className="w-full bg-gold hover:bg-gold-dark text-black"
            onClick={onNewChat}
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          
          <Button
            className="w-full bg-slate-100 hover:bg-slate-200 text-black dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
            onClick={onLoadHistory}
            variant="outline"
          >
            <History className="mr-2 h-4 w-4" /> Load History
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          <ConversationItem
            title="New Conversation"
            date="Today"
            isActive={true}
            onClick={() => {}}
          />
          {/* More conversation items would go here */}
        </div>
      </div>
    </motion.aside>
  );
};

export default ChatSidebar;
