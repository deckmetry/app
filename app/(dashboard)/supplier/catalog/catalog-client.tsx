"use client";

import { useState, useTransition } from "react";
import { createCatalogItem, updateCatalogItem, deactivateCatalogItem, createCatalogGroup } from "@/lib/actions/supplier-catalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, FolderPlus } from "lucide-react";
import { toast } from "sonner";

const UNITS = ["each", "LF", "SF", "box", "bundle", "bag", "roll", "kit", "pcs", "set"];
const STOCK_STATUSES = [
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "special_order", label: "Special Order" },
];
const STOCK_COLORS: Record<string, string> = {
  in_stock: "bg-emerald-100 text-emerald-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
  special_order: "bg-purple-100 text-purple-800",
};

interface Group { id: string; name: string }
interface Item {
  id: string;
  sku: string;
  description: string;
  brand?: string | null;
  unit: string;
  base_price: number;
  stock_status: string;
  special_order: boolean;
  group_id?: string | null;
  supplier_catalog_groups?: { name: string } | null;
  notes?: string | null;
}

// ── Add Group Dialog ────────────────────────────────────────────────────────

export function AddGroupDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await createCatalogGroup(fd);
      if (r.success) { toast.success("Group added"); setOpen(false); }
      else toast.error("Failed", { description: r.error });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FolderPlus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[360px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Catalog Group</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Decking, Framing, Railing" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Optional" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Adding..." : "Add Group"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Item Form (shared by Add + Edit) ─────────────────────────────────────────

function ItemForm({
  groups,
  item,
  onSubmit,
  isPending,
}: {
  groups: Group[];
  item?: Item;
  onSubmit: (fd: FormData) => void;
  isPending: boolean;
}) {
  const [stockStatus, setStockStatus] = useState(item?.stock_status ?? "in_stock");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("stock_status", stockStatus);
    onSubmit(fd);
  }

  return (
    <form onSubmit={handleSubmit} id="item-form">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input id="sku" name="sku" defaultValue={item?.sku} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select name="unit" defaultValue={item?.unit ?? "each"}>
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description *</Label>
          <Input id="description" name="description" defaultValue={item?.description} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" defaultValue={item?.brand ?? ""} placeholder="Trex, TimberTech..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="base_price">Price *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                id="base_price"
                name="base_price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={item?.base_price ?? 0}
                className="pl-7"
                required
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Group</Label>
            <Select name="group_id" defaultValue={item?.group_id ?? "none"}>
              <SelectTrigger>
                <SelectValue placeholder="No group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No group</SelectItem>
                {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Stock Status</Label>
            <Select value={stockStatus} onValueChange={setStockStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STOCK_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" defaultValue={item?.notes ?? ""} rows={2} />
        </div>
      </div>
    </form>
  );
}

// ── Add Item Dialog ───────────────────────────────────────────────────────────

export function AddItemDialog({ groups }: { groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    // convert "none" group_id to empty
    if (fd.get("group_id") === "none") fd.set("group_id", "");
    startTransition(async () => {
      const r = await createCatalogItem(fd);
      if (r.success) { toast.success("Item added"); setOpen(false); }
      else toast.error("Failed", { description: r.error });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New Catalog Item</DialogTitle>
        </DialogHeader>
        <ItemForm groups={groups} onSubmit={handleSubmit} isPending={isPending} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="item-form" disabled={isPending}>
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Item Dialog ──────────────────────────────────────────────────────────

export function EditItemDialog({ item, groups }: { item: Item; groups: Group[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    if (fd.get("group_id") === "none") fd.set("group_id", "");
    startTransition(async () => {
      const r = await updateCatalogItem(item.id, fd);
      if (r.success) { toast.success("Item updated"); setOpen(false); }
      else toast.error("Failed", { description: r.error });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>
        <ItemForm groups={groups} item={item} onSubmit={handleSubmit} isPending={isPending} />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" form="item-form" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Delete Item Button ────────────────────────────────────────────────────────

export function DeleteItemButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Item?</AlertDialogTitle>
          <AlertDialogDescription>
            This will deactivate the catalog item. It won&apos;t affect existing orders.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(async () => {
              const r = await deactivateCatalogItem(id);
              if (!r.success) toast.error("Failed", { description: r.error });
              else toast.success("Item removed");
            })}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Stock Badge ───────────────────────────────────────────────────────────────

export function StockBadge({ status }: { status: string }) {
  const label = STOCK_STATUSES.find(s => s.value === status)?.label ?? status;
  return (
    <Badge variant="outline" className={`text-xs ${STOCK_COLORS[status] ?? ""}`}>
      {label}
    </Badge>
  );
}
