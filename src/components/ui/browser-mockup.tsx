import { Copy, Plus, Share2 } from "lucide-react";
import { cn } from "~/lib/utils";

type BrowserMockupProps = {
  className?: string;
  children: React.ReactNode;
};

export function BrowserMockup({
  className,
  children,
}: Readonly<BrowserMockupProps>) {
  return (
    <div
      className={cn(
        "bg-card overflow-hidden rounded-2xl border shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-red-500/70" />
          <span className="size-2.5 rounded-full bg-yellow-500/70" />
          <span className="size-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="text-muted-foreground flex items-center gap-3">
          <Share2 className="size-4" />
          <Plus className="size-4" />
          <Copy className="size-4" />
        </div>
      </div>
      {children}
    </div>
  );
}
