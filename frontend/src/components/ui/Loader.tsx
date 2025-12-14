import React from 'react';
import { cn } from '../../utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  fullScreen = false,
  text,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  };

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={cn(
                'animate-spin rounded-full border-4 border-gray-200',
                'border-t-green-600',
                sizeClasses[size],
                className
              )}
            />
            {text && (
              <p className="text-gray-600 text-sm font-medium animate-pulse">
                {text}
              </p>
            )}
          </div>
        );

      case 'dots':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex gap-2">
              <div
                className={cn(
                  'rounded-full bg-green-600 animate-bounce',
                  dotSizes[size]
                )}
                style={{ animationDelay: '0ms' }}
              />
              <div
                className={cn(
                  'rounded-full bg-green-600 animate-bounce',
                  dotSizes[size]
                )}
                style={{ animationDelay: '150ms' }}
              />
              <div
                className={cn(
                  'rounded-full bg-green-600 animate-bounce',
                  dotSizes[size]
                )}
                style={{ animationDelay: '300ms' }}
              />
            </div>
            {text && (
              <p className="text-gray-600 text-sm font-medium animate-pulse">
                {text}
              </p>
            )}
          </div>
        );

      case 'pulse':
        return (
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  'rounded-full bg-green-600 animate-ping absolute',
                  sizeClasses[size]
                )}
              />
              <div
                className={cn(
                  'rounded-full bg-green-600 relative',
                  sizeClasses[size]
                )}
              />
            </div>
            {text && (
              <p className="text-gray-600 text-sm font-medium animate-pulse">
                {text}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {renderLoader()}
        </div>
      </div>
    );
  }

  return <div className={cn('flex items-center justify-center', className)}>{renderLoader()}</div>;
};

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  );
};

// Card skeleton for loading states
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div className="flex items-start gap-4">
            <Skeleton variant="circular" className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </>
  );
};
