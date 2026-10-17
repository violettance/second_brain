export const designColorTokens = {
  ink: '--color-brand-dark',
  canvas: '--color-brand-light',
  surface: '--color-surface',
  primary: '--color-brand-primary',
  secondary: '--color-brand-secondary',
  yellow: '--color-brand-yellow',
  purple: '--color-brand-purple',
  muted: '--color-neutral-muted',
  softBorder: '--color-neutral-soft',
} as const;

export type DesignColorName = keyof typeof designColorTokens;

export const resolveColorValue = (value: string): string => {
  if (typeof window === 'undefined') return value;
  const tokenName = value.match(/^var\((--[\w-]+)\)$/)?.[1];
  return tokenName
    ? getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim()
    : value;
};

/** Resolve a semantic color token for canvas APIs and chart libraries. */
export const resolveDesignColor = (name: DesignColorName): string => {
  return resolveColorValue(`var(${designColorTokens[name]})`);
};

/** Read a numeric design token for APIs that require plain pixel values. */
export const resolveDesignNumber = (name: string, fallback = 0): number => {
  if (typeof window === 'undefined') return fallback;
  const value = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
};
