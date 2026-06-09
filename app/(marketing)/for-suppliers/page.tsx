import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { WaitlistForm } from "@/components/showroom/waitlist-form";

export default function ForSuppliersPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Supplier Platform Coming Soon</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Deckmetry will help suppliers capture homeowner leads, support contractors, organize material requests,
          track project activity, and create more visibility before orders are placed.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Join the supplier waitlist</h2>
          <WaitlistForm type="supplier_waitlist" buttonLabel="Join Supplier Waitlist" />
        </CardContent>
      </Card>
    </section>
  );
}
