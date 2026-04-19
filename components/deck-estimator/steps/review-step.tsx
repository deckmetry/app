"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BomItem } from "@/lib/types";
import { useWizardStore, useEstimate } from "@/lib/stores/wizard-store";
import { useEmbed } from "@/lib/contexts/embed-context";
import { saveEstimate, updateEstimate } from "@/lib/actions/estimates";
import { createHomeownerCheckoutSession, type HomeownerProduct } from "@/lib/actions/purchases";
import { EmbedEmailModal } from "@/components/deck-estimator/embed-email-modal";
import { deckingBrands } from "@/lib/catalog";
import { generateStairId } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import {
  AlertTriangle,
  Copy,
  Printer,
  Mail,
  CheckCircle2,
  Info,
  Plus,
  Pencil,
  FileText,
  Ruler,
  Box,
  UserCheck,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";


const CATEGORY_ORDER = [
  "foundation",
  "framing",
  "decking",
  "fasteners",
  "fascia",
  "railing",
  "add-ons",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  foundation: "Foundation",
  framing: "Framing",
  decking: "Decking",
  fasteners: "Fasteners",
  fascia: "Fascia",
  railing: "Railing",
  "add-ons": "Add-ons",
};

const CATEGORY_NOTES: Record<string, string> = {
  foundation:
    "Standard 16\" x 36\" footings. Verify frost depth, soil bearing, and local code.",
  framing:
    "Framing package based on conservative prescriptive spans and standard PT framing.",
  decking:
    "Boards run parallel to house. Counts include prototype waste factors and standard length optimization.",
  fasteners:
    "Camo Hidden Fasteners: 1 bucket/500sf. Screws & plugs kit for picture frame, breakers, and stairs.",
  fascia: "1x8 for stair risers, 1x12 for deck perimeter and stair sides. 10% waste included.",
  railing: "", // Will be generated dynamically
  "add-ons":
    "Lighting quantities are suggestive BOM values and should be reviewed against final layout.",
};

// Category colors for visual distinction
const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  foundation: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-800 dark:text-amber-200" },
  framing: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", text: "text-orange-800 dark:text-orange-200" },
  decking: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-800 dark:text-emerald-200" },
  fasteners: { bg: "bg-slate-50 dark:bg-slate-800/30", border: "border-slate-200 dark:border-slate-700", text: "text-slate-700 dark:text-slate-300" },
  fascia: { bg: "bg-violet-50 dark:bg-violet-950/30", border: "border-violet-200 dark:border-violet-800", text: "text-violet-800 dark:text-violet-200" },
  railing: { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", text: "text-sky-800 dark:text-sky-200" },
  "add-ons": { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-800 dark:text-rose-200" },
};

export function ReviewStep() {
  const formData = useWizardStore((s) => s.formData);
  const editingEstimateId = useWizardStore((s) => s.editingEstimateId);
  const estimate = useEstimate();
  const embed = useEmbed();
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [editedQuantities, setEditedQuantities] = useState<Record<string, number>>({});
  const [customItems, setCustomItems] = useState<BomItem[]>([]);
  const [deletedItems, setDeletedItems] = useState<Set<string>>(new Set());
  const [categoryNotes, setCategoryNotes] = useState<Record<string, string>>({});
  const [editedItemNotes, setEditedItemNotes] = useState<Record<string, string>>({});
  const [newItemCategory, setNewItemCategory] = useState<string>("foundation");
  const [newItemDescription, setNewItemDescription] = useState<string>("");
  const [newItemSize, setNewItemSize] = useState<string>("");
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [newItemUnit, setNewItemUnit] = useState<string>("ea");

  // Get selected brand/collection names
  const selectedBrand = useMemo(
    () => deckingBrands.find((b) => b.id === formData.deckingBrand),
    [formData.deckingBrand]
  );

  const selectedCollection = useMemo(
    () =>
      selectedBrand?.collections.find((c) => c.id === formData.deckingCollection),
    [selectedBrand, formData.deckingCollection]
  );

  // Combine estimate BOM with edited quantities and custom items, excluding deleted
  const finalBom = useMemo(() => {
    const editedBom = estimate.bom
      .filter((item) => !deletedItems.has(item.id))
      .map((item) => ({
        ...item,
        quantity: editedQuantities[item.id] ?? item.quantity,
      }));
    return [...editedBom, ...customItems];
  }, [estimate.bom, editedQuantities, customItems, deletedItems]);

  // Group BOM items by category
  const groupedBom = useMemo(() => {
    const groups: Record<string, BomItem[]> = {};

    for (const item of finalBom) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }

    return groups;
  }, [finalBom]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Update quantity
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setEditedQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(0, newQuantity),
    }));
  };

  // Update item notes
  const handleItemNotesChange = (itemId: string, newNote: string) => {
    setEditedItemNotes((prev) => ({
      ...prev,
      [itemId]: newNote,
    }));
  };

  // Get dynamic railing note
  const getRailingNote = () => {
    if (!formData.railingMaterial) return "No railing selected.";
    return `${formData.railingMaterial.charAt(0).toUpperCase() + formData.railingMaterial.slice(1)} railing - ${formData.railingColor}. Rail sections optimized for fewest sections (8' preferred over 6'). May require field trim.`;
  };

  // Delete item
  const handleDeleteItem = (itemId: string, isCustom: boolean) => {
    if (isCustom) {
      setCustomItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setDeletedItems((prev) => new Set([...prev, itemId]));
    }
    toast.success("Item removed from BOM");
  };

  // Add custom item
  const addCustomItem = () => {
    if (!newItemDescription.trim()) {
      toast.error("Please enter a description");
      return;
    }

    const newItem: BomItem = {
      id: `custom-${generateStairId()}`,
      category: newItemCategory as BomItem["category"],
      description: newItemDescription,
      size: newItemSize || undefined,
      quantity: newItemQuantity,
      unit: newItemUnit,
      editable: true,
    };

    setCustomItems((prev) => [...prev, newItem]);
    setNewItemDescription("");
    setNewItemSize("");
    setNewItemQuantity(1);
    toast.success("Item added to BOM");
  };

  // Copy BOM to clipboard
  const copyBom = () => {
    const lines: string[] = [
      "DECKMETRY - SMART DECK ESTIMATOR - BILL OF MATERIALS",
      "=" .repeat(50),
      "",
      `Project: ${formData.projectName || "Unnamed Project"}`,
      `Contractor: ${formData.contractorName}`,
      `Address: ${formData.projectAddress}`,
      `Delivery Date: ${formatDate(formData.requestedDeliveryDate)}`,
      "",
      `Deck: ${formData.deckWidthFt}' x ${formData.deckProjectionFt}' ${formData.deckType}`,
      `Height: ${formData.deckHeightIn}" | Area: ${estimate.derived.deckAreaSf} sq ft`,
      `Decking: ${selectedBrand?.name} ${selectedCollection?.name} - ${formData.deckingColor}`,
      "",
      "-".repeat(50),
      "",
    ];

    for (const category of CATEGORY_ORDER) {
      const items = groupedBom[category];
      if (!items || items.length === 0) continue;

      lines.push(CATEGORY_LABELS[category].toUpperCase());
      lines.push("-".repeat(30));

      for (const item of items) {
        const size = item.size ? ` (${item.size})` : "";
        const note = editedItemNotes[item.id] ?? item.notes;
        const noteStr = note ? ` [${note}]` : "";
        lines.push(`  ${item.quantity} ${item.unit} - ${item.description}${size}${noteStr}`);
      }
      lines.push("");
    }

    if (estimate.warnings.length > 0) {
      lines.push("WARNINGS");
      lines.push("-".repeat(30));
      for (const warning of estimate.warnings) {
        lines.push(`  ! ${warning}`);
      }
      lines.push("");
    }

    lines.push("ASSUMPTIONS");
    lines.push("-".repeat(30));
    for (const assumption of estimate.assumptions) {
      lines.push(`  - ${assumption}`);
    }

    lines.push("");
    lines.push("Generated by Deckmetry - Smart Deck Estimator");

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("BOM copied to clipboard");
  };

  // Copy email body
  const copyEmailBody = () => {
    const lines: string[] = [
      `Subject: Deck Material Estimate - ${formData.projectName || formData.projectAddress}`,
      "",
      `Hi,`,
      "",
      `Please find below the material estimate for the following deck project:`,
      "",
      `Project Details:`,
      `- Contractor: ${formData.contractorName}`,
      `- Project Address: ${formData.projectAddress}`,
      `- Delivery Address: ${formData.deliveryAddress || formData.projectAddress}`,
      `- Requested Delivery: ${formatDate(formData.requestedDeliveryDate)}`,
      "",
      `Deck Specifications:`,
      `- Type: ${formData.deckType === "attached" ? "Attached to house" : "Freestanding"}`,
      `- Dimensions: ${formData.deckWidthFt}' x ${formData.deckProjectionFt}' (${estimate.derived.deckAreaSf} sq ft)`,
      `- Height: ${formData.deckHeightIn}" above grade`,
      `- Decking: ${selectedBrand?.name} ${selectedCollection?.name} - ${formData.deckingColor}`,
      formData.railingMaterial
        ? `- Railing: ${formData.railingColor} ${formData.railingMaterial}`
        : "",
      formData.stairSections.length > 0
        ? `- Stairs: ${formData.stairSections.length} section(s)`
        : "",
      "",
    ];

    lines.push(
      `Please review and confirm availability. This estimate was generated using Deckmetry and may require manual review.`
    );
    lines.push("");
    lines.push(`Thank you,`);
    lines.push(`${formData.contractorName}`);
    lines.push(`${formData.email}`);
    if (formData.phone) lines.push(`${formData.phone}`);

    navigator.clipboard.writeText(lines.filter(Boolean).join("\n"));
    toast.success("Email body copied to clipboard");
  };

  // Print summary
  const handlePrint = () => {
    window.print();
  };

  // Save estimate to database
  const router = useRouter();
  const searchParams = useSearchParams();
  const existingProjectId = searchParams.get("projectId") ?? undefined;
  const roleParam = searchParams.get("role") ?? "homeowner";
  const roleBase = ["homeowner", "contractor", "supplier"].includes(roleParam)
    ? roleParam
    : "homeowner";
  const [isSaving, startSaveTransition] = useTransition();
  const [savedEstimateId, setSavedEstimateId] = useState<string | null>(null);

  const handleSaveEstimate = () => {
    startSaveTransition(async () => {
      if (editingEstimateId) {
        const result = await updateEstimate(editingEstimateId, formData);
        if (result.success) {
          toast.success("Estimate updated successfully");
          router.push(`/contractor/estimates/${editingEstimateId}`);
        } else {
          toast.error("Failed to update estimate", { description: result.error });
        }
        return;
      }

      const result = await saveEstimate(formData, existingProjectId);
      if (result.success) {
        setSavedEstimateId(result.estimateId ?? null);
        toast.success("Estimate saved to your dashboard", {
          description: "You can view it from your estimates page.",
        });
        if (result.projectId) {
          router.push(`/${roleBase}/projects/${result.projectId}`);
        } else {
          router.push(`/${roleBase}/estimates`);
        }
      } else {
        toast.error("Failed to save estimate", { description: result.error });
      }
    });
  };

  // Purchase a homeowner product (requires saved estimate)
  const handlePurchase = (productType: HomeownerProduct) => {
    if (!savedEstimateId) {
      // Save first, then redirect to purchase
      startSaveTransition(async () => {
        const result = await saveEstimate(formData, existingProjectId);
        if (result.success && result.estimateId) {
          setSavedEstimateId(result.estimateId);
          try {
            await createHomeownerCheckoutSession(productType, result.estimateId);
          } catch {
            // redirect throws on success
          }
        } else {
          toast.error("Failed to save estimate", {
            description: result.error,
          });
        }
      });
    } else {
      startSaveTransition(async () => {
        try {
          await createHomeownerCheckoutSession(productType, savedEstimateId);
        } catch {
          // redirect throws on success
        }
      });
    }
  };

  return (
    <div className="space-y-8">
<div>
      <h2 className="text-xl font-semibold tracking-tight">
        Review & Bill of Materials
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Review your project summary and generated material list.
      </p>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
        <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
          Preliminary material builder for budgeting and sales support. Final layout, code compliance, and engineering to be verified.
        </p>
      </div>
      
      {/* Warnings */}
      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block print-header">
        <div>
          <h1>Bill of Materials</h1>
          <p className="subtitle">Generated by Deckmetry - Smart Deck Estimator</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{formData.contractorName || "Contractor"}</p>
          <p className="text-xs">{formData.projectAddress || ""}</p>
          <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {estimate.warnings.length > 0 && (
        <Alert variant="destructive" className="print:hidden">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Manual Review Required</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              This BOM is preliminary only. Project requires manual
              review before order release.
            </p>
            <ul className="list-inside list-disc space-y-1">
              {estimate.warnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Project Summary */}
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm print:rounded-none print:border print:shadow-none print:p-3 print-summary avoid-break">
        <h3 className="mb-6 text-base font-semibold uppercase tracking-wide text-foreground">
          Project Summary
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contractor</p>
            <p className="text-base font-semibold">
              {formData.contractorName || "Not specified"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Address</p>
            <p className="text-base font-semibold">
              {formData.projectAddress || "Not specified"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Delivery Date</p>
            <p className="text-base font-semibold">
              {formatDate(formData.requestedDeliveryDate)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Deck Type</p>
            <p className="text-base font-semibold capitalize">{formData.deckType}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dimensions</p>
            <p className="text-base font-semibold">
              {formData.deckWidthFt}&apos; W x {formData.deckProjectionFt}&apos; D
            </p>
            <p className="text-sm text-muted-foreground">
              {estimate.derived.deckAreaSf} sq ft
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Height</p>
            <p className="text-base font-semibold">{formData.deckHeightIn}&quot; above grade</p>
          </div>
        </div>
      </div>

      {/* BOM Tables */}
      <div className="space-y-6 print:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <h3 className="text-lg font-semibold">Bill of Materials</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="print:hidden">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={copyBom} className="print:hidden">
              <Copy className="mr-2 h-4 w-4" />
              Copy BOM
            </Button>
            <Button variant="outline" size="sm" onClick={copyEmailBody} className="print:hidden">
              <Mail className="mr-2 h-4 w-4" />
              Copy Email
            </Button>
          </div>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const items = groupedBom[category];
          if (!items || items.length === 0) return null;
          const colors = CATEGORY_COLORS[category] || { bg: "bg-muted/30", border: "border-border", text: "text-foreground" };

          return (
            <div key={category} className={`rounded-xl border ${colors.border} bg-card overflow-hidden print:rounded-none print:border-gray-300 print:mb-4 print-bom-section avoid-break`}>
              <div className={`border-b ${colors.border} px-5 py-4 flex items-center justify-between ${colors.bg} print:px-2 print:py-2 print:bg-gray-100`}>
                <div className="flex-1 mr-4">
                  <h4 className={`font-semibold text-base ${colors.text} print:text-black print:text-sm`}>{CATEGORY_LABELS[category]}</h4>
                  <p className="text-xs text-muted-foreground mt-1 print:text-gray-600 print:mt-0 category-note">
                    {category === "railing" ? getRailingNote() : CATEGORY_NOTES[category]}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="print:hidden">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Item to {CATEGORY_LABELS[category]}</DialogTitle>
                      <DialogDescription>
                        Add a custom item to this category.
                      </DialogDescription>
                    </DialogHeader>
                    <FieldGroup className="py-4">
                      <Field>
                        <FieldLabel>Description</FieldLabel>
                        <Input
                          placeholder="Item description"
                          value={newItemDescription}
                          onChange={(e) => setNewItemDescription(e.target.value)}
                        />
                      </Field>
                      <div className="grid grid-cols-3 gap-4">
                        <Field>
                          <FieldLabel>Size</FieldLabel>
                          <Input
                            placeholder="e.g., 2x6x12'"
                            value={newItemSize}
                            onChange={(e) => setNewItemSize(e.target.value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Quantity</FieldLabel>
                          <Input
                            type="number"
                            min={1}
                            value={newItemQuantity}
                            onChange={(e) => setNewItemQuantity(Number(e.target.value) || 1)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Unit</FieldLabel>
                          <Select value={newItemUnit} onValueChange={setNewItemUnit}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ea">ea</SelectItem>
                              <SelectItem value="bags">bags</SelectItem>
                              <SelectItem value="box">box</SelectItem>
                              <SelectItem value="bucket">bucket</SelectItem>
                              <SelectItem value="pack">pack</SelectItem>
                              <SelectItem value="lf">lf</SelectItem>
                              <SelectItem value="sf">sf</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </FieldGroup>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={() => {
                            setNewItemCategory(category);
                            addCustomItem();
                          }}
                        >
                          Add Item
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Table className="print:text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px] print:w-auto">Description</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right w-[100px] print:w-[60px]">Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-[60px] print:hidden"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isCustom = item.id.startsWith("custom-");
                    const displayQty = editedQuantities[item.id] ?? item.quantity;
                    const displayNotes = editedItemNotes[item.id] ?? item.notes ?? "";
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium print:text-xs print:py-1">
                          {item.description}
                        </TableCell>
                        <TableCell className="print:text-xs print:py-1">{item.size || "-"}</TableCell>
                        <TableCell className="text-right print:py-1">
                          <Input
                            type="number"
                            min={0}
                            value={displayQty}
                            onChange={(e) =>
                              handleQuantityChange(item.id, Number(e.target.value) || 0)
                            }
                            className="w-20 text-right font-mono print:hidden"
                          />
                          <span className="hidden print:inline font-mono font-semibold">{displayQty}</span>
                        </TableCell>
                        <TableCell className="print:text-xs print:py-1">{item.unit}</TableCell>
                        <TableCell className="print:py-1">
                          <Input
                            value={displayNotes}
                            onChange={(e) => handleItemNotesChange(item.id, e.target.value)}
                            placeholder="-"
                            className="h-8 text-xs min-w-[120px] print:hidden"
                          />
                          <span className="hidden print:inline text-xs">{displayNotes || "-"}</span>
                        </TableCell>
                        <TableCell className="print:hidden">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteItem(item.id, isCustom)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          );
        })}
      </div>

      {/* Save / Email CTA */}
      <div className="flex justify-center">
        {embed.isEmbed ? (
          <Button
            size="lg"
            onClick={() => setEmailModalOpen(true)}
            className="text-white"
            style={{ backgroundColor: embed.primaryColor }}
          >
            <Mail className="mr-2 h-5 w-5" />
            Email Me This Material List
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={handleSaveEstimate}
            disabled={isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isSaving ? "Saving..." : "Save to Dashboard"}
          </Button>
        )}
      </div>

      {/* Embed email modal */}
      {embed.isEmbed && (
        <EmbedEmailModal open={emailModalOpen} onOpenChange={setEmailModalOpen} />
      )}

      {/* Structural Summary */}
      <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
        <h3 className="mb-6 text-base font-semibold uppercase tracking-wide text-foreground">
          Structural Summary
        </h3>
        <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Joists</p>
            <p className="text-lg font-bold mt-1">
              {estimate.derived.joistCount}x {estimate.derived.joistSize}
            </p>
            <p className="text-sm text-muted-foreground">
              {estimate.derived.joistStockLengthFt}&apos; stock
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Beam</p>
            <p className="text-lg font-bold mt-1">{estimate.derived.beamSize}</p>
            <p className="text-sm text-muted-foreground">
              {estimate.derived.postCountPerBeam} posts
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Posts</p>
            <p className="text-lg font-bold mt-1">{estimate.derived.postSize}</p>
            <p className="text-sm text-muted-foreground">
              {estimate.derived.postStockLengthFt}&apos; stock
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Footings</p>
            <p className="text-lg font-bold mt-1">
              {estimate.derived.sonotubeQty}x {estimate.derived.sonotubeDiameterIn}&quot;
            </p>
            <p className="text-sm text-muted-foreground">
              {estimate.derived.concreteBags80} bags concrete
            </p>
          </div>
        </div>
      </div>

      {/* Success Footer or Request Actions */}
      {estimate.warnings.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-5 print:hidden">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <div>
            <p className="font-semibold text-emerald-700 dark:text-emerald-300">Estimate Complete</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
              Your BOM is ready for review. Use the actions below to proceed.
            </p>
          </div>
        </div>
      ) : null}

      {/* MVP Action Buttons — hidden in embed mode */}
      {!embed.isEmbed && (
        <div className="border-t-2 border-border pt-8 print:hidden">
          <h3 className="text-base font-semibold uppercase tracking-wide text-foreground mb-6">
            Next Steps
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              onClick={handleSaveEstimate}
              disabled={isSaving}
              className="h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 text-foreground"
            >
              {isSaving ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <Save className="h-8 w-8 text-primary" />
              )}
              <span className="font-semibold text-base text-foreground">
                {isSaving ? "Saving..." : "Save to Dashboard"}
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Free — save this estimate
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePurchase("permit_design")}
              disabled={isSaving}
              className="h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 text-foreground"
            >
              <Ruler className="h-8 w-8 text-primary" />
              <span className="font-semibold text-base text-foreground">Permit-Ready Design</span>
              <span className="text-xs text-muted-foreground text-center">
                $197 — drawings for your building dept
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePurchase("3d_design")}
              disabled={isSaving}
              className="h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 text-foreground"
            >
              <Box className="h-8 w-8 text-primary" />
              <span className="font-semibold text-base text-foreground">3D Design</span>
              <span className="text-xs text-muted-foreground text-center">
                $1,597 — photorealistic rendering
              </span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePurchase("pro_review")}
              disabled={isSaving}
              className="h-auto py-6 flex flex-col items-center gap-3 border-2 hover:border-primary hover:bg-primary/5 text-foreground"
            >
              <UserCheck className="h-8 w-8 text-primary" />
              <span className="font-semibold text-base text-foreground">Pro Review</span>
              <span className="text-xs text-muted-foreground text-center">
                $97 — expert plan review
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="hidden print:block print-footer mt-8 pt-4 border-t border-gray-300">
        <p>Generated by Deckmetry Smart Deck Estimator - {new Date().toLocaleDateString()}</p>
        <p className="mt-1">This is a preliminary estimate. Final quantities should be verified before ordering.</p>
      </div>
    </div>
  );
}
