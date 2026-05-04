import { motion } from 'framer-motion';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string;
  gradientOverlay?: string;
  hoverScale?: number;
  onClick?: () => void;
}

const PremiumCard = ({
  children,
  className = '',
  backgroundImage,
  gradientOverlay = 'linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.95) 100%)',
  hoverScale = 1.08,
  onClick,
}: PremiumCardProps) => {
  const defaultBackgrounds = {
    finance: 'https://images.unsplash.com/photo-1636814153505-9de267297d93?w=800&q=80',
    medical: 'https://images.unsplash.com/photo-1576669801945-7a346954da5a?w=800&q=80',
    clinical: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80',
    document: 'https://images.unsplash.com/photo-1586983690570-5c6ddc6d9c68?w=800&q=80',
    default: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
  };

  const getBackgroundImage = () => {
    if (backgroundImage) return backgroundImage;
    if (className.includes('finance')) return defaultBackgrounds.finance;
    if (className.includes('medical')) return defaultBackgrounds.medical;
    if (className.includes('clinical')) return defaultBackgrounds.clinical;
    if (className.includes('document')) return defaultBackgrounds.document;
    return defaultBackgrounds.default;
  };

  return (
    <motion.div
      className={`premium-card relative overflow-hidden group cursor-pointer ${className}`}
      whileHover={{ scale: hoverScale }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      onClick={onClick}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
        }}
      />
      
      {/* Dark Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: gradientOverlay,
        }}
      />
      
      {/* Subtle Border */}
      <div className="absolute inset-0 border border-white/10 opacity-50 group-hover:opacity-100 group-hover:border-cyan-400/30 transition-all duration-500" />
      
      {/* Content Container with Glass Blur */}
      <div className="relative z-10 h-full backdrop-blur-[5px] bg-white/5">
        {children}
      </div>
    </motion.div>
  );
};

export default PremiumCard;