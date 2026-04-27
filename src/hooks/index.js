import { useState, useEffect, useCallback } from 'react';
import { useWindowDimensions } from 'react-native';

// ─── Generic fetch hook with loading, error, refresh ─────────────────────────
export const useAsync = (asyncFn, deps = []) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const execute = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const start = Date.now();
    try {
      const data = await asyncFn();
      const elapsed = Date.now() - start;
      console.log(`[Timing] ${asyncFn.name || 'API'} completed in ${elapsed}ms`);
      setState({ data, loading: false, error: null });
    } catch (err) {
      console.warn(`[Error] ${asyncFn.name || 'API'} failed:`, err.message);
      setState({ data: null, loading: false, error: err.message });
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { ...state, refresh: execute };
};

// ─── Timer hook (OTP countdown) ───────────────────────────────────────────────
export const useCountdown = (seconds) => {
  const [count, setCount] = useState(seconds);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!active) return;
    if (count <= 0) { setActive(false); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, active]);

  const reset = () => { setCount(seconds); setActive(true); };

  return { count, expired: count <= 0, reset };
};

// ─── Debounce hook (society search) ──────────────────────────────────────────
export const useDebounce = (value, ms = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
};

// ─── Responsive layout hook ──────────────────────────────────────────────────
export const useResponsive = () => {
  const { width } = useWindowDimensions();
  const isXs = width < 380;
  const isPhone = width < 768;
  const isTablet = width >= 768 && width < 1120;
  const isDesktop = width >= 1120;
  const gutter = isDesktop ? 32 : isTablet ? 24 : 20;
  const contentMaxWidth = isDesktop ? 1180 : isTablet ? 920 : 680;
  const cardMaxWidth = isDesktop ? 480 : isTablet ? 520 : undefined;

  return {
    width,
    isXs,
    isPhone,
    isTablet,
    isDesktop,
    gutter,
    contentMaxWidth,
    cardMaxWidth,
  };
};
