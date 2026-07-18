export interface BreadcrumbSegment {
  label: string;
  path: string;
}

const LABEL_OVERRIDES: Record<string, string> = {
  dashboard: 'Dashboard',
  login: 'Sign In',
};

function toTitleCase(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function buildBreadcrumbs(pathname: string): BreadcrumbSegment[] {
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return [{ label: 'Dashboard', path: '/' }];
  }

  let accumulatedPath = '';

  return segments.map((segment) => {
    accumulatedPath += `/${segment}`;
    return {
      label: LABEL_OVERRIDES[segment] ?? toTitleCase(segment),
      path: accumulatedPath,
    };
  });
}
