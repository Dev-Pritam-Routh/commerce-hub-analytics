
import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0-1, with 0 being no parallax and 1 being full parallax
  direction?: 'up' | 'down' | 'left' | 'right';
}

const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className,
  speed = 0.2,
  direction = 'up',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Determine transformation based on direction
  let transformValue;
  switch (direction) {
    case 'up':
      transformValue = useTransform(scrollYProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    case 'down':
      transformValue = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
    case 'left':
      transformValue = useTransform(scrollYProgress, [0, 1], ['0%', `-${speed * 100}%`]);
      break;
    case 'right':
      transformValue = useTransform(scrollYProgress, [0, 1], ['0%', `${speed * 100}%`]);
      break;
  }

  // Apply the proper transform property based on direction
  const isHorizontal = direction === 'left' || direction === 'right';
  const styleProps = isHorizontal 
    ? { x: transformValue } 
    : { y: transformValue };

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <motion.div 
        style={styleProps} 
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default ParallaxSection;
