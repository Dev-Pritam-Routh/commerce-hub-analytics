import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, RotateCcw } from "lucide-react";
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

const ConversationItem = ({ title, date, isActive, onClick }: ConversationProps) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    whileHover={{ scale: 1.01 }}
    className={`p-3 rounded-md cursor-pointer mb-1 transition-colors ${
      isActive
        ? "bg-gold-light/20 dark:bg-gold-dark/20"
        : "hover:bg-muted"
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium truncate">{title}</span>
      </div>
      <span className="text-xs text-muted-foreground">
        {format(new Date(date), "MMM d")}
      </span>
    </div>
  </motion.div>
);

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
      className={`fixed left-0 top-0 h-screen w-[300px] bg-background border-r ${
        isMobile ? "z-50" : ""
      }`}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-8 w-8"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Button
          onClick={onNewChat}
          className="w-full mb-4"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>

        <div className="flex-1 overflow-y-auto">
          {/* Chat history items will go here */}
        </div>

        <Button
          onClick={onLoadHistory}
          variant="ghost"
          className="mt-auto"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Load More
        </Button>
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
