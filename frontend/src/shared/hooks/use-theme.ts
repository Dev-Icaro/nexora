import { useMutation } from '@apollo/client/react';
import { useContext } from 'react';

import { UPDATE_THEME_PREFERENCE_MUTATION } from '@/features/settings/api/settings.mutations';
import { toast } from '@/shared/lib/toast';
import type { ThemePreference } from '@/shared/types';

import { ThemeContext, type ThemeContextValue } from '../providers/theme-context';

type UseThemeResult = Omit<ThemeContextValue, 'setTheme'> & {
  setTheme: (theme: ThemePreference) => void;
};

export function useTheme(): UseThemeResult {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');

  const [mutate] = useMutation(UPDATE_THEME_PREFERENCE_MUTATION);

  const { setTheme: applyLocal } = ctx;

  function setTheme(theme: ThemePreference) {
    applyLocal(theme);
    mutate({ variables: { theme } }).catch(error => {
      toast.error(error);
    });
  }

  return { ...ctx, setTheme };
}
