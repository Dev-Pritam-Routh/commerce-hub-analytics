import { Button } from "@/components/ui/button";
import { Plus, MessageCircle, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import ThemeToggle from "../ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  lastMessage?: string;
}

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectSession: (selectedSessionId: string) => void;
  onLoadHistory: () => Promise<void>;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
}

interface ConversationProps {
  title: string;
  date: string;
  isActive?: boolean;
  onClick: () => void;
}

const ConversationItem = ({ title, date, isActive, onClick }: ConversationProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, "MMM d");
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ scale: 1.01 }}
      className={`p-3 rounded-md cursor-pointer mb-1.5 transition-colors ${
        isActive
          ? "bg-[#9b87f5]/20 dark:bg-[#9b87f5]/20 border border-[#9b87f5]/30"
          : "hover:bg-slate-800/50"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className={`h-4 w-4 ${isActive ? 'text-[#9b87f5]' : 'text-slate-400'}`} />
          <span className={`font-medium truncate ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
            {title}
          </span>
        </div>
        <span className="text-xs text-slate-500">
          {formatDate(date)}
        </span>
      </div>
    </motion.div>
  );
};

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  onSelectSession,
  onLoadHistory,
  isSidebarOpen,
  toggleSidebar,
  sessions,
  currentSessionId
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: isSidebarOpen ? 0 : -300 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen w-[280px] bg-[#1A1F2C]/95 backdrop-blur-md z-50 border-r border-slate-700/50"
    >
      <div className="flex flex-col h-full px-3 py-4">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-medium text-slate-200">Conversations</h2>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full mb-6 bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {sessions.map((session) => (
            <ConversationItem
              key={session.id}
              title={session.title}
              date={session.timestamp}
              isActive={session.id === currentSessionId}
              onClick={() => onSelectSession(session.id)}
            />
          ))}
        </div>

        <Button
          onClick={onLoadHistory}
          variant="ghost"
          size="sm"
          className="mt-auto text-slate-400 hover:text-slate-200 mx-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Load More
        </Button>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
