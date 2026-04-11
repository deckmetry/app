import Link from "next/link";
import { Home, Hammer, Hexagon, Phone, Mail, MapPin } from "lucide-react";

export function SupplierWebsiteMockup() {
  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-center text-sm font-medium text-muted-foreground mb-4">
        See how it looks on your website
      </p>
      <div className="rounded-xl border-2 border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-8">
            <div className="rounded-md bg-background border px-3 py-1 text-xs text-muted-foreground text-center font-mono">
              www.yourdecksupply.com
            </div>
          </div>
        </div>

        {/* Fake website content */}
        <div className="bg-gradient-to-b from-stone-50 to-white dark:from-stone-950 dark:to-stone-900">
          {/* Supplier nav */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-amber-700 flex items-center justify-center">
                <span className="text-white text-xs font-bold">YDS</span>
              </div>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Your Deck Supply Co.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> (555) 123-4567</span>
              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Denver, CO</span>
            </div>
          </div>

          {/* Hero area */}
          <div className="px-6 py-10 text-center">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 sm:text-3xl">
              Premium Deck Materials
            </h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Colorado&apos;s #1 source for Trex, TimberTech &amp; Deckorators composite decking
            </p>

            {/* The two CTA buttons — these are the live links */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/estimate"
                className="group flex items-center gap-3 rounded-xl border-2 border-amber-700 bg-amber-700 px-6 py-4 text-white shadow-lg transition-all hover:bg-amber-800 hover:shadow-xl hover:scale-[1.02]"
              >
                <Home className="h-6 w-6" />
                <div className="text-left">
                  <span className="block text-sm font-bold">Homeowner?</span>
                  <span className="block text-xs opacity-80">
                    Get your free material list
                  </span>
                </div>
              </Link>
              <Link
                href="/signup?role=contractor"
                className="group flex items-center gap-3 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 px-6 py-4 text-stone-800 dark:text-stone-100 shadow-lg transition-all hover:border-amber-700 hover:shadow-xl hover:scale-[1.02]"
              >
                <Hammer className="h-6 w-6 text-amber-700" />
                <div className="text-left">
                  <span className="block text-sm font-bold">Contractor?</span>
                  <span className="block text-xs text-stone-500 dark:text-stone-400">
                    Access quotes &amp; ordering
                  </span>
                </div>
              </Link>
            </div>

            {/* Powered by badge */}
            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-stone-400 dark:text-stone-500">
              <span>Powered by</span>
              <Hexagon className="h-3 w-3" />
              <span className="font-semibold">Deckmetry</span>
            </div>
          </div>

          {/* Fake product cards */}
          <div className="border-t border-stone-200 dark:border-stone-700 px-6 py-6">
            <div className="grid grid-cols-3 gap-3">
              {["Trex Transcend", "TimberTech PRO", "Deckorators Voyage"].map(
                (name) => (
                  <div
                    key={name}
                    className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-3 text-center"
                  >
                    <div className="h-12 rounded bg-stone-100 dark:bg-stone-700 mb-2" />
                    <p className="text-[10px] font-medium text-stone-600 dark:text-stone-300 truncate">
                      {name}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        Click either button to try the live experience
      </p>
    </div>
  );
}
