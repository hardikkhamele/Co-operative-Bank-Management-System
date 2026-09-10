import axiosInstance from './axiosConfig';

let cachedLocations = null;
let pendingPromise = null;

/**
 * Parses response from /api/v1/society/credit-receipts/locations
 * Expected API response structure:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Locations dropdown retrieved successfully.",
 *   data: {
 *     states: ["Andhra Pradesh", "Maharashtra"],
 *     cities: ["Ahmednagar", "Amravati", "Nagpur"],
 *     stateCitiesMap: {
 *       "Maharashtra": ["Ahmednagar", "Amravati", "Nagpur"]
 *     }
 *   }
 * }
 */
export const parseLocationsResponse = (res) => {
  const payload = res?.data?.data || res?.data || res || {};

  const states = Array.isArray(payload.states) ? payload.states.filter(Boolean) : [];
  const cities = Array.isArray(payload.cities) ? payload.cities.filter(Boolean) : [];
  const stateCityMap = (typeof payload.stateCitiesMap === 'object' && payload.stateCitiesMap !== null)
    ? payload.stateCitiesMap
    : (typeof payload.stateCityMap === 'object' && payload.stateCityMap !== null)
      ? payload.stateCityMap
      : {};

  return {
    states,
    cities,
    stateCityMap
  };
};

export const locationService = {
  /**
   * Fetch states and cities from dedicated credit-receipts location API:
   * GET /api/v1/society/credit-receipts/locations
   */
  getLocations: async (forceRefresh = false) => {
    if (!forceRefresh && cachedLocations) {
      return cachedLocations;
    }

    if (!forceRefresh && pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = (async () => {
      try {
        const res = await axiosInstance.get('/v1/society/credit-receipts/locations');
        const parsed = parseLocationsResponse(res);
        cachedLocations = parsed;
        return parsed;
      } catch (error) {
        console.warn('[locationService] Failed to fetch locations from API:', error);
        return { states: [], cities: [], stateCityMap: {} };
      } finally {
        pendingPromise = null;
      }
    })();

    return pendingPromise;
  },

  clearCache: () => {
    cachedLocations = null;
  }
};

export default locationService;
