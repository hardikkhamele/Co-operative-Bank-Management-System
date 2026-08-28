import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable LoadingButton component.
 * Prevents Cumulative Layout Shift by preserving its sizing while showing an inline spinner.
 */
const LoadingButton = ({
  children,
  loading = false,
  loadingText,
  disabled = false,
  icon: Icon,
  className = '',
  spinnerSize = 16,
  type = 'button',
  onClick,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Loader2 size={spinnerSize} className="animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </span>
      ) : (
        <span className="inline-flex items-center justify-center gap-2">
          {Icon && <Icon size={spinnerSize} className="shrink-0" />}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};

export default LoadingButton;
