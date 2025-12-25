import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./button";

export function NavIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-9 w-9 rounded-xl p-0",
        "hover:bg-accent/50 transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "[&_svg]:h-5 [&_svg]:w-5 [&_svg]:text-muted-foreground [&_svg]:hover:text-foreground [&_svg]:transition-colors",
        className
      )}
      {...props}
    />
  );
}
