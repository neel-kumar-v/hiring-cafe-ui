import { BooleanOperator, DegreePreferences, DegreePreferencesOptions, Keywords, SearchExpression, SearchState, Select } from '../../types/search';

export function createEducationPreferenceHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', preference: DegreePreferences) => {
    const currentPreferences = currentEducation[degreeType].preferences;
    
    let newPreferences: Select<DegreePreferences, null>;
    
    if (Array.isArray(currentPreferences)) {
      if (currentPreferences.includes(preference)) {
        const filtered = currentPreferences.filter(p => p !== preference);
        newPreferences = filtered.length > 0 ? filtered : null;
      } else {
        newPreferences = [...currentPreferences, preference];
      }
    } else {
      newPreferences = [preference];
    }
    
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          preferences: newPreferences
        }
      }
    });
  };
}

export function createEducationKeywordsHandler(
  currentEducation: DegreePreferencesOptions,
  updateSearchOptions: (updates: Partial<SearchState>) => void
) {
  return (degreeType: 'associate' | 'bachelor' | 'master' | 'doctorate', keywords: Keywords) => {
    updateSearchOptions({
      education: {
        ...currentEducation,
        [degreeType]: {
          ...currentEducation[degreeType],
          keywords
        }
      }
    });
  };
}
export function parseSearchExpression(input: string): SearchExpression<string> {
  const tokens: string[] = [];
  let index = 0;

  while (index < input.length) {
    const char = input[index];

    if (char === ' ') {
      index++;
      continue;
    }

    if (char === '(' || char === ')') {
      tokens.push(char);
      index++;
      continue;
    }

    if (char === '"') {
      let end = index + 1;
      let phrase = '';
      while (end < input.length && input[end] !== '"') {
        phrase += input[end++];
      }
      tokens.push(phrase);
      index = end + 1;
      continue;
    }

    if (/^[A-Za-z]$/.test(char)) {
      let end = index;
      while (end < input.length && /[A-Za-z]/.test(input[end])) end++;
      const word = input.slice(index, end).toUpperCase();
      if (word === "AND" || word === "OR" || word === "NOT") {
        tokens.push(word);
        index = end;
        continue;
      }
    }

    let end = index;
    while (end < input.length && ![' ', '(', ')', '"'].includes(input[end])) end++;
    tokens.push(input.slice(index, end));
    index = end;
  }

  let pos = 0;

  function parseExpression(): SearchExpression<string> {
    let currentOp: "AND" | "OR" | null = null;
    const exprStack: (SearchExpression<string> | BooleanOperator<string>)[] = [];

    while (pos < tokens.length) {
      const token = tokens[pos];

      if (token === ')') break;

      if (token === '(') {
        pos++;
        const group = parseExpression();
        if (currentOp && exprStack.length) {
          const prev = exprStack.pop()!;
          exprStack.push({ [currentOp]: [prev, group] });
          currentOp = null;
        } else {
          exprStack.push(group);
        }
        if (tokens[pos] === ')') pos++;
        continue;
      }

      if (token === 'AND' || token === 'OR') {
        currentOp = token;
        pos++;
        continue;
      }

      if (token === 'NOT') {
        pos++;
        let next: SearchExpression<string>;
        if (tokens[pos] === '(') {
          pos++;
          next = parseExpression();
          if (tokens[pos] === ')') pos++;
        } else {
          next = tokens[pos++];
        }
        exprStack.push({ NOT: next });
        continue;
      }

      if (currentOp && exprStack.length) {
        const prev = exprStack.pop()!;
        exprStack.push({ [currentOp]: [prev, token] });
        currentOp = null;
      } else {
        exprStack.push(token);
      }
      pos++;
    }

    while (exprStack.length > 1) {
      const first = exprStack.shift()!;
      const second = exprStack.shift()!;
      exprStack.unshift({ AND: [first, second] });
    }

    return exprStack[0] ?? "";
  }

  return parseExpression();
}