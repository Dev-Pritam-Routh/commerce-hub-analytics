
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AssistantPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to localhost:3000
    window.location.href = 'http://localhost:3000';
  }, []);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Redirecting to assistant...</p>
    </div>
  );
};

export default AssistantPage;
