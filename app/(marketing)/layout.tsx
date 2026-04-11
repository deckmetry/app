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
              href="/for/suppliers"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Suppliers
            </Link>
            <Link
              href="/for/contractors"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Contractors
            </Link>
            <Link
              href="/for/homeowners"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              For Homeowners
            </Link>
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
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
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Hexagon className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  Deckmetry
                </span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                The modern platform for deck-building professionals and
                homeowners.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">For</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/for/homeowners"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Homeowners
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for/contractors"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contractors
                  </Link>
                </li>
                <li>
                  <Link
                    href="/for/suppliers"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Suppliers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-3">Account</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/login"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Create account
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Deckmetry. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
