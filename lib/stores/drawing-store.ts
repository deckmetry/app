// Deckmetry Drawing Store — Zustand v5

import { create } from "zustand";

export interface DrawingLayers {
  footings: boolean;
  framing: boolean;
  decking: boolean;
  railing: boolean;
  lights: boolean;
}

interface DrawingState {
  layers: DrawingLayers;
  isFullscreen: boolean;

  setLayers: (
    layers: DrawingLayers | ((prev: DrawingLayers) => DrawingLayers)
  ) => void;
  toggleLayer: (layer: keyof DrawingLayers) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  layers: {
    footings: true,
    framing: true,
    decking: true,
    railing: true,
    lights: true,
  },
  isFullscreen: false,

  setLayers: (layers) =>
    set((state) => ({
      layers: typeof layers === "function" ? layers(state.layers) : layers,
    })),

  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),

  setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
}));
