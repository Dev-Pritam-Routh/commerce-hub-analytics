
// Configuration for the application
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://commerce-hub-analytics.onrender.com/api',
  chatApiUrl: import.meta.env.VITE_CHAT_API_URL || 'http://localhost:5000',
};

export default config;
