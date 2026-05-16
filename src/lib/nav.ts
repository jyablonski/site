export type ActiveRoute = 'home' | 'posts' | 'projects' | 'resume';

export interface NavItem {
  label: string;
  href: string;
  route: ActiveRoute;
}

export const navItems: NavItem[] = [
  { label: 'Home', href: '/', route: 'home' },
  { label: 'Posts', href: '/posts/', route: 'posts' },
  { label: 'Projects', href: '/projects/', route: 'projects' },
  { label: 'Resume', href: '/resume/', route: 'resume' },
];

export function isNavActive(active: ActiveRoute, route: ActiveRoute): boolean {
  return active === route;
}
