import { describe, expect, it } from 'vitest';
import { isNavActive, navItems } from '../../src/lib/nav';

describe('nav', () => {
  it('exposes primary navigation items', () => {
    expect(navItems.map((item) => item.label)).toEqual([
      'Home',
      'Posts',
      'Projects',
      'Resume',
    ]);
  });

  it('marks active route', () => {
    expect(isNavActive('home', 'home')).toBe(true);
    expect(isNavActive('posts', 'home')).toBe(false);
  });
});
