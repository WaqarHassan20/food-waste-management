import React from 'react';
import { Leaf } from 'lucide-react';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'light' | 'dark' | 'color';
  className?: string;
  iconOnly?: boolean;
}

const sizeConfig = {
  xs: { icon: 16, text: 'text-sm', container: 'p-1.5' },
  sm: { icon: 20, text: 'text-base', container: 'p-2' },
  md: { icon: 24, text: 'text-xl', container: 'p-2' },
  lg: { icon: 32, text: 'text-2xl', container: 'p-2.5' },
  xl: { icon: 40, text: 'text-3xl', container: 'p-3' },
};

const variantConfig = {
  light: {
    iconBg: 'bg-emerald-100',
    iconBgHover: 'group-hover:bg-emerald-200',
    iconColor: 'text-emerald-600',
    textGradient: 'from-emerald-600 to-teal-600',
  },
  dark: {
    iconBg: 'bg-emerald-500/10',
    iconBgHover: 'group-hover:bg-emerald-500/20',
    iconColor: 'text-emerald-500',
    textGradient: 'from-emerald-400 to-teal-400',
  },
  color: {
    iconBg: 'bg-emerald-600',
    iconBgHover: 'group-hover:bg-emerald-700',
    iconColor: 'text-white',
    textGradient: 'from-emerald-600 to-teal-600',
  },
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  variant = 'light',
  className = '',
  iconOnly = false,
}) => {
  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];

  if (iconOnly) {
    return (
      <div
        className={`${sizeStyles.container} ${variantStyles.iconBg} ${variantStyles.iconBgHover} rounded-full transition-colors ${className}`}
      >
        <Leaf size={sizeStyles.icon} className={variantStyles.iconColor} />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <div
        className={`${sizeStyles.container} ${variantStyles.iconBg} ${variantStyles.iconBgHover} rounded-full transition-colors`}
      >
        <Leaf size={sizeStyles.icon} className={variantStyles.iconColor} />
      </div>
      {showText && (
        <span
          className={`${sizeStyles.text} font-bold bg-linear-to-r ${variantStyles.textGradient} bg-clip-text text-transparent`}
        >
          FoodShare
        </span>
      )}
    </div>
  );
};
