import { useCallback, useEffect, useRef, useState } from "react";

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches data once on mount and exposes a `reload` function to re-run the
 * fetch manually (e.g. after a mutation elsewhere on the page).
 */
export function useFetch<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    fetcherRef
      .current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => setState({ data: null, loading: false, error: errorMessage(err) }));
  }, []);

  useEffect(() => {
    fetcherRef
      .current()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err: unknown) => setState({ data: null, loading: false, error: errorMessage(err) }));
  }, []);

  return { ...state, reload };
}

/**
 * Wraps an async mutation function with loading/error state tracking.
 * Returns undefined (instead of throwing) when the action fails, so
 * callers can simply check the result. An optional `onError` callback
 * receives the error message synchronously (useful for e.g. showing a
 * toast right away, since reading the `error` state right after `run()`
 * resolves would still reflect the previous render).
 */
export function useAsyncAction<Args extends unknown[], R>(
  action: (...args: Args) => Promise<R>,
  options?: { onError?: (message: string) => void },
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const actionRef = useRef(action);
  const optionsRef = useRef(options);

  useEffect(() => {
    actionRef.current = action;
    optionsRef.current = options;
  });

  const run = useCallback(async (...args: Args): Promise<R | undefined> => {
    setLoading(true);
    setError(null);
    try {
      const result = await actionRef.current(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      const message = errorMessage(err);
      setError(message);
      optionsRef.current?.onError?.(message);
      return undefined;
    }
  }, []);

  return { run, loading, error };
}
