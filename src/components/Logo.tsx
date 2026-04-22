'use client';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export default function Logo({ className = '', width = 140, height = 48, onClick }: LogoProps) {
  return (
    <img
      src="/_MConverter.eu_body-expert-header-logo-1-1.webp.bv_resized_mobile.webp.bv.png"
      alt="Body Experts"
      className={`${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width, height, objectFit: 'contain' }}
      onClick={onClick}
    />
  );
}