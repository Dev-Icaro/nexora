import { type ReactNode, useEffect, useState } from 'react';

import { applyTheme, getStoredTheme, resolveTheme, setStoredTheme } from '@/shared/lib/theme';
import type { ResolvedTheme, ThemePreference } from '@/shared/types';

import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => resolveTheme(getStoredTheme()));

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (preference !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    function handleChange() {
      setResolvedTheme(resolveTheme('system'));
    }

    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [preference]);

  function setTheme(theme: ThemePreference) {
    setPreference(theme);
    setStoredTheme(theme);
    setResolvedTheme(resolveTheme(theme));
  }

  return (
    <ThemeContext.Provider value={{ preference, resolvedTheme, isDark: resolvedTheme === 'dark', setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
