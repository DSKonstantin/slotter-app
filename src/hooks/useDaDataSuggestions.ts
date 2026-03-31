import { useEffect, useRef, useState } from "react";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";

const DADATA_URL =
  "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
const API_KEY = process.env.EXPO_PUBLIC_DADATA_API_KEY ?? "";
const DEBOUNCE_MS = 300;

export function useDaDataSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(DADATA_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Token ${API_KEY}`,
          },
          body: JSON.stringify({ query, count: 5 }),
        });

        const data = await response.json();
        const items: AutocompleteItem[] = (data.suggestions ?? []).map(
          (s: { value: string }) => ({
            id: s.value,
            title: s.value,
          }),
        );
        setSuggestions(items);
      } catch {
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { suggestions, isLoading };
}
