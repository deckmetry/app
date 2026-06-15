// Combined deck + roof Bill of Materials.
// Produces ONE sectioned material list from an EstimateInput, honoring `scope`:
//   - "deck"      → deck sections only
//   - "roof"      → roof sections only
//   - "deck_roof" → both, prefixed "Deck — …" / "Roof — …"

import type { BomCategory, BomItem, EstimateInput } from "./types";
import { calculateEstimate } from "./calculations";
import { buildRoofBom } from "./roof-bom";

export interface BomSection {
  title: string;
  items: BomItem[];
}

const DECK_CATEGORY_ORDER: BomCategory[] = [
  "foundation",
  "framing",
  "decking",
  "fascia",
  "fasteners",
  "railing",
  "add-ons",
];

const DECK_CATEGORY_LABEL: Record<string, string> = {
  foundation: "Foundation",
  framing: "Framing",
  decking: "Decking",
  fascia: "Fascia",
  fasteners: "Fasteners",
  railing: "Railing",
  "add-ons": "Add-ons",
};

export function includesDeck(scope: EstimateInput["scope"]): boolean {
  return scope === "deck" || scope === "deck_roof";
}
export function includesRoof(scope: EstimateInput["scope"]): boolean {
  return scope === "roof" || scope === "deck_roof";
}

/** Build the combined, sectioned BOM for the wizard's current scope. */
export function buildCombinedBom(formData: EstimateInput): BomSection[] {
  const both = formData.scope === "deck_roof";
  const sections: BomSection[] = [];

  if (includesDeck(formData.scope)) {
    const deckBom = calculateEstimate(formData).bom;
    for (const cat of DECK_CATEGORY_ORDER) {
      const label = DECK_CATEGORY_LABEL[cat];
      const title = both ? `Deck — ${label}` : label;
      const items = deckBom
        .filter((i) => i.category === cat)
        .map((i) => ({ ...i, section: title }));
      if (items.length) sections.push({ title, items });
    }
  }

  if (includesRoof(formData.scope) && formData.roof) {
    for (const group of buildRoofBom(formData.roof)) {
      const title = both ? `Roof — ${group.title}` : group.title;
      const items: BomItem[] = group.lines.map((l) => ({
        id: l.id,
        category: "roof",
        section: title,
        description: l.description,
        size: l.size || undefined,
        quantity: l.qty,
        unit: l.unit,
        brand: l.brand || undefined,
        color: l.color || undefined,
        editable: true,
      }));
      sections.push({ title, items });
    }
  }

  return sections;
}

/** Flattened line items (section/brand/color set), in display order — for persistence. */
export function combinedBomItems(formData: EstimateInput): BomItem[] {
  return buildCombinedBom(formData).flatMap((s) => s.items);
}
