export type ClassValue = string | number | null | undefined | false | Record<string, boolean>;

/**
 * Lightweight class name combinator. Accepts strings, conditional objects,
 * falsy values (ignored), avoiding an extra dependency on clsx/classnames.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
      continue;
    }

    for (const [key, value] of Object.entries(input)) {
      if (value) classes.push(key);
    }
  }

  return classes.join(' ').trim();
}
