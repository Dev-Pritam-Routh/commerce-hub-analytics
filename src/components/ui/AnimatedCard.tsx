
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // 1-10, controls the intensity of the effect
  animate?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  depth = 5,
  animate = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  
  // Scale the effect based on depth parameter (1-10)
  const effectIntensity = depth * 0.4;
  
  useEffect(() => {
    const card = cardRef.current;
    if (!card || !animate) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      const rotateYValue = ((e.clientX - centerX) / (rect.width / 2)) * effectIntensity;
      const rotateXValue = ((e.clientY - centerY) / (rect.height / 2)) * -effectIntensity;
      
      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
    };
    
    const handleMouseLeave = () => {
      // Reset rotation when mouse leaves
      setRotateX(0);
      setRotateY(0);
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [effectIntensity, animate]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "transition-all duration-200 perspective-container",
        className
      )}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
