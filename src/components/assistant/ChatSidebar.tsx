<<<<<<< Updated upstream

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
=======
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
>>>>>>> Stashed changes

interface ChatSidebarProps {
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onLoadHistory: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
<<<<<<< Updated upstream
  sessions: ChatSession[];
  currentSessionId: string | null;
}

interface ConversationProps {
  id: string;
  title: string;
  date: string;
  isActive?: boolean;
  onClick: () => void;
}

const ConversationItem = ({ id, title, date, isActive, onClick }: ConversationProps) => (
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

const ChatSidebar = ({ 
  onNewChat, 
  onSelectSession,
  onLoadHistory,
  isSidebarOpen, 
  toggleSidebar,
  sessions,
  currentSessionId
}: ChatSidebarProps) => {
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

        <div className="flex space-x-2 mb-4">
          <Button
            className="flex-1 bg-gold hover:bg-gold-dark text-black"
            onClick={onNewChat}
          >
            <Plus className="mr-2 h-4 w-4" /> New Chat
          </Button>
          
          <Button
            variant="outline"
            onClick={onLoadHistory}
            title="Load chat history"
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Load History</span>
          </Button>
        </div>

        <div className="overflow-y-auto flex-1">
          {sessions.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              No previous conversations
            </div>
          ) : (
            sessions.map((session) => (
              <ConversationItem
                key={session.id}
                id={session.id}
                title={session.title || "New Conversation"}
                date={format(new Date(session.timestamp), "MMM d, yyyy")}
                isActive={session.id === currentSessionId}
                onClick={() => onSelectSession(session.id)}
              />
            ))
          )}
        </div>
      </div>
    </motion.aside>
=======
  onLoadHistory: () => Promise<void>;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  onNewChat,
  isSidebarOpen,
  toggleSidebar,
  onLoadHistory
}) => {
  return (
    <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r transition-transform duration-300 z-40 ${
      isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full mb-4"
          variant="outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <Button
          onClick={onLoadHistory}
          className="w-full"
          variant="ghost"
        >
          Load History
        </Button>
      </div>
    </div>
>>>>>>> Stashed changes
  );
};

export default ChatSidebar;
