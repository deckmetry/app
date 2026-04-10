"use client";

import { useMemo } from "react";
import { useWizardStore } from "@/lib/stores/wizard-store";
import { deckingBrands } from "@/lib/catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { Palette, Layers, Square, Frame } from "lucide-react";

// Brand logo images
const BRAND_LOGOS: Record<string, string> = {
  trex: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trex-logo-trex-decki-11563033877fszrw7izax-VamFON3tP7i4pqOeCh6RnUDgEAJ22l.png",
  timbertech: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TimberTech-Logo-GeoYTcEq2yekPt5ZEcighNW1olv1jx.png",
  deckorators: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/deckorators-horizontal-notagline-blackandred-logo.jTWUUjYi1g.jpeg-GZbH1jXNvFcOkI0UYMr3lISicRNuoj.avif",
};

// Helper to adjust color brightness for gradient effect
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// Actual color photos (when available)
const COLOR_IMAGES: Record<string, string> = {
  // Trex Enhance Naturals
  "Toasted Sand": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/toasted%20sand-NhazHHdyvtyQ90tWJ1enIGcGvSAZQj.jpg",
  "Cinnamon Cove": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TREX-Cinnamon-Cove-close-up-texture.jpeg-NJnco6eSt5iFOKRQjxqbucH5QaByC5.webp",
  "Rocky Harbour": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Rocky%20harbour.JPG-t9e9Z9N61aIR74Mzb6NpW2j30nzkKY.jpeg",
  "Foggy Wharf": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trex-Enhance-Naturals-Foggy-Wharf2-ghTnDc7PFycTU6HkwtTgfWuX4bFvjm.jpg",
  "Honey Grove": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/HoneyGrove3.jpeg-5bKAwLvNUBkKoNCyI82x30vlmLk7BG.webp",
  "Golden Hour": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trex-enhance-golden-hour-swatch.jpeg-cXCFPZYn1nKpxqaOK9gFN2ZSFPTkAf.webp",
  // Trex Select
  "Whiskey Barrel": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trex-Select-Composite-Decking-Sample-Whiskey-Barrel-4.jpeg-h9f3Mxftu6dsHSScj9lZyFreb5jMHO.webp",
  "Millstone": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trex-Select-Composite-Decking-Sample-Millstone-3.jpeg-sCZ4NMqi59NIzmSYwKNUiSvOBI2Il4.webp",
  // Trex Transcend
  "Rope Swing": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trex-transcend-rope-swing.jpeg-Z5IFprY3ewTOXPua3UPEbB2zhGCA5g.webp",
  "Havana Gold": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TREX-Deck-Havana-Gold-Swatch.jpeg-BHaElnZnIQ6hOZwECBR9ugdPYFiFmc.webp",
  "Lava Rock": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/09313842.jpeg-cpxqMDaPdUkEEkL8frNNg4k47Se9FD.webp",
  "Tiki Torch": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tiki-torch-brown-trex-deck-board-samples-ttt90000-4f_600-YNcNb9dp1Lh2qiR5endtjZOnj7bf8j.jpg",
  "Spiced Rum": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trex-transcend-Spiced-Rum-d7vFjD1a8Lb3ApGo2sxQd0U4gaJvZA.jpg",
  "Island Mist": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/island-mist-grey-trex-deck-board-samples-imt90000-4f_600.jpeg-hO3nizBTQ2AOUSI8bmC3zB6gaxpdMB.avif",
  // Trex Lineage
  "Rainier": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trn-001-ht-swatch-1000x10000-HT010620TLG01.jpeg-WJtd8XHs0uQdCvgJvQ5RO6DBSaAaTN.avif",
  "Carmel": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/carmel-trex-deck-board-samples-cltl90000-66_600.jpeg-tAcerITwurNnvEG4KXTBYAbRpFFAF2.avif",
  "Weathered Teak": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/TREX-Lineage-Island-Mist-texture.jpeg-eDih7ltAgkaP0GSBmDuiL3jRRJqVAh.webp",
  "Biscayne": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trex-transcend-lineage-biscayne-square.jfif-lZoaoqdePbyoxKvT62xcVxdX0eUXmj.jpeg",
  "Pebble Beach": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/49603723-yA7nuj5VRDdvqTW77ETgoqlGYZvEGC.jpg",
  "Jasper": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Trex-Lineage-Jasper-sq-Q0JRZbKvBvQW00Y7idkeiXGcinj75m.jpg",
  "Ember": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/71786813.jpeg-P5JU7SbXCOB4IeRinS8fZK7wNyQKlF.avif",
  // Trex Signature
  "Whidbey": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sig-wy-001-swatch-500-500px_Media-Carousel.jfif-flnk56Ss9aM2ctwzlFG02zxjXIozDr.jpeg",
  "Ocotillo": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/swatch-sig-oc-500x500_Media-Carousel.jfif-ZKTXUz4RJxapPIANN04wQybvPrlDpy.jpeg",
  // Deckorators Venture
  "Saltwater": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20Board%20Color-BhOtokTXK7JuJ0JfwoWlUKU5VKlL9f.png",
  "Sandbar": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Copy%20of%20Board%20Color%20%281%29-Nwm3J5vJw1xehfkao1N1MgyQO4Lxtf.png",
  "Shoreline": "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/101025_Venture_Shoreline_Swatch_1.jpeg-sudakoVbbumSk06Fu2OfR8aG3b7f7R.webp",
};

