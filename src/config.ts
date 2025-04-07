
// Configuration for the application
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'https://commerce-hub-analytics.onrender.com/api',
  assistantApiUrl: import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:5000/api',
  imageSearchEndpoint: "/chat/message", // Adding image search endpoint
};

export default config;
