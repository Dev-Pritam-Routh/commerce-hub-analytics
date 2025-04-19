export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  description?: string;
  images?: string[];
} 