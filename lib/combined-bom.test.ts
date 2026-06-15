import { describe, it, expect } from "vitest";
import { buildCombinedBom } from "./combined-bom";
import { initialFormState } from "./store";
import type { EstimateInput } from "./types";

const base: EstimateInput = initialFormState;

describe("buildCombinedBom", () => {
  it("deck scope → deck sections only, no prefix", () => {
    const sections = buildCombinedBom({ ...base, scope: "deck" });
    expect(sections.length).toBeGreaterThan(0);
    expect(sections.every((s) => !s.title.startsWith("Roof"))).toBe(true);
    expect(sections.every((s) => !s.title.startsWith("Deck — "))).toBe(true);
    // all items are deck categories
    expect(sections.flatMap((s) => s.items).every((i) => i.category !== "roof")).toBe(true);
  });

  it("roof scope → roof sections only", () => {
    const sections = buildCombinedBom({ ...base, scope: "roof" });
    const titles = sections.map((s) => s.title);
    expect(titles).toContain("BEAM");
    expect(titles).toContain("RAFTERS");
    expect(titles).toContain("ROOF CEILING");
    // all items tagged roof
    expect(sections.flatMap((s) => s.items).every((i) => i.category === "roof")).toBe(true);
  });

  it("deck_roof scope → both, with Deck — / Roof — prefixes", () => {
    const sections = buildCombinedBom({ ...base, scope: "deck_roof" });
    const deckSections = sections.filter((s) => s.title.startsWith("Deck — "));
    const roofSections = sections.filter((s) => s.title.startsWith("Roof — "));
    expect(deckSections.length).toBeGreaterThan(0);
    expect(roofSections.length).toBeGreaterThan(0);
    expect(roofSections.map((s) => s.title)).toContain("Roof — BEAM");
  });
});
