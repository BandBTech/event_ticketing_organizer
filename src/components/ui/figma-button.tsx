'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const figmaButtonVariants = cva(
  "inline-flex items-center justify-center gap-3 rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 pointer-cursor",
  {
    variants: {
      variant: {
        primary: [
          "bg-[#254DDA] text-[#F9FAFB]",
          "border border-white/5",
          "shadow-[0px_10px_10px_0px_rgba(0,0,0,0.1),0px_4px_4px_0px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.05)]",
          "backdrop-blur-[20px]",
          "hover:bg-[#1e3db8] hover:shadow-[0px_15px_15px_0px_rgba(0,0,0,0.15),0px_6px_6px_0px_rgba(0,0,0,0.08),0px_2px_0px_0px_rgba(0,0,0,0.08)]",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-white/5 before:via-transparent before:to-white/20 before:opacity-100"
        ],
        glass: [
          "bg-white/60 text-black",
          "border border-gray-900/10",
          "backdrop-blur-[20px]",
          "shadow-[0px_8px_8px_0px_rgba(0,0,0,0.05),0px_4px_4px_0px_rgba(0,0,0,0.05),0px_1px_0px_0px_rgba(0,0,0,0.03)]",
          "hover:bg-white/80 hover:shadow-lg"
        ],
        outline: [
          "bg-transparent text-gray-700",
          "border border-gray-200",
          "hover:bg-gray-50 hover:text-gray-900"
        ]
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-2.5 text-base",
        xl: "px-5 py-2.5 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface FigmaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof figmaButtonVariants> {
  asChild?: boolean;
  showGlow?: boolean;
}

const FigmaButton = React.forwardRef<HTMLButtonElement, FigmaButtonProps>(
  ({ className, variant, size, asChild = false, showGlow = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <div className="relative inline-flex">
        <Comp
          className={cn(figmaButtonVariants({ variant, size, className }), "cursor-pointer relative z-10")}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
        
        {/* Glow Effect for Primary Buttons */}
        {showGlow && variant === 'primary' && (
          <div className="absolute -inset-2.5 bg-gradient-conic from-[rgba(66,232,255,0)] via-[rgba(255,126,171,0.5)] to-[rgba(113,71,255,1)] rounded-[10px] opacity-20 blur-[20px] -z-10" />
        )}
      </div>
    );
  }
);

FigmaButton.displayName = 'FigmaButton';

export { FigmaButton, figmaButtonVariants };
