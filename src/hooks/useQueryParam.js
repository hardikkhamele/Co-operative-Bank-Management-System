// src/hooks/useQueryParam.js
import { useState, useEffect } from 'react';

/**
 * Sync a value with a URL query parameter and localStorage.
 * @param {string} key - The query param name (e.g., 'search', 'warehouse').
 * @param {string} defaultValue - Fallback value when nothing is in URL or storage.
 * @returns {[string, function]} - Current value and setter.
 */
export default function useQueryParam(key, defaultValue = '') {
  const [value, setValue] = useState(defaultValue);

  // Initialise from URL or localStorage on first render
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const param = params.get(key);
    if (param !== null) {
      setValue(param);
      localStorage.setItem(`inventory_${key}`, param);
    } else {
      const saved = localStorage.getItem(`inventory_${key}`) || defaultValue;
      setValue(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL and localStorage in sync whenever the value changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    localStorage.setItem(`inventory_${key}`, value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return [value, setValue];
}
