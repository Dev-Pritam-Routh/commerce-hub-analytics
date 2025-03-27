
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const AssistantNavLink = () => {
  return (
    <Button variant="ghost" asChild className="flex items-center gap-1 hover:bg-primary/10">
      <Link to="/assistant">
        <Bot size={18} />
        <span className="ml-1">Assistant</span>
      </Link>
    </Button>
  );
};

export default AssistantNavLink;
