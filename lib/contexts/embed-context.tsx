"use client";

import { createContext, useContext } from "react";

export interface EmbedContextValue {
  isEmbed: boolean;
  supplierOrgId: string;
  supplierSlug: string;
  supplierName: string;
  logoUrl: string | null;
  primaryColor: string;
  showHeader: boolean;
}

const defaultValue: EmbedContextValue = {
  isEmbed: false,
  supplierOrgId: "",
  supplierSlug: "",
  supplierName: "",
  logoUrl: null,
  primaryColor: "#2d7a6b",
  showHeader: true,
};

const EmbedContext = createContext<EmbedContextValue>(defaultValue);

export function EmbedProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: EmbedContextValue;
}) {
  return (
    <EmbedContext.Provider value={value}>{children}</EmbedContext.Provider>
  );
}

export function useEmbed() {
  return useContext(EmbedContext);
}
