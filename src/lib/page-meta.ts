export function formatListCount(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

export function formatPageListMeta(
  count: number,
  singular: string,
  plural: string,
  sortLabel: string,
): string {
  return `${formatListCount(count, singular, plural)} · ${sortLabel}`;
}

export const SORT_BY_DATE = 'sorted by date';
export const SORT_BY_YEAR = 'sorted by year';
