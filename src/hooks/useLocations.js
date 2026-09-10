import { useState, useEffect, useMemo } from 'react';
import { locationService } from '../api/locationService';

/**
 * Custom hook for state & city filter dropdowns
 * Fetches locations strictly from /api/v1/society/credit-receipts/locations
 * @param {string} selectedState - Currently selected state
 */
export const useLocations = (selectedState = '') => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [stateCityMap, setStateCityMap] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { states: parsedStates, cities: parsedCities, stateCityMap: parsedMap } = await locationService.getLocations();
        if (isMounted) {
          setStates(parsedStates || []);
          setCities(parsedCities || []);
          setStateCityMap(parsedMap || {});
        }
      } catch (err) {
        console.warn('useLocations error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const availableCities = useMemo(() => {
    if (selectedState) {
      return stateCityMap[selectedState] || [];
    }
    return cities;
  }, [selectedState, stateCityMap, cities]);

  return {
    states,
    cities,
    stateCityMap,
    availableCities,
    loading
  };
};

export default useLocations;
