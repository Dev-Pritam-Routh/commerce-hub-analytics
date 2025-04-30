
export interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  images: string[];
  averageRating: number;
  stock: number;
  category: string;
  seller: string | { _id: string; name: string };
  description?: string;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
  sellerId?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referenced_products?: Product[];
  type?: string;
  productIds?: string[];
}

export interface ChatMessageResponse {
  message: string;
  intent: string;
  product_id: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
}

export interface SearchResponse {
  products: Product[];
}

export interface ProductResponse {
  success: boolean;
  product: Product | null;
  error?: string;
} 
