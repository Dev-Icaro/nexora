export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong';

export type PasswordStrength = {
  score: number;
  level: StrengthLevel;
  label: string;
};

const CRITERIA = [
  (p: string) => p.length >= 8,
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /[a-z]/.test(p),
  (p: string) => /\d/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
];

export function getPasswordStrength(password: string): PasswordStrength {
  const score = CRITERIA.reduce((acc, check) => acc + (check(password) ? 1 : 0), 0);

  if (score <= 1) return { score, level: 'weak', label: 'Weak' };
  if (score === 2) return { score, level: 'fair', label: 'Fair' };
  if (score <= 4) return { score, level: 'good', label: 'Good' };
  return { score, level: 'strong', label: 'Strong' };
}
