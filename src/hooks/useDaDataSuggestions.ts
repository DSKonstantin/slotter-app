import { useEffect, useState } from "react";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";

const DADATA_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const API_KEY = process.env.EXPO_PUBLIC_DADATA_API_KEY;

export function useDaDataSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || !API_KEY) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(DADATA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${API_KEY}`,
      },
      body: JSON.stringify({ query, count: 10 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const items: AutocompleteItem[] = (data.suggestions ?? []).map(
          (s: { value: string }) => ({
            id: s.value,
            title: s.value,
          }),
        );
        setSuggestions(items);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [query]);

  return { suggestions, isLoading };
}
