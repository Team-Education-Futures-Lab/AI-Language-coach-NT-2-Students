import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cozy-sand focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-cozy-teal/15 text-cozy-teal border-cozy-teal/30",
        secondary:
          "bg-cozy-sand/35 text-cozy-ink border-cozy-sand/60",
        destructive:
          "bg-cozy-terracotta/15 text-cozy-terracotta border-cozy-terracotta/30",
        outline:
          "text-cozy-ink border-cozy-ink/20 bg-transparent",
        success:
          "bg-cozy-teal/20 text-cozy-teal border-cozy-teal/30",
        warning:
          "bg-cozy-sand/35 text-cozy-orange border-cozy-orange/40",
        sand:
          "bg-cozy-sand/45 text-cozy-ink border-cozy-sand/70",
        sunset:
          "bg-gradient-to-r from-cozy-terracotta/15 via-cozy-orange/20 to-cozy-sand/35 text-cozy-ink border-cozy-orange/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
