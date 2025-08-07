/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as characters_errors from "../characters/errors.js";
import type * as characters_mutations from "../characters/mutations.js";
import type * as characters_queries from "../characters/queries.js";
import type * as characters_utils from "../characters/utils.js";
import type * as errors from "../errors.js";
import type * as http from "../http.js";
import type * as images_actions from "../images/actions.js";
import type * as images_errors from "../images/errors.js";
import type * as images_mutations from "../images/mutations.js";
import type * as images_queries from "../images/queries.js";
import type * as users_actions from "../users/actions.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as utils from "../utils.js";
import type * as videos_actions from "../videos/actions.js";
import type * as videos_errors from "../videos/errors.js";
import type * as videos_mutations from "../videos/mutations.js";
import type * as videos_queries from "../videos/queries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "characters/errors": typeof characters_errors;
  "characters/mutations": typeof characters_mutations;
  "characters/queries": typeof characters_queries;
  "characters/utils": typeof characters_utils;
  errors: typeof errors;
  http: typeof http;
  "images/actions": typeof images_actions;
  "images/errors": typeof images_errors;
  "images/mutations": typeof images_mutations;
  "images/queries": typeof images_queries;
  "users/actions": typeof users_actions;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  utils: typeof utils;
  "videos/actions": typeof videos_actions;
  "videos/errors": typeof videos_errors;
  "videos/mutations": typeof videos_mutations;
  "videos/queries": typeof videos_queries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
