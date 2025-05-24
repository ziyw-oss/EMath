import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline";
}

const buttonVariants = (variant: "default" | "outline" = "default") =>
  cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
    variant === "default"
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    "h-10 px-4 py-2"
  );

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "default", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={buttonVariants(variant) + " " + (className ?? "")} ref={ref} {...props} />;
  }
);

Button.displayName = "Button";

export { Button };