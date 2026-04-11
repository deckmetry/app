"use client";

import { useState, useTransition } from "react";
import { updateSupplierEmbed } from "@/lib/actions/supplier-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Copy, Loader2, Palette, Globe, Eye, Code } from "lucide-react";
import { toast } from "sonner";

interface EmbedSettingsProps {
  orgId: string;
  orgName: string;
  slug: string;
  logoUrl: string;
  primaryColor: string;
  showHeader: boolean;
}

export function EmbedSettings({
  orgId,
  orgName,
  slug: initialSlug,
  logoUrl: initialLogoUrl,
  primaryColor: initialColor,
  showHeader: initialShowHeader,
}: EmbedSettingsProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [primaryColor, setPrimaryColor] = useState(initialColor);
  const [showHeader, setShowHeader] = useState(initialShowHeader);
  const [isSaving, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://app.deckmetry.com";

  const handleSave = (field: string, value: unknown) => {
    startTransition(async () => {
      const result = await updateSupplierEmbed({ [field]: value });
      if (result.success) {
        toast.success("Settings updated");
      } else {
        toast.error("Failed to save", { description: result.error });
      }
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const embedCode = `<iframe
  src="${appUrl}/embed/${slug}"
  width="100%"
  height="800"
  style="border: none; border-radius: 8px;"
  title="Deck Estimator | ${orgName}"
></iframe>`;

  const contractorPortalUrl = `${appUrl}/signup?ref=${slug}&role=contractor`;

  return (
    <div className="space-y-6">
      {/* Slug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" />
            Embed URL
          </CardTitle>
          <CardDescription>
            Your unique URL slug for the embedded estimator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {appUrl}/embed/
            </span>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="your-company"
              className="max-w-[200px]"
            />
            <Button
              size="sm"
              onClick={() => handleSave("slug", slug)}
              disabled={isSaving || !slug || slug === initialSlug}
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4" />
            Branding
          </CardTitle>
          <CardDescription>
            Customize the look of your embedded estimator
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Color */}
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-10 rounded-lg border cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="max-w-[140px] font-mono text-sm"
              />
              <Button
                size="sm"
                onClick={() => handleSave("primaryColor", primaryColor)}
                disabled={isSaving || primaryColor === initialColor}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>

          {/* Show Header Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Header</Label>
              <p className="text-xs text-muted-foreground">
                Display your logo and company name in the estimator header
              </p>
            </div>
            <Switch
              checked={showHeader}
              onCheckedChange={(checked) => {
                setShowHeader(checked);
                handleSave("showHeader", checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      {slug && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Eye className="h-4 w-4" />
              Live Preview
            </CardTitle>
            <CardDescription>
              Preview how the estimator will look on your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden bg-muted/30">
              <iframe
                src={`${appUrl}/embed/${slug}`}
                className="w-full border-0"
                height={600}
                title="Embed Preview"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embed Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Code className="h-4 w-4" />
            Embed Code
          </CardTitle>
          <CardDescription>
            Copy and paste these snippets into your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Homeowner BOM Widget */}
          <div className="space-y-2">
            <Label>Homeowner Deck Estimator (iframe)</Label>
            <p className="text-xs text-muted-foreground">
              Paste this where you want the BOM wizard to appear
            </p>
            <div className="relative">
              <pre className="rounded-lg bg-muted p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                {embedCode}
              </pre>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8"
                onClick={() => copyToClipboard(embedCode, "Embed code")}
              >
                {copied === "Embed code" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>

          {/* Contractor Portal Link */}
          <div className="space-y-2">
            <Label>Contractor Portal Link</Label>
            <p className="text-xs text-muted-foreground">
              Send contractors this link to sign up scoped to your account
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={contractorPortalUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  copyToClipboard(contractorPortalUrl, "Contractor URL")
                }
              >
                {copied === "Contractor URL" ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
