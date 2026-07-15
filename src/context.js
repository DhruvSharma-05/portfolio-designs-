import { createContext, useContext } from "react";

/* App-wide context: current theme + the aperture page-transition `go`.
   Kept in its own file so ui.jsx can stay a components-only module. */
const AppContext = createContext(null);
export const AppProvider = AppContext.Provider;
export const useApp = () => useContext(AppContext);
