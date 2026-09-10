import React from 'react';

/**
 * Format punch in/out data which can be:
 * - string: "09:30 AM", "09:30", "2026-09-10T09:30:00.000Z"
 * - object: { time, latitude, longitude, address, city, state, pincode }
 * - date instance
 * - null / undefined
 */
export const formatPunch = (punch) => {
  if (!punch) return { time: '—', location: null };

  let rawTime = punch;
  let location = null;

  if (typeof punch === 'object' && punch !== null) {
    rawTime = punch.time || punch.inTime || punch.outTime || punch.punchTime || punch.timestamp || punch.createdAt || null;

    // Extract address or coordinates if available
    const locParts = [punch.address, punch.city, punch.pincode].filter(Boolean);
    if (locParts.length > 0) {
      location = locParts.join(', ');
    } else if (punch.latitude && punch.longitude) {
      location = `${Number(punch.latitude).toFixed(4)}, ${Number(punch.longitude).toFixed(4)}`;
    }
  }

  if (!rawTime) {
    return { time: location ? 'Recorded' : '—', location };
  }

  // If rawTime is a Date object
  if (rawTime instanceof Date && !isNaN(rawTime.getTime())) {
    return {
      time: rawTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      location
    };
  }

  // If rawTime is a string
  if (typeof rawTime === 'string') {
    const trimmed = rawTime.trim();
    if (!trimmed) return { time: '—', location };

    // Already in standard time format "09:30 AM", "9:30 AM", "09:30"
    if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(trimmed)) {
      return { time: trimmed, location };
    }

    // Try parsing ISO date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return {
        time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        location
      };
    }

    return { time: trimmed, location };
  }

  return { time: String(rawTime), location };
};

/**
 * Returns just the formatted time string (or null/fallback)
 */
export const formatPunchTime = (punch, fallback = null) => {
  const { time } = formatPunch(punch);
  return time === '—' ? fallback : time;
};

/**
 * Renders a React child cell for Punch In / Punch Out with location tooltip if present
 */
export const renderPunchCell = (punch) => {
  const { time, location } = formatPunch(punch);
  if (time === '—' && !location) {
    return <span className="text-gray-400 font-mono">—</span>;
  }

  return (
    <div className="flex flex-col" title={location ? `Location: ${location}` : undefined}>
      <span className="font-mono text-gray-800 font-semibold">{time}</span>
      {location && (
        <span 
          className="text-[10px] text-gray-400 truncate max-w-[140px] flex items-center gap-0.5 cursor-help hover:text-gray-600 transition-colors"
          title={`Punch Location: ${location}`}
        >
          <span className="text-emerald-600 font-bold shrink-0 text-[9px]">📍</span>
          <span className="truncate">{location}</span>
        </span>
      )}
    </div>
  );
};

/**
 * Safely format duration or working hours (avoids objects crashing React child rendering)
 */
export const formatDuration = (val) => {
  if (!val) return '—';
  if (typeof val === 'object') {
    if (val.formatted) return String(val.formatted);
    if (val.totalHours) return String(val.totalHours);
    if (val.hours !== undefined || val.minutes !== undefined) {
      return `${val.hours || 0}h ${val.minutes || 0}m`;
    }
    return '—';
  }
  return String(val);
};

/**
 * Safely extract display string from potentially nested object or string
 */
export const safeString = (val, fallback = '—') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'object') {
    return val.name || val.title || val.code || val.label || val.username || fallback;
  }
  return String(val) || fallback;
};