// Color swatches - hex colors approximating actual decking colors (fallback)
const COLOR_SWATCHES: Record<string, string> = {
  // Trex Enhance
  "Honey Grove": "#C4956C",
  "Tide Pool": "#6B7B7D",
  "Saddle": "#8B6E4E",
  "Toasted Sand": "#D4C4A8",
  // Trex Select
  "Whiskey Barrel": "#6D4C3D",
  "Pebble Grey": "#9A9890",
  // Trex Transcend
  "Havana Gold": "#B08A5B",
  "Island Mist": "#8A9492",
  "Spiced Rum": "#7D5A4A",
  "Tiki Torch": "#C4956C",
  // Trex Lineage
  "Rainier": "#A9A49C",
  "Biscayne": "#C9B9A0",
  "Salt Flat": "#D4CFC7",
  "Hatteras": "#9E8B7D",
  // TimberTech Prime+
  "Coconut Husk": "#B5A38E",
  "Sea Salt Gray": "#A8A8A4",
  "Dark Cocoa": "#5C4A3D",
  // TimberTech Terrain+
  "Sandy Birch": "#C9B89D",
  "Stone Ash": "#9E9A94",
  "Silver Maple": "#B8B2A8",
  "Brown Oak": "#7D6652",
  "Rustic Elm": "#8E7A68",
  // TimberTech Landmark
  "Boardwalk": "#C4B49E",
  "French White Oak": "#D4C8B8",
  "Castle Gate": "#8B7B6B",
  "American Walnut": "#6B5D4D",
  // Deckorators Venture
  "Saltwater": "#8A9A9C",
  "Sandbar": "#C9B8A0",
  "Shoreline": "#A89888",
  // Deckorators Voyage
  "Costa": "#9E8A78",
  "Sierra": "#B4A08A",
  "Khaya": "#7D5C4A",
  "Tundra": "#A8A098",
  "Sedona": "#A87D5D",
  "Mesa": "#B89878",
  // Deckorators Summit
  "Glacier": "#C4C0B8",
  "Boulder": "#7D7872",
  "Cliffside": "#9A9088",
};

