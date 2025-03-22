import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast.success("Thank you for subscribing to our newsletter!");
    }, 1000);
  };

  return (
    <section className="py-16 px-6 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-slate-100/10 dark:from-gold/10 dark:to-slate-900/30"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full filter blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Stay Connected
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Subscribe to our newsletter to receive updates on new products, special offers, and lifestyle tips.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 py-3 px-4 rounded-l-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold dark:focus:ring-gold-light"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="py-3 px-6 rounded-r-lg bg-gold dark:bg-gold-light text-white dark:text-slate-900 font-medium hover:bg-gold-dark dark:hover:bg-gold transition-colors duration-300 flex items-center disabled:opacity-70"
            >
              {isLoading ? "Subscribing..." : "Subscribe"}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 text-center">
            By subscribing, you agree to our <a href="#" className="underline hover:text-slate-900 dark:hover:text-white">Privacy Policy</a> and <a href="#" className="underline hover:text-slate-900 dark:hover:text-white">Terms of Service</a>.
          </p>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
