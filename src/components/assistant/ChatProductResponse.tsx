import { Product } from '@/types';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChatProductResponseProps {
  products: Product[];
  className?: string;
}

const ChatProductResponse = ({ products, className }: ChatProductResponseProps) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {products.map((product) => (
        <Card key={product.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex flex-col gap-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">${product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ChatProductResponse; 