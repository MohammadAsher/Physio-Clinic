'use client';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  onClick?: () => void;
  showTagline?: boolean;
}

export default function Logo({ className = '', width = 140, height = 48, onClick, showTagline = true }: LogoProps) {
  return (
    <div 
      className={`flex flex-col ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width, height }}
      onClick={onClick}
    >
      <h1 
        className="text-lg md:text-xl font-bold text-white tracking-wider leading-tight"
        style={{ 
          fontSize: height ? height * 0.35 : 14,
          letterSpacing: '0.15em',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        BODY EXPERTS
      </h1>
      {showTagline && (
        <span 
          className="text-[10px] md:text-xs text-rose-400 font-bold tracking-wider leading-tight"
          style={{ 
            fontSize: height ? height * 0.15 : 8,
            letterSpacing: '0.2em',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          DEAR PAIN! LET'S BREAKUP
        </span>
      )}
    </div>
  );
}