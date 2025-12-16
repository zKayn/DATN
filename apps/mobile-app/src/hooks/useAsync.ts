import { useState, useCallback } from 'react';

interface AsyncState<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
}

export function useAsync<T = any>() {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState({ loading: true, error: null, data: null });
      try {
        const data = await asyncFunction();
        setState({ loading: false, error: null, data });
        return data;
      } catch (error) {
        const err = error as Error;
        setState({ loading: false, error: err, data: null });
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, data: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
