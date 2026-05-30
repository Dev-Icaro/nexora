import { useMutation } from '@apollo/client/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { RESEND_VERIFICATION_EMAIL_MUTATION } from '../api/auth.mutations';

const COOLDOWN_SECONDS = 60;

type UseResendVerificationEmailResult = {
  resend: (email: string) => Promise<void>;
  loading: boolean;
  cooldownRemaining: number;
};

export function useResendVerificationEmail(): UseResendVerificationEmailResult {
  const [resendMutation, { loading }] = useMutation(RESEND_VERIFICATION_EMAIL_MUTATION);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(COOLDOWN_SECONDS);
    intervalRef.current = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const resend = async (email: string) => {
    await resendMutation({ variables: { email } });
    startCooldown();
  };

  return { resend, loading, cooldownRemaining };
}
