import { Hexagon } from "lucide-react";

/**
 * Repeating letterhead for printable documents (roadmap, proposals, legal
 * package). Renders as a fixed header/footer on every printed page —
 * invisible on screen, where the page's own header/footer already cover
 * branding.
 */
export function PrintLetterhead({ title, date }: { title: string; date: string }) {
  return (
    <>
      <div className="hidden print:fixed print:inset-x-0 print:top-0 print:flex print:h-10 print:items-center print:justify-between print:border-b print:pb-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary">
            <Hexagon className="h-3 w-3 text-primary-foreground" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Deckmetry</span>
        </div>
        <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{title}</span>
      </div>

      <div className="hidden print:fixed print:inset-x-0 print:bottom-0 print:flex print:h-7 print:items-center print:justify-between print:border-t print:pt-1 print:text-[8px] print:text-muted-foreground">
        <span>Deckmetry · {title}</span>
        <span>{date}</span>
      </div>
    </>
  );
}
