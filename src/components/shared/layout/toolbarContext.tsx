import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type SearchConfig = {
  placeholder?: string;
  onChange: (text: string) => void;
  onClose?: () => void;
};

type ToolbarContextValue = {
  searchMode: boolean;
  searchValue: string;
  searchPlaceholder: string;
  hasSearch: boolean;
  openSearch: () => void;
  handleSearchChange: (text: string) => void;
  handleSearchClose: () => void;
  registerSearch: (config: SearchConfig) => void;
  unregisterSearch: () => void;
};

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export function ToolbarProvider({ children }: { children: React.ReactNode }) {
  const [searchMode, setSearchMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [hasSearch, setHasSearch] = useState(false);
  const configRef = useRef<SearchConfig | null>(null);

  const openSearch = useCallback(() => setSearchMode(true), []);

  const handleSearchChange = useCallback((text: string) => {
    setSearchValue(text);
    configRef.current?.onChange(text);
  }, []);

  const handleSearchClose = useCallback(() => {
    setSearchMode(false);
    setSearchValue("");
    configRef.current?.onChange("");
    configRef.current?.onClose?.();
  }, []);

  const registerSearch = useCallback((config: SearchConfig) => {
    configRef.current = config;
    setHasSearch(true);
  }, []);

  const unregisterSearch = useCallback(() => {
    configRef.current = null;
    setHasSearch(false);
    setSearchMode(false);
    setSearchValue("");
  }, []);

  return (
    <ToolbarContext.Provider
      value={{
        searchMode,
        searchValue,
        searchPlaceholder: configRef.current?.placeholder ?? "Поиск...",
        hasSearch,
        openSearch,
        handleSearchChange,
        handleSearchClose,
        registerSearch,
        unregisterSearch,
      }}
    >
      {children}
    </ToolbarContext.Provider>
  );
}

export function useToolbarContext() {
  const ctx = useContext(ToolbarContext);
  if (!ctx)
    throw new Error(
      "useToolbarContext must be used inside ScreenWithToolbar children",
    );
  return ctx;
}

export function useToolbarSearch(config: SearchConfig) {
  const { registerSearch, unregisterSearch } = useToolbarContext();

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    registerSearch(configRef.current);
    return () => unregisterSearch();
  }, [registerSearch, unregisterSearch]);
}
