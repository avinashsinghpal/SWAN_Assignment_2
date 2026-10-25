import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondary-inverted' | 'tertiary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    let variantStyles = 'btn-primary';
    if (variant === 'secondary') variantStyles = 'btn-secondary';
    if (variant === 'secondary-inverted') variantStyles = 'btn-secondary-inverted';
    if (variant === 'tertiary') variantStyles = 'btn-tertiary';
    if (variant === 'ghost') variantStyles = 'bg-transparent text-text-primary hover:bg-black/5';
    if (variant === 'danger') variantStyles = 'bg-danger text-white hover:bg-danger/90';

    let sizeStyles = 'px-5 py-2.5 text-sm';
    if (size === 'sm') sizeStyles = 'px-3.5 py-1.5 text-xs';
    if (size === 'lg') sizeStyles = 'px-7 py-3 text-base';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'btn-pill relative outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantStyles,
          sizeStyles,
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin stroke-[1.5]" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
