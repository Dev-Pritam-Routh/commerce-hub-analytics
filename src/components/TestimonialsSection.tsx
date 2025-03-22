import { useEffect, useState } from "react";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  role: string;
  content: string;
  rating: number;
  product: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    role: "Product Designer",
    content: "These products have completely transformed my daily routine. The quality is exceptional and the design is both functional and beautiful. Absolutely worth the investment!",
    rating: 5,
    product: "Smart Home Bundle"
  },
  {
    id: "2",
    name: "Mark Thompson",
    avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    role: "Tech Enthusiast",
    content: "I've tried many similar products on the market, but these stand out for their build quality and attention to detail. The customer service is also outstanding.",
    rating: 4,
    product: "Premium Headphones"
  },
  {
    id: "3",
    name: "Elena Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/47.jpg",
    role: "Interior Decorator",
    content: "The aesthetic appeal of these products is unmatched. They blend seamlessly into my home while providing all the functionality I need. Highly recommend!",
    rating: 5,
    product: "Modern Furniture Set"
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("testimonials");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Hear from our satisfied customers about their experience with our products.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto mt-12 glass-card p-2 rounded-2xl">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="min-w-full p-8 md:p-12"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="rounded-full w-20 h-20 object-cover border-4 border-white dark:border-slate-800 shadow-lg"
                      />
                    </div>
                    <div className={cn(
                      "flex-1",
                      isVisible ? "animate-fade-in" : "opacity-0"
                    )}>
                      <div className="flex items-center mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "w-4 h-4",
                              i < testimonial.rating
                                ? "text-gold-dark dark:text-gold-light fill-current"
                                : "text-slate-300 dark:text-slate-600"
                            )}
                          />
                        ))}
                        <span className="ml-2 text-sm font-medium text-gold-dark dark:text-gold-light">
                          for {testimonial.product}
                        </span>
                      </div>
                      <p className="text-lg md:text-xl italic mb-6 text-slate-700 dark:text-slate-200">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{testimonial.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              aria-label="Next testimonial"
            >
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === currentIndex 
                    ? "w-8 bg-gold dark:bg-gold-light" 
                    : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
