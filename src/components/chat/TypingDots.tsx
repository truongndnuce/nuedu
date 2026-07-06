import { cn } from "@/lib/utils";

export function TypingDots({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5",
        className
      )}
    >
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
      <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/70" />
    </span>
  );
}
