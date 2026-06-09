import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Hexagon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-shadow group-hover:shadow-md group-hover:shadow-primary/20">
              <Hexagon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold tracking-tight">Deckmetry</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/for-homeowners"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Homeowners
            </Link>
            <Link
              href="/for-contractors"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Contractors
            </Link>
            <Link
              href="/for-suppliers"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Suppliers
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/estimate">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Hexagon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold tracking-tight">Deckmetry</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Deckmetry helps homeowners plan deck materials, estimate project ranges, and request
                professional next steps.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-2">
              <Link href="/for-homeowners" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Homeowners</Link>
              <Link href="/for-contractors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Contractors</Link>
              <Link href="/for-suppliers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Suppliers</Link>
              <Link href="/estimate" className="text-sm font-medium text-foreground hover:text-primary transition-colors">Start Estimate</Link>
            </nav>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Deckmetry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
