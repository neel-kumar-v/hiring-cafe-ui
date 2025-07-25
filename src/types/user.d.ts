export interface SavedSearch {
  id: string;
  name: string;
  searchState: import("./search").SearchState;
  modifiedAt: Date;
}

export interface User {
  name: string;
  savedSearches: SavedSearch[];
} 