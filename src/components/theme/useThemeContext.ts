import { createContext, useContext } from 'react';
import type { ThemeMode } from '@/middleware/store';

interface ThemeContextType {
  themeMode: ThemeMode;
  toggleTheme: () => void;
}
export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);
export const useThemeContext = () => useContext(ThemeContext);
