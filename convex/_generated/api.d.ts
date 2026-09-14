/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as autocomplete from "../autocomplete.js";
import type * as autocompleteSeed from "../autocompleteSeed.js";
import type * as autocompleteTypes from "../autocompleteTypes.js";
import type * as companies from "../companies.js";
import type * as facets from "../facets.js";
import type * as jobCards from "../jobCards.js";
import type * as jobs from "../jobs.js";
import type * as migrations from "../migrations.js";
import type * as savedSearches from "../savedSearches.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  autocomplete: typeof autocomplete;
  autocompleteSeed: typeof autocompleteSeed;
  autocompleteTypes: typeof autocompleteTypes;
  companies: typeof companies;
  facets: typeof facets;
  jobCards: typeof jobCards;
  jobs: typeof jobs;
  migrations: typeof migrations;
  savedSearches: typeof savedSearches;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
