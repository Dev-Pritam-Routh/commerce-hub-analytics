import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/productService';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '@/contexts/CartContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { getProductReviews, Review } from '@/services/reviewService';
import { Helmet } from 'react-helmet-async';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => getProductById(id as string),
    retry: false,
  });

  const handleAddToCart = () => {
    if (product) {
    addToCart(product._id); // Make sure we're passing only the product ID
    toast.success(`${product.name} added to cart`);
  }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600">
            The product you are looking for does not exist.
          </p>
          <Link to="/products" className="text-blue-500 hover:underline mt-2 block">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Helmet>
        <title>{product.name} - CommerceHub</title>
        <meta name="description" content={product.name} />
      </Helmet>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-auto rounded-lg shadow-md"
          />
          <div className="mt-4 flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${product.name} - ${index + 1}`}
                className="w-20 h-20 rounded-md object-cover cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center gap-4 mb-4">
            <span className="font-bold text-xl">
              ${product.discountedPrice || product.price}
            </span>
            {product.discountedPrice && (
              <span className="text-gray-500 line-through">${product.price}</span>
            )}
          </div>
          <p className="text-gray-700 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>

          <div className="flex flex-col gap-4 mb-6">
            <Button onClick={handleAddToCart} className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button variant="outline" className="w-full">
              Add to Wishlist
            </Button>
          </div>

          {/* Accordion for additional details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger>Description</AccordionTrigger>
              <AccordionContent>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="details">
              <AccordionTrigger>Details</AccordionTrigger>
              <AccordionContent>
                <ul>
                  <li>Category: {product.category}</li>
                  <li>Stock: {product.stock}</li>
                  <li>Seller: {typeof product.seller === 'string' ? product.seller : product.seller.name}</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping Information</AccordionTrigger>
              <AccordionContent>
                We ship worldwide! Delivery times vary based on location.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        <Button onClick={() => setIsReviewFormOpen(true)}>Add a Review</Button>
        {isReviewFormOpen && (
          <ReviewForm
            productId={product._id}
            onClose={() => setIsReviewFormOpen(false)}
          />
        )}
        <ReviewList productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
