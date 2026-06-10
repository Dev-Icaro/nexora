import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | Nexora`;
    return () => {
      document.title = 'Nexora';
    };
  }, [title]);
}
