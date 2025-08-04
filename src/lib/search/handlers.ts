import { Keywords, SearchState, Select } from '../../types/search';

// Generalized handler functions for SearchState updates

export function createSelectHandler<T>(
  currentValue: Select<T>,
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (item: T) => {
    let newValue: Select<T>;
    
    if (currentValue === "All") {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (Array.isArray(currentValue)) {
      if (currentValue.includes(item)) {
        const filtered = currentValue.filter(option => option !== item);
        newValue = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentValue, item];
        newValue = added.length === allOptions.length ? "All" : added;
      }
    } else {
      newValue = [item];
    }
    
    updateSearchOptions({ [path]: newValue } as Partial<SearchState>);
  };
}

export function createSelectWithNullHandler<T>(
  currentValue: Select<T, null>,
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (item: T) => {
    let newValue: Select<T, null>;
    
    if (!Array.isArray(currentValue)) {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (currentValue.includes(item)) {
      const filtered = currentValue.filter(option => option !== item);
      newValue = filtered.length === 0 ? null : filtered;
    } else {
      newValue = [...currentValue, item];
      if (newValue.length === allOptions.length) newValue = null;
    }
    
    updateSearchOptions({ [path]: newValue } as Partial<SearchState>);
  };
}

export function createKeywordsHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (keywords: Keywords) => {
    updateSearchOptions({ [path]: keywords } as Partial<SearchState>);
  };
}

export function createRangeHandler(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return ([min, max]: [number, number]) => {
    updateSearchOptions({ [path]: { min, max } } as Partial<SearchState>);
  };
}

export function createBooleanHandler(
  currentValue: boolean,
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (checked: boolean | "indeterminate") => {
    updateSearchOptions({ [path]: Boolean(checked) } as Partial<SearchState>);
  };
}

export function createRadioHandler<T>(
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string
) {
  return (value: T) => {
    updateSearchOptions({ [path]: value } as Partial<SearchState>);
  };
}

export function createNestedSelectHandler<T>(
  currentValue: { [key: string]: Select<T> },
  allOptions: T[],
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (item: T) => {
    let newValue: Select<T>;
    
    const currentSelectValue = currentValue[nestedPath];
    
    if (currentSelectValue === "All") {
      const allExceptSelected = allOptions.filter(option => option !== item);
      newValue = allExceptSelected;
    } else if (Array.isArray(currentSelectValue)) {
      if (currentSelectValue.includes(item)) {
        const filtered = currentSelectValue.filter(option => option !== item);
        newValue = filtered.length === 0 ? "All" : filtered;
      } else {
        const added = [...currentSelectValue, item];
        newValue = added.length === allOptions.length ? "All" : added;
      }
    } else {
      newValue = [item];
    }
    
    const nestedUpdate = { [nestedPath]: newValue };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

export function createNestedKeywordsHandler(
  currentValue: { [key: string]: Keywords },
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (keywords: Keywords) => {
    const nestedUpdate = { [nestedPath]: keywords };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
}

export function createNestedBooleanHandler(
  currentValue: { [key: string]: boolean },
  updateSearchOptions: (updates: Partial<SearchState>) => void,
  path: keyof SearchState | string,
  nestedPath: string
) {
  return (checked: boolean | "indeterminate") => {
    const nestedUpdate = { [nestedPath]: Boolean(checked) };
    updateSearchOptions({ [path]: { ...currentValue, ...nestedUpdate } } as Partial<SearchState>);
  };
} 