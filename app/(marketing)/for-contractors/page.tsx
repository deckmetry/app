import { Card, CardContent } from "@/components/ui/card";
import { HardHat } from "lucide-react";
import { WaitlistForm } from "@/components/showroom/waitlist-form";

export default function ForContractorsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <HardHat className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contractor Portal Coming Soon</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Deckmetry will help contractors create faster estimates, generate BOMs, request material orders, track
          project status, clone past projects, and manage delivery requests.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 text-lg font-semibold">Join the contractor waitlist</h2>
          <WaitlistForm type="contractor_waitlist" buttonLabel="Join Contractor Waitlist" />
        </CardContent>
      </Card>
    </section>
  );
}
