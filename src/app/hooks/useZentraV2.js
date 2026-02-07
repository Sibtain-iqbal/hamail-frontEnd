import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/utils/api";

/**
 * Hook to fetch mental battery status from Zentra V2 API
 */
export function useMentalBattery() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getMentalBattery();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching mental battery:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}

/**
 * Hook to fetch plan control percentage from Zentra V2 API
 */
export function usePlanControl() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getPlanControl();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching plan control:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}

/**
 * Hook to fetch behavior heatmap from Zentra V2 API
 */
export function useBehaviorHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getBehaviorHeatmap();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching behavior heatmap:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (startDate, endDate) => {
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getBehaviorHeatmapHistory(
        startDate,
        endDate
      );
      // API returns {history: [...], count: 0}
      // Extract the first item from history array if it exists for the hook's data state
      const historyData =
        result?.history &&
        Array.isArray(result.history) &&
        result.history.length > 0
          ? result.history[0]
          : result;
      setData(historyData);
      // Return full result so component can handle the history array structure
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      if (err.status !== 403) {
        console.error("Error fetching behavior heatmap history:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    errorStatus,
    refetch: () => fetchData(true),
    fetchHistory,
  };
}

/**
 * Hook to fetch psychological radar from Zentra V2 API
 */
export function usePsychologicalRadar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getPsychologicalRadar();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching psychological radar:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}

/**
 * Hook to fetch breathwork suggestion from Zentra V2 API
 */
export function useBreathworkSuggestion() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getBreathworkSuggestion();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching breathwork suggestion:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}

/**
 * Hook to fetch performance window from Zentra V2 API
 */
export function usePerformanceWindow() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getPerformanceWindow();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching performance window:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}

/**
 * Hook to fetch consistency trend from Zentra V2 API
 */
export function useConsistencyTrend(days = "7") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(
    async (force = false) => {
      if (inFlightRef.current && !force) {
        return;
      }

      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      setErrorStatus(null);

      try {
        const result = await apiClient.getConsistencyTrend(days);
        console.log('📊 [ConsistencyTrend] API response:', result);
        setData(result);
        console.log('✅ [ConsistencyTrend] Data set to state:', result);
        return result;
      } catch (err) {
        setError(err.message);
        setErrorStatus(err.status || null);
        // Only log non-403 errors (403 for trading plan is expected for new users)
        if (err.status !== 403) {
          console.error("Error fetching consistency trend:", err);
        }
        return null;
      } finally {
        inFlightRef.current = false;
        setLoading(false);
      }
    },
    [days]
  );

  const fetchHistory = useCallback(async (startDate, endDate) => {
    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      console.log('📅 [ConsistencyTrend] Fetching history:', { startDate, endDate });
      const result = await apiClient.getConsistencyTrendHistory(
        startDate,
        endDate
      );
      console.log('📊 [ConsistencyTrend] History API response:', result);
      setData(result);
      console.log('✅ [ConsistencyTrend] History data set to state:', result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      if (err.status !== 403) {
        console.error("Error fetching consistency trend history:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    errorStatus,
    refetch: () => fetchData(true),
    fetchHistory,
  };
}

/**
 * Hook to fetch daily quote from Zentra V2 API
 */
export function useDailyQuote() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorStatus, setErrorStatus] = useState(null);
  const inFlightRef = useRef(false);

  const fetchData = useCallback(async (force = false) => {
    if (inFlightRef.current && !force) {
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const result = await apiClient.getDailyQuote();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      setErrorStatus(err.status || null);
      // Only log non-403 errors (403 for trading plan is expected for new users)
      if (err.status !== 403) {
        console.error("Error fetching daily quote:", err);
      }
      return null;
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, errorStatus, refetch: () => fetchData(true) };
}
