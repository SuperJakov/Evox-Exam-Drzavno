import {
	usePaginatedQuery,
	useQueries,
	useQuery,
} from "convex-helpers/react/cache/hooks";

/**
 * A cached drop-in replacement for Convex's `useQuery`.
 *
 * Results are shared across components via `convex-helpers`' query cache,
 * reducing redundant network requests when the same query is used in
 * multiple places on the same page.
 */
export const useConvexQuery = useQuery;

/**
 * A cached drop-in replacement for Convex's `usePaginatedQuery`.
 *
 * Behaves identically to the standard hook but routes through the
 * `convex-helpers` cache layer so paginated data is shared across
 * components that request the same page.
 */
export const useConvexPaginatedQuery = usePaginatedQuery;

/**
 * A cached drop-in replacement for Convex's `useQueries`.
 *
 * Allows fetching multiple queries in a single hook call while still
 * benefiting from the `convex-helpers` cache layer.
 */
export const useConvexQueries = useQueries;
