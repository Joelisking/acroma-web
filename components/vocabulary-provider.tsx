"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getVocabulary, type Vocabulary } from "@/lib/vocabulary";
import type { BusinessType } from "@/lib/api/types";

// Thin client-side hand-off so deeply nested client components can read
// the merchant's vocabulary without prop drilling. Wrapped once at the
// dashboard layout level (the server component there resolves
// `business.businessType` and passes it in); descendants use `useVocab()`.
//
// Server components should keep calling `getVocabulary()` directly — they
// already have access to the business via `getCurrentBusiness()` and
// don't need to go through React context.
const VocabularyContext = createContext<Vocabulary>(getVocabulary(null));

type VocabularyProviderProps = {
  businessType: BusinessType | null | undefined;
  children: ReactNode;
};

export function VocabularyProvider({
  businessType,
  children,
}: VocabularyProviderProps) {
  return (
    <VocabularyContext.Provider value={getVocabulary(businessType)}>
      {children}
    </VocabularyContext.Provider>
  );
}

export function useVocab(): Vocabulary {
  return useContext(VocabularyContext);
}
