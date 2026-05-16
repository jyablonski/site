import { describe, expect, it } from 'vitest';
import {
  formatListCount,
  formatPageListMeta,
  SORT_BY_DATE,
  SORT_BY_YEAR,
} from '../../src/lib/page-meta';

describe('page-meta', () => {
  it('formats singular and plural counts', () => {
    expect(formatListCount(1, 'post', 'posts')).toBe('1 post');
    expect(formatListCount(3, 'post', 'posts')).toBe('3 posts');
    expect(formatListCount(7, 'project', 'projects')).toBe('7 projects');
  });

  it('builds page list meta with sort label', () => {
    expect(formatPageListMeta(1, 'post', 'posts', SORT_BY_DATE)).toBe(
      '1 post · sorted by date',
    );
    expect(formatPageListMeta(7, 'project', 'projects', SORT_BY_YEAR)).toBe(
      '7 projects · sorted by year',
    );
  });
});
