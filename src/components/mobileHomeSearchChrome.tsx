import { createContext, useContext } from "react";

type MobileHomeSearchChromeContextValue = {
  searchExpanded: boolean;
  setSearchExpanded: (expanded: boolean) => void;
};

export const MobileHomeSearchChromeContext =
  createContext<MobileHomeSearchChromeContextValue | null>(null);

export function useMobileHomeSearchChrome() {
  return useContext(MobileHomeSearchChromeContext);
}
