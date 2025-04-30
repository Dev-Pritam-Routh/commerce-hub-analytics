
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  className?: string;
  density?: number;
  speed?: number;
  dark?: boolean;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className = '',
  density = 15,
  speed = 1,
  dark = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const { clientX, clientY } = e;
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      // Calculate position percentage
      const x = clientX / width - 0.5;
      const y = clientY / height - 0.5;
      
      // Move elements based on mouse position
      const elements = containerRef.current.querySelectorAll('.floating-element');
      elements.forEach((el, i) => {
        const htmlEl = el as HTMLElement;
        const depth = Number(htmlEl.dataset.depth) || 1;
        const moveX = x * depth * 20 * speed;
        const moveY = y * depth * 20 * speed;
        htmlEl.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [speed]);
  
  // Generate random floating elements
  const floatingElements = Array.from({ length: density }, (_, i) => {
    const size = Math.random() * 80 + 10;
    const depth = Math.random() * 5 + 1;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const animationDelay = Math.random() * 5;
    const opacity = Math.random() * 0.15 + 0.05;
    
    return (
      <motion.div
        key={i}
        className="floating-element absolute rounded-full"
        data-depth={depth}
        style={{
          width: size + 'px',
          height: size + 'px',
          left: left + '%',
          top: top + '%',
          opacity: opacity,
          backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          animationDelay: animationDelay + 's'
        }}
        animate={{
          y: [0, 20, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 5 + Math.random() * 3,
          ease: "easeInOut",
        }}
      />
    );
  });
  
  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {floatingElements}
    </div>
  );
};

export default AnimatedBackground;
