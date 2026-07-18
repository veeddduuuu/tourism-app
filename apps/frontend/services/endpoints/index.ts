/**
 * Single entry point for the API layer. Import resource functions and the
 * shared client/contracts from here:
 *
 *   import { getFoods, getPlace, search, planTrip, ApiError } from "../services/endpoints";
 */

export * from "./places";
export * from "./foods";
export * from "./festivals";
export * from "./history";
export * from "./search";
export * from "./trip";
export * from "./story";

// Re-export the client + all contracts so callers need only one import path.
export { ApiError, API_BASE_URL, request, apiGet, apiPost } from "../http";
export type {
  HttpMethod,
  QueryParams,
  RequestOptions,
} from "../http";
export type * from "../contracts";
