import { Keywords, Select } from '../../types/search';

// Utility functions for checking if items are selected

export function isSelectItemSelected<T>(
  currentValue: Select<T>,
  item: T
): boolean {
  if (currentValue === "All") return true;
  if (Array.isArray(currentValue)) {
    return currentValue.includes(item);
  }
  return false;
}

export function isSelectWithNullItemSelected<T>(
  currentValue: Select<T, null>,
  item: T
): boolean {
  if (!Array.isArray(currentValue)) return true;
  return currentValue.includes(item);
}

export function isKeywordsItemSelected(
  keywords: Keywords,
  item: string,
  type: 'include' | 'exclude'
): boolean {
  const items = keywords[type];
  if (type === 'exclude' && items === "None") return false;
  if (Array.isArray(items)) {
    return items.includes(item);
  }
  return false;
}
