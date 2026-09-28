"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-600 text-white shadow-lg hover:bg-indigo-500 hover:-translate-y-[1px]",
        destructive:
          "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
        outline:
          "border border-white/10 bg-black/40 text-white shadow-sm hover:bg-white/10 backdrop-blur-xl",
        secondary:
          "bg-white/10 text-white shadow-sm hover:bg-white/20",
        ghost:
          "text-white/80 hover:bg-white/10 hover:text-white",
        link: "text-fuchsia-400 underline-offset-4 hover:underline",
        sunset:
          "bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white shadow-lg border border-white/20 hover:brightness-110 hover:-translate-y-[1px]",
        sand:
          "bg-white/10 text-white shadow-sm hover:bg-white/20",
        teal:
          "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-md",
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
