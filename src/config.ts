
// Configuration for the application
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://commerce-hub-analytics.onrender.com/api',
  assistantApiUrl: import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:5000',
  chatEndpoints: {
    createSession: '/api/chat/session',
    sendMessage: '/api/chat/message',
    getHistory: '/api/chat/history',
    getSessions: '/api/chat/sessions',
  }
};

export default config;
