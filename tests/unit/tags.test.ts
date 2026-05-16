import { describe, expect, it } from 'vitest';
import {
  formatTopicSlugCollisions,
  getAllTags,
  getTagNames,
  getTopicLinks,
  getTopicSlugCollisions,
  tagMatchesSlug,
  tagToSlug,
} from '../../src/lib/tags';

const posts = [
  { tags: ['test', 'first'] },
  { tags: ['test', 'sample'] },
  { tags: ['test'] },
];

describe('tags', () => {
  it('converts tags to route-safe slugs', () => {
    expect(tagToSlug('Data Engineering')).toBe('data-engineering');
    expect(tagToSlug('C++')).toBe('c');
    expect(tagToSlug('ML/AI')).toBe('ml-ai');
  });

  it('matches tags by slug', () => {
    expect(tagMatchesSlug('Data Engineering', 'data-engineering')).toBe(true);
    expect(tagMatchesSlug('first', 'sample')).toBe(false);
  });

  it('detects slug collisions across tags', () => {
    expect(getTopicSlugCollisions(['C++', 'C#', 'C'])).toEqual([
      ['C++', 'C#', 'C'],
    ]);
    expect(getTopicSlugCollisions(['Go', 'Linux'])).toEqual([]);
  });

  it('throws when building topic links with slug collisions', () => {
    expect(() =>
      getTopicLinks([{ tags: ['C++', 'Rust'] }, { tags: ['C#'] }]),
    ).toThrow(/Duplicate topic slugs/);
    expect(formatTopicSlugCollisions([['C++', 'C#']])).toContain('"C++"');
  });

  it('counts tags and sorts by frequency then name', () => {
    expect(getAllTags(posts)).toEqual([
      { tag: 'test', count: 3 },
      { tag: 'first', count: 1 },
      { tag: 'sample', count: 1 },
    ]);
  });

  it('returns unique tag names in sorted order', () => {
    expect(getTagNames(posts)).toEqual(['test', 'first', 'sample']);
  });

  it('returns topic links with labels and slugs', () => {
    expect(getTopicLinks([{ tags: ['Data Engineering'] }])).toEqual([
      { label: 'Data Engineering', slug: 'data-engineering' },
    ]);
  });

  it('returns empty list for no posts', () => {
    expect(getAllTags([])).toEqual([]);
    expect(getTagNames([])).toEqual([]);
    expect(getTopicLinks([])).toEqual([]);
  });
});
