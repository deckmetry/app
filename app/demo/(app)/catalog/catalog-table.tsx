"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, X, TreePine, Wrench, Layers, PanelTop, Bolt, Fence, Lightbulb } from "lucide-react";
import { catalogSections } from "../../demo-data";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  lumber: TreePine,
  hardware: Wrench,
  decking: Layers,
  fascia: PanelTop,
  fasteners: Bolt,
  railing: Fence,
  lighting: Lightbulb,
};

const ALL = "all";

export function CatalogTable() {
  const [active, setActive] = useState(catalogSections[0].key);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const section = catalogSections.find((s) => s.key === active)!;
  const filterCols = section.filterColumns ?? [];

  // Reset search + filters when switching sections.
  const switchTab = (key: string) => {
    setActive(key);
    setSearch("");
    setFilters({});
  };

  // Distinct values for each filterable column in the active section.
  const optionsByCol = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of filterCols) {
      const idx = section.columns.indexOf(col);
      if (idx < 0) continue;
      map[col] = Array.from(new Set(section.rows.map((r) => r.cells[idx]))).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
    }
    return map;
  }, [section, filterCols]);

  const q = search.trim().toLowerCase();
  const visible = section.rows.filter((row) => {
    const matchesSearch =
      !q ||
      row.cells.some((c) => c.toLowerCase().includes(q)) ||
      row.price.toLowerCase().includes(q);
    const matchesFilters = filterCols.every((col) => {
      const val = filters[col];
      if (!val || val === ALL) return true;
      const idx = section.columns.indexOf(col);
      return row.cells[idx] === val;
    });
    return matchesSearch && matchesFilters;
  });

  const hasActiveFilters = q.length > 0 || filterCols.some((c) => filters[c] && filters[c] !== ALL);

  return (
    <div className="space-y-5">
      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {catalogSections.map((s) => {
          const Icon = ICONS[s.key];
          const isActive = s.key === active;
          return (
            <button
              key={s.key}
              onClick={() => switchTab(s.key)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {s.label}
              <span className={cn("rounded-full px-1.5 text-xs", isActive ? "bg-primary/15" : "bg-muted")}>
                {s.rows.length}
              </span>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold">{section.label}</h3>
            <p className="text-sm text-muted-foreground">{section.description}</p>
          </div>

          {/* Search + filters */}
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">Search</span>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${section.label.toLowerCase()}…`}
                  className="h-9 w-[240px] pl-8"
                />
              </div>
            </div>

            {filterCols.map((col) => (
              <div key={col} className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{col}</span>
                <Select
                  value={filters[col] ?? ALL}
                  onValueChange={(v) => setFilters((f) => ({ ...f, [col]: v }))}
                >
                  <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All</SelectItem>
                    {(optionsByCol[col] ?? []).map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1 text-muted-foreground"
                onClick={() => { setSearch(""); setFilters({}); }}
              >
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>

          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {section.columns.map((c) => (
                    <TableHead key={c}>{c}</TableHead>
                  ))}
                  <TableHead className="text-right">{section.priceLabel}</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((row, i) => (
                  <TableRow key={i}>
                    {row.cells.map((cell, j) => (
                      <TableCell key={j} className={j === 0 ? "font-medium" : "text-sm text-muted-foreground"}>
                        {cell}
                      </TableCell>
                    ))}
                    <TableCell className="text-right text-sm font-medium whitespace-nowrap">{row.price}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {visible.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={section.columns.length + 2} className="py-10 text-center text-sm text-muted-foreground">
                      No products match your search or filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Showing {visible.length} of {section.rows.length} products. Single shared price book — each contractor&apos;s net
            pricing is derived from their assigned discount tier (configured per contractor), applied at quote time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
