import type {
	PaginatedQueryArgs,
	PaginatedQueryReference,
	UsePaginatedQueryReturnType,
} from "convex/react";
import type {
	FunctionArgs,
	FunctionReference,
	FunctionReturnType,
} from "convex/server";
import {
	useConvexPaginatedQuery,
	useConvexQuery,
} from "~/hooks/use-convex-query";
import { useAuth } from "./use-auth";

/**
 * A wrapper around useConvexQuery that automatically skips the query
 * when the user is not authenticated or auth is still loading.
 */
export function useAuthedConvexQuery<Query extends FunctionReference<"query">>(
	query: Query,
	...args: FunctionArgs<Query> extends Record<string, never>
		? // If the query has no arguments, allow calling with or without an args object
			[] | [FunctionArgs<Query>] | ["skip"]
		: // If the query requires arguments, make the args parameter required, but also allow "skip"
			[FunctionArgs<Query>] | ["skip"]
): FunctionReturnType<Query> | undefined {
	const { isAuthenticated, isLoading } = useAuth();

	// Skip the query if auth hasn't loaded yet, user is not authenticated, or caller explicitly passed "skip"
	const callerSkip = args[0] === "skip";
	const shouldSkip = !isAuthenticated || isLoading || callerSkip;

	// Pass "skip" to prevent the query from running, or use the provided args (defaulting to {} for no-arg queries)
	const queryArgs = shouldSkip ? ("skip" as const) : (args[0] ?? {});

	return useConvexQuery(query, queryArgs);
}

/**
 * A wrapper around useConvexPaginatedQuery that automatically skips the query
 * when the user is not authenticated or auth is still loading.
 */
export function useAuthedConvexPaginatedQuery<
	Query extends PaginatedQueryReference,
>(
	query: Query,
	args: PaginatedQueryArgs<Query> | "skip",
	options: { initialNumItems: number },
): UsePaginatedQueryReturnType<Query> {
	const { isAuthenticated, isLoading } = useAuth();

	// Skip the query if auth hasn't loaded yet, user is not authenticated, or caller explicitly passed "skip"
	const callerSkip = args === "skip";
	const shouldSkip = !isAuthenticated || isLoading || callerSkip;

	// Pass "skip" to prevent the query from running, or use the provided args
	const queryArgs = shouldSkip ? ("skip" as const) : args;

	return useConvexPaginatedQuery(query, queryArgs, options);
}
