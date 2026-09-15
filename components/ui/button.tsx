"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cozy-sand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-cozy-teal text-white shadow-cozy hover:bg-cozy-teal/90 hover:-translate-y-[1px]",
        destructive:
          "bg-cozy-terracotta text-white shadow-sm hover:bg-cozy-terracotta/90",
        outline:
          "border-2 border-cozy-sand/50 bg-white/70 text-cozy-ink shadow-sm hover:bg-cozy-sand/20 hover:text-cozy-ink backdrop-blur",
        secondary:
          "bg-cozy-sand/40 text-cozy-ink shadow-sm hover:bg-cozy-sand/60",
        ghost:
          "text-cozy-ink hover:bg-cozy-sand/30 hover:text-cozy-ink",
        link: "text-cozy-teal underline-offset-4 hover:underline",
        sunset:
          "bg-gradient-to-r from-cozy-terracotta via-cozy-orange to-cozy-sand text-cozy-ink shadow-cozy border border-white/40 hover:brightness-105 hover:shadow-glow hover:-translate-y-[1px]",
        sand:
          "bg-cozy-sand/70 text-cozy-ink shadow-soft hover:bg-cozy-sand",
        teal:
          "bg-cozy-teal/15 text-cozy-teal hover:bg-cozy-teal/25 border border-cozy-teal/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-full px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