export function SurfaceStep() {
  const formData = useWizardStore((s) => s.formData);
  const updateFormData = useWizardStore((s) => s.updateFormData);
  // Get available collections for selected brand
  const selectedBrand = useMemo(
    () => deckingBrands.find((b) => b.id === formData.deckingBrand),
    [formData.deckingBrand]
  );

  // Get available colors for selected collection
  const selectedCollection = useMemo(
    () => selectedBrand?.collections.find((c) => c.id === formData.deckingCollection),
    [selectedBrand, formData.deckingCollection]
  );

  // Handle brand change - reset collection and color
  const handleBrandChange = (brandId: string) => {
    const brand = deckingBrands.find((b) => b.id === brandId);
    const firstCollection = brand?.collections[0];
    const firstColor = firstCollection?.colors[0];

    updateFormData({
      deckingBrand: brandId,
      deckingCollection: firstCollection?.id || "",
      deckingColor: firstColor?.name || "",
      pictureFrameColor: firstColor?.name || "",
    });
  };

  // Handle collection change - reset color
  const handleCollectionChange = (collectionId: string) => {
    const collection = selectedBrand?.collections.find((c) => c.id === collectionId);
    const firstColor = collection?.colors[0];

    updateFormData({
      deckingCollection: collectionId,
      deckingColor: firstColor?.name || "",
      pictureFrameColor: firstColor?.name || "",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Surface Selection</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your decking brand, collection, and colors for the deck surface.
        </p>
      </div>

      <FieldGroup>
        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            Decking Brand
          </FieldLabel>
          <div className="grid grid-cols-3 gap-3 pt-2">
            {deckingBrands.map((brand) => (
              <button
                key={brand.id}
                type="button"
                onClick={() => handleBrandChange(brand.id)}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all hover:bg-muted/50 flex flex-col items-center gap-2",
                  formData.deckingBrand === brand.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border"
                )}
              >
<div 
  className={cn(
    "h-14 w-full flex items-center justify-center p-2 overflow-visible rounded-lg",
    brand.id === "trex" && "bg-[#f8f8f8]"
  )}
>
  {BRAND_LOGOS[brand.id] ? (
  <img
  src={BRAND_LOGOS[brand.id]}
  alt={`${brand.name} logo`}
  className="w-auto max-w-full object-contain"
  style={{ 
    transform: brand.id === "timbertech" ? "scale(1.7)" : brand.id === "trex" ? "scale(1.5)" : undefined,
    height: "100%"
  }}
  />
  ) : (
  <span className="text-base font-bold tracking-tight text-foreground">
  {brand.name}
  </span>
  )}
  </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {brand.collections.length} collections
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Square className="h-4 w-4 text-muted-foreground" />
            Collection
          </FieldLabel>
          <Select
            value={formData.deckingCollection}
            onValueChange={handleCollectionChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a collection" />
            </SelectTrigger>
            <SelectContent>
              {selectedBrand?.collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCollection && (
            <p className="mt-1 text-xs text-muted-foreground">
              Board width: {selectedCollection.boardFaceWidthIn}&quot; |{" "}
              Thickness: {selectedCollection.boardThicknessIn}&quot;
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            Main Deck Color
          </FieldLabel>
          <div className="grid grid-cols-4 gap-2 pt-2 sm:grid-cols-6 lg:grid-cols-8">
            {selectedCollection?.colors.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => updateFormData({ deckingColor: color.name })}
                className={cn(
                  "rounded-lg border-2 overflow-hidden transition-all hover:shadow-md",
                  formData.deckingColor === color.name
                    ? "border-primary ring-2 ring-primary/20 shadow-sm"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                {COLOR_IMAGES[color.name] ? (
                  <div 
                    className="aspect-square w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${COLOR_IMAGES[color.name]})` }}
                  />
                ) : (
                  <div 
                    className="aspect-square w-full"
                    style={{ 
                      backgroundColor: COLOR_SWATCHES[color.name] || '#9a9a9a',
                      backgroundImage: `linear-gradient(135deg, ${COLOR_SWATCHES[color.name] || '#9a9a9a'} 0%, ${adjustColorBrightness(COLOR_SWATCHES[color.name] || '#9a9a9a', -15)} 100%)`
                    }}
                  />
                )}
                <div className="px-1 py-1 bg-background">
                  <p className={cn(
                    "text-[10px] font-medium truncate text-center",
                    formData.deckingColor === color.name ? "text-primary" : "text-foreground"
                  )}>
                    {color.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Field>
      </FieldGroup>

      <hr />

      {/* Picture Frame */}
      <FieldGroup>
        <Field>
          <div className="flex items-center justify-between">
            <div>
              <FieldLabel className="mb-0 flex items-center gap-2">
                <Frame className="h-4 w-4 text-muted-foreground" />
                Picture Frame Border
              </FieldLabel>
              <p className="text-xs text-muted-foreground">
                Add a contrasting or matching border around the deck perimeter
              </p>
            </div>
            <Switch
              checked={formData.pictureFrameEnabled}
              onCheckedChange={(checked) =>
                updateFormData({ pictureFrameEnabled: checked })
              }
            />
          </div>
        </Field>

        {formData.pictureFrameEnabled && (
          <Field>
            <FieldLabel className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Picture Frame Color
            </FieldLabel>
            <p className="text-xs text-muted-foreground mb-2">
              Can be the same or different from the main deck color
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1 sm:grid-cols-6 lg:grid-cols-8">
              {selectedCollection?.colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => updateFormData({ pictureFrameColor: color.name })}
                  className={cn(
                    "rounded-lg border-2 overflow-hidden transition-all hover:shadow-md",
                    formData.pictureFrameColor === color.name
                      ? "border-accent ring-2 ring-accent/20 shadow-sm"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  {COLOR_IMAGES[color.name] ? (
                    <div 
                      className="aspect-square w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${COLOR_IMAGES[color.name]})` }}
                    />
                  ) : (
                    <div 
                      className="aspect-square w-full"
                      style={{ 
                        backgroundColor: COLOR_SWATCHES[color.name] || '#9a9a9a',
                        backgroundImage: `linear-gradient(135deg, ${COLOR_SWATCHES[color.name] || '#9a9a9a'} 0%, ${adjustColorBrightness(COLOR_SWATCHES[color.name] || '#9a9a9a', -15)} 100%)`
                      }}
                    />
                  )}
                  <div className="px-1 py-1 bg-background">
                    <p className={cn(
                      "text-[10px] font-medium truncate text-center",
                      formData.pictureFrameColor === color.name ? "text-accent" : "text-foreground"
                    )}>
                      {color.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Field>
        )}
      </FieldGroup>

      {/* Selection Preview */}
      <div className="rounded-lg bg-secondary/50 p-4">
        <p className="text-sm font-medium">Selected Surface Package</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedBrand?.name} {selectedCollection?.name} - {formData.deckingColor}
          {formData.pictureFrameEnabled && (
            <>
              {" "}
              | Picture Frame: {formData.pictureFrameColor}
            </>
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Includes color-matched 1x8 and 1x12 fascia boards
        </p>
      </div>
    </div>
  );
}
