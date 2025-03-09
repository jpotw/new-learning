import { cn } from "@/lib/utils";

interface MainContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContainer({ children, className }: MainContainerProps) {
  return (
    <main className={cn("flex-1 overflow-auto p-4 md:p-6", className)}>
      {children}
    </main>
  );
} 