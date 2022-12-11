import { ReactNode, useEffect } from 'react';
import { ThemeContext } from '@/components/theme/useThemeContext';
import { useRecoilState } from 'recoil';
import { themeState } from '@/middleware/store';
import { store, THEME_SETTING_KEY } from '@/middleware/store';
import log from '@/middleware/logger';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useRecoilState(themeState);

  const toggleTheme = () => {
    setThemeMode((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      store.set(THEME_SETTING_KEY, newTheme).then((res) => {
        log.info('ThemeProvider toggleTheme', res, newTheme);
      });
      return newTheme;
    });
  };

  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>{children}</ThemeContext.Provider>
  );
};
