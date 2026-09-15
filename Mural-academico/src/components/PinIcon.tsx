import React from 'react';

interface PinIconProps {
  size?: number;
  variant?: 'light' | 'dark';
  className?: string;
}

export const PinIcon: React.FC<PinIconProps> = ({
  size = 24,
  variant = 'light',
  className = '',
}) => {
  const isLight = variant === 'light';
  const bgColor = isLight ? '#FAF7F0' : '#1F3B32';
  const pinBodyColor = isLight ? '#1F3B32' : '#FAF7F0';
  const pinDotColor = '#C1443A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <rect x="4" y="4" width="44" height="44" rx="8" fill={bgColor} />
      <circle cx="26" cy="20" r="7" fill={pinBodyColor} />
      <rect
        x="24"
        y="26"
        width="4"
        height="16"
        rx="2"
        fill={pinBodyColor}
        transform="rotate(8 26 26)"
      />
      <circle cx="26" cy="20" r="2.8" fill={pinDotColor} />
    </svg>
  );
};

