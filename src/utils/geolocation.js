/**
 * Geolocation & Reverse Geocoding Utility for Attendance Marking
 */

export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      // Fallback default coordinates (e.g., Pune HQ)
      resolve({
        latitude: 18.5204,
        longitude: 73.8567,
        address: 'Pune Branch Office, FC Road, Pune, Maharashtra'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        let address = '';

        try {
          // Attempt reverse geocoding via OpenStreetMap Nominatim with a short timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            address = data.display_name || '';
          }
        } catch {
          // Reverse geocoding optional, backend can also auto-resolve
        }

        resolve({
          latitude: lat,
          longitude: lng,
          address: address || `Branch Location (${lat}, ${lng})`
        });
      },
      (err) => {
        console.warn('Geolocation permission denied or timed out, using branch location fallback:', err.message);
        resolve({
          latitude: 18.5204,
          longitude: 73.8567,
          address: 'Pune Branch Office, FC Road, Pune, Maharashtra'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 10000,
        ...options
      }
    );
  });
};

export default {
  getCurrentPosition
};
