import assert from "node:assert/strict";
import test from "node:test";
import { getExperienceTitle, getExperienceYearSentence, getRoleTypeTitle, getSeniorityTitle } from "../../src/components/search/filters/compensation/Experience";
import type { SearchState } from "../../src/types/search";

test("getExperienceYearSentence formats single year correctly with singular 'year'", () => {
  assert.equal(getExperienceYearSentence(1, 0, "individual contributor"), "Must have at least 1 year of individual contributor experience");
  assert.equal(getExperienceYearSentence(0, 1, "people manager"), "Must have up to 1 year of people manager experience");
  assert.equal(getExperienceYearSentence(1, 1, "individual contributor"), "Must have 1 year of individual contributor experience");
});

test("getExperienceYearSentence formats ranges with plural 'years'", () => {
  assert.equal(getExperienceYearSentence(2, 5, "individual contributor"), "Must have between 2 – 5 years of individual contributor experience");
  assert.equal(getExperienceYearSentence(5, 2, "individual contributor"), "Must have between 2 – 5 years of individual contributor experience");
  assert.equal(getExperienceYearSentence(3, 0, "people manager"), "Must have at least 3 years of people manager experience");
  assert.equal(getExperienceYearSentence(0, 4, "people manager"), "Must have up to 4 years of people manager experience");
  assert.equal(getExperienceYearSentence(3, 3, "people manager"), "Must have 3 years of people manager experience");
});

test("getExperienceYearSentence returns null when neither min nor max is set", () => {
  assert.equal(getExperienceYearSentence(0, 0, "individual contributor"), null);
});

test("getSeniorityTitle returns sentence query for seniority levels", () => {
  assert.equal(getSeniorityTitle("All"), "Show jobs requiring any seniority");
  assert.equal(getSeniorityTitle(undefined), "Show jobs requiring any seniority");
  assert.equal(getSeniorityTitle(["Entry Level", "Mid Level"]), "Show jobs requiring Entry Level or Mid Level");
  assert.equal(getSeniorityTitle(["None"]), "Show jobs requiring No Experience Required");
});

test("getRoleTypeTitle returns sentence query for role types", () => {
  assert.equal(getRoleTypeTitle("All"), "Show jobs for any role type");
  assert.equal(getRoleTypeTitle(undefined), "Show jobs for any role type");
  assert.equal(getRoleTypeTitle(["Individual Contributor"]), "Show jobs for Individual Contributor");
  assert.equal(getRoleTypeTitle(["Individual Contributor", "People Manager"]), "Show jobs for any role type");
});

test("getExperienceTitle returns dynamic sentence query matching state", () => {
  const defaultExperience: SearchState["experience"] = {
    level: "All",
    role: "All",
    individualContributor: null,
    peopleManager: null,
  };

  assert.equal(getExperienceTitle(defaultExperience), "Show jobs requiring any seniority");

  // With IC range
  assert.equal(getExperienceTitle(defaultExperience, 2, 5, 0, 0), "Must have between 2 – 5 years of individual contributor experience");

  // With PM range
  assert.equal(getExperienceTitle(defaultExperience, 0, 0, 1, 3), "Must have between 1 – 3 years of people manager experience");

  // With both IC and PM ranges
  assert.equal(getExperienceTitle(defaultExperience, 2, 5, 1, 3), "Must have 2–5 yrs IC & 1–3 yrs PM experience");

  // With seniority level
  const seniorityExperience: SearchState["experience"] = {
    ...defaultExperience,
    level: ["Entry Level", "Mid Level"],
  };
  assert.equal(getExperienceTitle(seniorityExperience), "Show jobs requiring Entry Level or Mid Level");

  // With role type
  const roleExperience: SearchState["experience"] = {
    ...defaultExperience,
    role: ["Individual Contributor"],
  };
  assert.equal(getExperienceTitle(roleExperience), "Show jobs for Individual Contributor");
});
