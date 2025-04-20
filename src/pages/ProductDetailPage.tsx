import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Heart, ShoppingCart, Share2, Star, Truck, Shield, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ReviewItem } from '@/components/ReviewItem';
import { getProductById } from '@/services/productService';
import { getProductReviews } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { cn } from '@/lib/utils';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlistState, setIsInWishlistState] = useState(false);

  // Fetch product details
  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  // Fetch product reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['productReviews', id],
    queryFn: () => getProductReviews(id as string),
    enabled: !!id,
  });

  // Check if product is in wishlist
  useEffect(() => {
    if (product) {
      setIsInWishlistState(isInWishlist(product._id));
    }
  }, [product, isInWishlist]);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    const sellerId = typeof product.seller === 'object' ? product.seller._id : product.seller;
    
    addToCart({
      id: product._id,
      name: product.name,
      price: product.discountedPrice || product.price,
      image: product.images[0],
      quantity: 1,
      stock: product.stock,
      sellerId: sellerId
    });
    
    toast.success(`${product.name} added to your cart`);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = () => {
    if (!product) return;
    
    if (isInWishlistState) {
      removeFromWishlist(product._id);
      setIsInWishlistState(false);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
      });
      setIsInWishlistState(true);
      toast.success('Added to wishlist');
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity: number) => {
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle image navigation
  const handlePrevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  // Calculate discount percentage
  const calculateDiscountPercentage = () => {
    if (!product || !product.discountedPrice || product.discountedPrice >= product.price) return 0;
    return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  };

  // Loading state
  if (isLoadingProduct) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-8">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/products')}>Browse Products</Button>
      </div>
    );
  }

  // Format seller name
  const sellerName = typeof product.seller === 'object' ? product.seller.name : 'Marketplace Seller';

  // Discount percentage
  const discountPercentage = calculateDiscountPercentage();

  return (
    <>
      <Helmet>
        <title>{product.name} | Your Marketplace</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/')}>Home</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-foreground cursor-pointer" onClick={() => navigate('/products')}>Products</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="hover:text-foreground cursor-pointer" onClick={() => navigate(`/products?category=${product.category}`)}>{product.category}</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={product.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-black/50 rounded-full"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
              
              {discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "cursor-pointer rounded-md overflow-hidden w-20 h-20 flex-shrink-0 border-2",
                      index === currentImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-gray-300"
                    )}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < Math.round(product.averageRating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({product.averageRating.toFixed(1)})
                  </span>
                </div>
                
                <Separator orientation="vertical" className="h-5" />
                
                <span className="text-sm text-muted-foreground">
                  {product.numReviews} {product.numReviews === 1 ? 'Review' : 'Reviews'}
                </span>
                
                {product.stock > 0 ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Out of Stock
                  </Badge>
                )}
              </div>
              
              <div className="flex items-baseline space-x-3 mb-4">
                {discountPercentage > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-primary">
                      ${product.discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>
              
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="h-10 w-10 rounded-none"
                  >
                    -
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="h-10 w-10 rounded-none"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.stock} units available
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWishlistToggle}
                  className={isInWishlistState ? "text-red-500" : ""}
                >
                  <Heart
                    className="mr-2 h-5 w-5"
                    fill={isInWishlistState ? "currentColor" : "none"}
                  />
                  {isInWishlistState ? "In Wishlist" : "Add to Wishlist"}
                </Button>
                
                <Button variant="outline" size="icon" className="hidden sm:flex">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <div className="flex items-start">
                <Truck className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Free Shipping</h4>
                  <p className="text-sm text-muted-foreground">Free standard shipping on orders over $50</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">Your payment information is processed securely</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <RotateCcw className="h-5 w-5 mr-3 text-muted-foreground" />
                <div>
                  <h4 className="font-medium">30-Day Returns</h4>
                  <p className="text-sm text-muted-foreground">Return or exchange items within 30 days</p>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="font-medium mb-2">Sold by</h3>
              <div className="flex items-center justify-between">
                <span>{sellerName}</span>
                <Button variant="link" onClick={() => navigate(`/seller/${typeof product.seller === 'object' ? product.seller._id : product.seller}`)}>
                  View Store
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({product.numReviews})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <div className="prose dark:prose-invert max-w-none">
              <p>{product.description}</p>
              <ul>
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications?.map((spec, index) => (
                <div key={index} className="flex border-b pb-2">
                  <span className="font-medium w-1/3">{spec.name}</span>
                  <span className="w-2/3">{spec.value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Customer Reviews</h3>
                <Button onClick={() => navigate(`/products/${product._id}/review`, { state: { productName: product.name } })}>
                  Write a Review
                </Button>
              </div>
              
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24 mt-1" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewItem key={review._id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h4 className="text-lg font-medium mb-2">No reviews yet</h4>
                  <p className="text-muted-foreground mb-6">Be the first to review this product</p>
                  <Button onClick={() => navigate(`/products/${product._id}/review`, { state: { productName: product.name } })}>
                    Write a Review
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.relatedProducts?.slice(0, 4).map((relatedProduct, index) => (
              <ProductCard
                key={relatedProduct._id}
                id={relatedProduct._id}
                name={relatedProduct.name}
                price={relatedProduct.price}
                image={relatedProduct.image}
                rating={relatedProduct.rating}
                category={relatedProduct.category}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
