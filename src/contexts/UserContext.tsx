"use client";

import { SavedSearch, User } from "@/types/user";
import React, { createContext, ReactNode, useContext, useState } from "react";

const defaultSavedSearches: SavedSearch[] = [
  {
    id: "1",
    name: "Software Engineer Remote",
    searchState: {
      sort: { by: "Relevance", order: "Most" },
      date_range: { magnitude: 7, unit: "Days" },
      apply_form: "All",
      exclusion: [],
      benefits: [],
      encouraged: [],
      department: "All",
      salary: { min_range: { min: 80000, max: 90000 }, max_range: { min: 120000, max: 150000 }, listedUnit: "Yearly", unit: "Yearly", currency: "USD", undisclosed: false },
      commitment: "All",
      experience: { level: "All", role: "None" },
      job_titles: { 
        title: "Software Engineer", 
        technical: {
          AND: [
            "Git",
            "Go",
            {
              NOT: {
                OR: ["excel", "word", "outlook"]
              }
            }
          ]
        }, 
        description: "", 
        requirements: "" 
      },
      education: {
        associate: { preferences: null, keywords: { include: [], exclude: "None" } },
        bachelor: { preferences: null, keywords: { include: [], exclude: "None" } },
        master: { preferences: null, keywords: { include: [], exclude: "None" } },
        doctorate: { preferences: null, keywords: { include: [], exclude: "None" } }
      },
      license_certification: { hide_required: false, keywords: { include: [], exclude: "None" } },
      security_clearance: [],
      language: { include: [], exclude: "None" },
      shift_preferences: {
        morning: null,
        afternoon: null,
        evening: null,
        weekend: "None",
        holiday: "None",
        overtime: "None",
        oncall: "None"
      },
      travel_requirements: { air: "All", land: "All" },
      location: {
        defaultUserLocation: false,
        userLocation: {
          searched: false,
          id: "",
          types: [],
          address: { formatted: "", components: [] },
          geographical: { latitude: 0, longitude: 0 }
        },
        location: [],
        workplace_type: ["Remote"],
        environment: "All",
        demands: {
          mobility: "All",
          physical_intensity: "All",
          cognitive_intensity: "All",
          computer_usage: "All",
          oral_communication: "All"
        }
      },
      company: { include: [], exclude: "None" },
      industry: {
        profit: "All",
        activities: { include: [], exclude: "None" },
        industry: { include: [], exclude: "None" },
        usa_jobs: "All"
      },
      stage_funding: {
        current: "All",
        investors: { include: [], exclude: "None" },
        latest_round: { min: 0, max: 0 },
        latest_round_type: { include: [], exclude: "None" },
        latest_round_amount: { min: 0, max: 0 }
      },
      size: { min: 0, max: 0 },
      founding_year: { min: 0, max: 0 }
    },
    modifiedAt: new Date("2024-01-15")
  },
  {
    id: "2", 
    name: "Data Scientist Entry Level",
    searchState: {
      sort: { by: "Recency", order: "Most" },
      date_range: { magnitude: 30, unit: "Days" },
      apply_form: "Fast",
      exclusion: [],
      benefits: [],
      encouraged: [],
      department: ["Data and Analytics"],
      salary: { min_range: { min: 60000, max: 90000 }, max_range: { min: 120000, max: 150000 }, listedUnit: "Yearly", unit: "Yearly", currency: "USD", undisclosed: false },
      commitment: ["Full Time"],
      experience: { level: ["Entry Level"], role: "None" },
      job_titles: { title: "Data Scientist", technical: "Python SQL", description: "", requirements: "" },
      education: {
        associate: { preferences: null, keywords: { include: [], exclude: "None" } },
        bachelor: { preferences: ["Required"], keywords: { include: ["Computer Science", "Statistics"], exclude: "None" } },
        master: { preferences: ["Preferred"], keywords: { include: [], exclude: "None" } },
        doctorate: { preferences: null, keywords: { include: [], exclude: "None" } }
      },
      license_certification: { hide_required: false, keywords: { include: [], exclude: "None" } },
      security_clearance: [],
      language: { include: [], exclude: "None" },
      shift_preferences: {
        morning: null,
        afternoon: null,
        evening: null,
        weekend: "None",
        holiday: "None",
        overtime: "None",
        oncall: "None"
      },
      travel_requirements: { air: "All", land: "All" },
      location: {
        defaultUserLocation: true,
        userLocation: {
          searched: false,
          id: "",
          types: [],
          address: { formatted: "", components: [] },
          geographical: { latitude: 0, longitude: 0 }
        },
        location: [],
        workplace_type: "All",
        environment: "All",
        demands: {
          mobility: "All",
          physical_intensity: "All",
          cognitive_intensity: "All",
          computer_usage: "All",
          oral_communication: "All"
        }
      },
      company: { include: [], exclude: "None" },
      industry: {
        profit: "All",
        activities: { include: [], exclude: "None" },
        industry: { include: [], exclude: "None" },
        usa_jobs: "All"
      },
      stage_funding: {
        current: "All",
        investors: { include: [], exclude: "None" },
        latest_round: { min: 0, max: 0 },
        latest_round_type: { include: [], exclude: "None" },
        latest_round_amount: { min: 0, max: 0 }
      },
      size: { min: 0, max: 0 },
      founding_year: { min: 0, max: 0 }
    },
    modifiedAt: new Date("2024-01-10")
  }
];

const defaultUser: User = {
  name: "Demo User",
  savedSearches: defaultSavedSearches
};

interface UserContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(defaultUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
} 