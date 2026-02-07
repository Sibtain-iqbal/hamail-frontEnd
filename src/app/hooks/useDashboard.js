import { useState, useEffect, useRef, useCallback } from "react";
import { apiClient } from "@/utils/api";

export function useDashboard(period = "MONTH") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);
        const result = await apiClient.getDashboard(period);
        setData(result);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [period]);

  return { data, loading, error };
}

export function useDashboardSummary(period = "MONTH") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const cacheRef = useRef({});
  const inFlightRef = useRef(null);

  const fetchSummary = useCallback(
    async (force = false) => {
      // Serve from cache when available and no force refresh requested
      if (!force && cacheRef.current[period]) {
        setData(cacheRef.current[period]);
        setLoading(false);
        return cacheRef.current[period];
      }

      // Avoid duplicate network requests for the same period
      if (!force && inFlightRef.current?.period === period) {
        return inFlightRef.current.promise;
      }

      setLoading(true);
      setError(null);
      setErrorStatus(null);

      const requestPromise = apiClient
        .getDashboardSummary(period)
        .then((result) => {
          cacheRef.current[period] = result;
          setData(result);
          return result;
        })
        .catch((err) => {
          setError(err.message);
          setErrorStatus(err.status || null);
          // Only log non-403 errors (403 for trading plan is expected for new users)
          if (err.status !== 403) {
            console.error("Error fetching dashboard summary:", err);
          }
          // Don't re-throw - let the component handle the error state gracefully
          return null;
        })
        .finally(() => {
          if (inFlightRef.current?.promise === requestPromise) {
            inFlightRef.current = null;
          }
          setLoading(false);
        });

      inFlightRef.current = { period, promise: requestPromise };
      return requestPromise;
    },
    [period]
  );

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    loading,
    error,
    errorStatus,
    refetch: () => fetchSummary(true),
  };
}
