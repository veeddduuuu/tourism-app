import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "../services/http";

/**
 * Loading-support hook for the API layer.
 *
 * Wraps any fetcher `(signal) => Promise<T>` and exposes a standard async state
 * machine — `{ data, loading, error, refetch }`. It:
 *  - aborts the in-flight request when deps change or the component unmounts
 *  - ignores results from stale requests (no setState-after-unmount warnings)
 *  - surfaces failures as the typed {@link ApiError}
 *
 * Example:
 *   const { data, loading, error, refetch } =
 *     useApiQuery((signal) => getFoods({ state }, signal), [state]);
 */

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

export interface QueryResult<T> extends QueryState<T> {
  /** Re-run the fetcher imperatively (e.g. pull-to-refresh / retry). */
  refetch: () => void;
}

export function useApiQuery<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[] = []
): QueryResult<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // Keep the latest fetcher without making it a dependency of the effect.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!active) return;
        // Cancellation is expected on unmount / dep change — not a real error.
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(
                err instanceof Error ? err.message : "Unknown error",
                0
              );
        if (apiError.isAbort) return;
        setState({ data: null, loading: false, error: apiError });
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { ...state, refetch };
}
