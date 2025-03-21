
import React, { useContext } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ThemeContext } from "@/App";

interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: "blue" | "purple" | "pink" | "green" | "red" | "cyan" | "indigo" | "orange" | "yellow" | "teal";
  glassEffect?: boolean;
  hoverEffect?: boolean;
  children: React.ReactNode;
  isAnimated?: boolean;
  animationDelay?: number;
  variant?: "default" | "bordered" | "filled" | "glass" | "futuristic";
}

const GlowingCard = ({
  gradient = "blue",
  glassEffect = true,
  hoverEffect = true,
  className,
  children,
  isAnimated = false,
  animationDelay = 0,
  variant = "default",
  ...props
}: GlowingCardProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  const gradientClasses = {
    blue: isDarkMode ? "border-ai-blue/20 shadow-[0_0_15px_-3px_rgba(0,194,255,0.3)]" : "border-blue-200 bg-blue-50/50",
    purple: isDarkMode ? "border-ai-purple/20 shadow-[0_0_15px_-3px_rgba(181,78,255,0.3)]" : "border-purple-200 bg-purple-50/50",
    pink: isDarkMode ? "border-ai-fuchsia/20 shadow-[0_0_15px_-3px_rgba(255,0,229,0.3)]" : "border-pink-200 bg-pink-50/50",
    green: isDarkMode ? "border-ai-teal/20 shadow-[0_0_15px_-3px_rgba(0,208,185,0.3)]" : "border-emerald-200 bg-emerald-50/50",
    red: isDarkMode ? "border-ai-rose/20 shadow-[0_0_15px_-3px_rgba(255,82,134,0.3)]" : "border-rose-200 bg-rose-50/50",
    cyan: isDarkMode ? "border-ai-cyan/20 shadow-[0_0_15px_-3px_rgba(0,255,204,0.3)]" : "border-cyan-200 bg-cyan-50/50",
    indigo: isDarkMode ? "border-ai-indigo/20 shadow-[0_0_15px_-3px_rgba(123,97,255,0.3)]" : "border-indigo-200 bg-indigo-50/50",
    orange: isDarkMode ? "border-ai-orange/20 shadow-[0_0_15px_-3px_rgba(255,122,57,0.3)]" : "border-orange-200 bg-orange-50/50",
    yellow: isDarkMode ? "border-ai-yellow/20 shadow-[0_0_15px_-3px_rgba(255,214,0,0.3)]" : "border-yellow-200 bg-yellow-50/50",
    teal: isDarkMode ? "border-ai-teal/20 shadow-[0_0_15px_-3px_rgba(0,208,185,0.3)]" : "border-teal-200 bg-teal-50/50",
  };
  
  // Define gradient background for filled variant
  const gradientBgs = {
    blue: "bg-gradient-to-br from-ai-blue/10 to-ai-blue/5",
    purple: "bg-gradient-to-br from-ai-purple/10 to-ai-purple/5",
    pink: "bg-gradient-to-br from-ai-fuchsia/10 to-ai-fuchsia/5",
    green: "bg-gradient-to-br from-ai-teal/10 to-ai-teal/5",
    red: "bg-gradient-to-br from-ai-rose/10 to-ai-rose/5",
    cyan: "bg-gradient-to-br from-ai-cyan/10 to-ai-cyan/5",
    indigo: "bg-gradient-to-br from-ai-indigo/10 to-ai-indigo/5",
    orange: "bg-gradient-to-br from-ai-orange/10 to-ai-orange/5",
    yellow: "bg-gradient-to-br from-ai-yellow/10 to-ai-yellow/5",
    teal: "bg-gradient-to-br from-ai-teal/10 to-ai-teal/5",
  };
  
  const variantClasses = {
    default: cn(
      "rounded-xl p-4",
      isDarkMode 
        ? "bg-surface-dark border border-white/5" 
        : "bg-white border border-gray-200/80",
      hoverEffect && "transition-all duration-300 hover:shadow-lg",
      isDarkMode && hoverEffect && "hover:bg-surface-dark-hover hover:border-white/10"
    ),
    bordered: cn(
      "rounded-xl p-4",
      isDarkMode 
        ? `bg-surface-dark ${gradientClasses[gradient]}` 
        : `${gradientClasses[gradient]}`,
      hoverEffect && "transition-all duration-300",
      isDarkMode && hoverEffect && "hover:bg-surface-dark-hover"
    ),
    filled: cn(
      "rounded-xl p-4",
      isDarkMode 
        ? cn("border border-white/5", gradientBgs[gradient]) 
        : cn("border border-gray-200/80", gradientBgs[gradient]),
      hoverEffect && "transition-all duration-300 hover:shadow-lg",
      isDarkMode && hoverEffect && "hover:bg-surface-dark-hover hover:border-white/10"
    ),
    glass: cn(
      "rounded-xl p-4 glassmorphism",
      isDarkMode 
        ? "border-white/5" 
        : "border-gray-200/80",
      hoverEffect && "transition-all duration-300 hover:shadow-lg",
      isDarkMode && hoverEffect && "hover:border-white/10 hover:-translate-y-1"
    ),
    futuristic: cn(
      "rounded-xl p-4 relative overflow-hidden",
      isDarkMode 
        ? "bg-surface-dark border border-white/5" 
        : "bg-white border border-gray-200/80",
      hoverEffect && "transition-all duration-300 hover:shadow-lg",
      isDarkMode && hoverEffect && "hover:bg-surface-dark-hover hover:border-white/10"
    )
  };
  
  const content = (
    <div
      className={cn(
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {variant === 'futuristic' && (
        <div className="absolute inset-0 overflow-hidden">
          <div className="cyber-grid w-full h-full opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
  
  if (isAnimated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: animationDelay,
          ease: [0.25, 0.1, 0.25, 1]
        }}
      >
        {content}
      </motion.div>
    );
  }
  
  return content;
};

export default GlowingCard;
