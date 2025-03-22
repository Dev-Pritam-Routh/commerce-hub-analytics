import { useEffect, useState } from "react";
import { Truck, Clock, Heart, Shield } from "lucide-react";

const features = [
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Free Shipping",
    description: "Free worldwide shipping on all orders over $100.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Warranty Protection",
    description: "12-month warranty on all our premium products.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "100% Authentic",
    description: "All our products are 100% authentic and ethically sourced.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Our customer support team is available around the clock.",
  },
];

// Utility function for class names
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

const AboutSection = () => {
  const [isVisible, setIsVisible] = useState(false);

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

    const element = document.getElementById("about");
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  return (
    <section id="about" className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={cn(
            isVisible ? "animate-slide-left" : "opacity-0"
          )}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold mb-4 sm:mb-6">
              Why Choose Our Products
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
              We're dedicated to providing you with the very best products, combining innovative design, quality materials, and exceptional craftsmanship. Our mission is to enhance your everyday life with products that are not only functional but also beautiful.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="p-4 sm:p-6 rounded-xl glass-card group hover:scale-[1.02] transition-all duration-300"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-3 sm:mb-4 text-primary dark:text-primary-light group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-900 dark:text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          
          <div className={cn(
            "relative h-[350px] sm:h-[400px] md:h-[450px] lg:h-full",
            isVisible ? "animate-fade-in" : "opacity-0"
          )}>
            <div className="absolute w-[90%] h-[90%] rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
                alt="Our Quality Products"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Keep the floating cards with the same positioning */}
            <div className="absolute top-[20%] right-0 transform rotate-12 p-4 sm:p-6 rounded-lg glass-card shadow-lg max-w-[180px] sm:max-w-[240px] z-10 animate-float" style={{ animationDelay: "1s" }}>
              <span className="block text-xs sm:text-sm text-slate-500 dark:text-slate-400">Customer satisfaction</span>
              <span className="text-xl sm:text-3xl font-bold text-primary dark:text-primary-light">97%</span>
            </div>
            
            <div className="absolute bottom-[15%] left-0 transform -rotate-6 p-4 sm:p-6 rounded-lg glass-card shadow-lg max-w-[180px] sm:max-w-[240px] z-10 animate-float" style={{ animationDelay: "2s" }}>
              <span className="block text-xs sm:text-sm text-slate-500 dark:text-slate-400">Premium quality</span>
              <span className="text-xl sm:text-3xl font-bold text-primary dark:text-primary-light">100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
