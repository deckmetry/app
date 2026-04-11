"use client";

import { useState, useTransition } from "react";
import { useEmbed } from "@/lib/contexts/embed-context";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { saveAnonymousEstimate } from "@/lib/actions/embed-estimates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

interface EmbedEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmbedEmailModal({ open, onOpenChange }: EmbedEmailModalProps) {
  const embed = useEmbed();
  const formData = useWizardStore((s) => s.formData);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveAnonymousEstimate({
        formData,
        homeownerName: name || undefined,
        homeownerEmail: email,
        homeownerPhone: phone || undefined,
        supplierSlug: embed.supplierSlug,
      });

      if (result.success) {
        setSuccess(true);
        setShareToken(result.shareToken ?? null);
      } else {
        setError(result.error ?? "Something went wrong. Please try again.");
      }
    });
  };

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (success) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${embed.primaryColor}15` }}
            >
              <CheckCircle2
                className="h-8 w-8"
                style={{ color: embed.primaryColor }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Check Your Email!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your material list has been sent to <strong>{email}</strong>.
              </p>
            </div>
            {shareToken && (
              <a
                href={`${appUrl}/bom/${shareToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium underline"
                style={{ color: embed.primaryColor }}
              >
                View BOM Online
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Get Your Material List
          </DialogTitle>
          <DialogDescription>
            Enter your email and we&apos;ll send your complete deck material list.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embed-name">Name (optional)</Label>
            <Input
              id="embed-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="embed-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="embed-phone">Phone (optional)</Label>
            <Input
              id="embed-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isSending || !email}
            className="w-full text-white"
            style={{ backgroundColor: embed.primaryColor }}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            {isSending ? "Sending..." : "Send My Material List"}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Provided by {embed.supplierName} &middot; Powered by Deckmetry
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
