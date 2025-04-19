export interface Product {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description?: string;
  images?: string[];
=======
=======
>>>>>>> Stashed changes
  product_id: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  description?: string;
  rating?: number;
  similarity?: number;
  images?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: Product[];
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
} 