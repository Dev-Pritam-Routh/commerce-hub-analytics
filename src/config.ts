// Configuration for the application
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://commerce-hub-analytics.onrender.com/api',
  assistantApiUrl: import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:5000',
  imageSearchEndpoint: '/chat/message', // Endpoint for image search
  chatEndpoints: {
    getSessions: '/chat/sessions',
    createSession: '/chat/session',
    getHistory: '/chat/history',
    sendMessage: '/chat/message'
  }
};

export default config;
