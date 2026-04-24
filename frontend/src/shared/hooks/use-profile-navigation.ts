import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useProfileNavigation() {
  const navigate = useNavigate();

  const navigateToProfile = useCallback(
    (userId: string) => {
      navigate(`/profile/${userId}`);
    },
    [navigate],
  );

  return { navigateToProfile };
}
