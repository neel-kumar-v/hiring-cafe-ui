/**
 * Demo seed data for Classic Saved Searches in the AppSidebar.
 * Used when signed out or when the user has no saved searches yet,
 * allowing live demos without requiring authentication.
 */

import type { SearchState } from "@/types/search";

export interface DemoSavedSearch {
  _id: string;
  name: string;
  searchState?: Partial<SearchState>;
  alertsEnabled?: boolean;
  updatedAt?: number;
}

export const DEMO_SAVED_SEARCHES: DemoSavedSearch[] = [
  {
    _id: "demo-search-remote-react",
    name: "Senior Frontend / React — Remote",
    alertsEnabled: true,
    updatedAt: 1793380000000,
    searchState: {
      commitment: ["Full Time"],
      job_titles: {
        title: {
          OR: ["Frontend", "React", "Staff Frontend"],
        },
        technical: {},
        description: {},
        requirements: {},
      },
      location: {
        defaultUserLocation: false,
        userLocation: {
          searched: false,
          id: "",
          types: [],
          address: { formatted: "", components: [] },
          geographical: { latitude: 0, longitude: 0 },
        },
        location: [],
        workplace_type: ["Remote"],
        workplace_activity: {
          environment: "All",
          mobility: "All",
          physical_intensity: "All",
          cognitive_intensity: "All",
          computer_usage: "All",
          oral_communication: "All",
        },
      },
    },
  },
  {
    _id: "demo-search-fullstack-150k",
    name: "Full Stack Engineer — $150k+",
    alertsEnabled: false,
    updatedAt: 1793365000000,
    searchState: {
      commitment: ["Full Time"],
      salary: {
        min_range: { min: 150000, max: 0 },
        max_range: { min: 0, max: 0 },
        listedUnit: "Yearly",
        unit: "Yearly",
        currency: "USD",
        undisclosed: false,
      },
      job_titles: {
        title: {
          OR: ["Full Stack", "Fullstack", "Software Engineer"],
        },
        technical: {},
        description: {},
        requirements: {},
      },
    },
  },
  {
    _id: "demo-search-ai-ml-lead",
    name: "AI & Machine Learning Lead",
    alertsEnabled: false,
    updatedAt: 1793290000000,
    searchState: {
      commitment: ["Full Time"],
      job_titles: {
        title: {
          OR: ["Machine Learning", "AI Engineer", "Lead AI"],
        },
        technical: {},
        description: {},
        requirements: {},
      },
    },
  },
];
