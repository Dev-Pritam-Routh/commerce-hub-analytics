export interface Product {
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
  type?: string;
  productIds?: string[];
} 