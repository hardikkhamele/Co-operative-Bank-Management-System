import React from 'react';
import { Loader2 } from 'lucide-react';

const COLOR_MAP = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-[#225091]',
    ring: 'border-[#225091] ring-2 ring-[#225091]/15 bg-blue-50/15',
    activeText: 'text-[#225091]',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'border-emerald-500 ring-2 ring-emerald-500/15 bg-emerald-50/15',
    activeText: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    ring: 'border-amber-500 ring-2 ring-amber-500/15 bg-amber-50/15',
    activeText: 'text-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    ring: 'border-purple-500 ring-2 ring-purple-500/15 bg-purple-50/15',
    activeText: 'text-purple-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'border-indigo-500 ring-2 ring-indigo-500/15 bg-indigo-50/15',
    activeText: 'text-indigo-600',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    ring: 'border-rose-500 ring-2 ring-rose-500/15 bg-rose-50/15',
    activeText: 'text-rose-600',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    ring: 'border-cyan-500 ring-2 ring-cyan-500/15 bg-cyan-50/15',
    activeText: 'text-cyan-600',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-600',
    ring: 'border-teal-500 ring-2 ring-teal-500/15 bg-teal-50/15',
    activeText: 'text-teal-600',
  },
  gray: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    ring: 'border-slate-500 ring-2 ring-slate-500/15 bg-slate-50/15',
    activeText: 'text-slate-700',
  }
};

const StatsCard = ({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'blue',
  isActive = false,
  onClick,
  loading = false,
  className = '',
  layout = 'default', // 'default' (top header with icon, bottom value) | 'centered' (for filter grids)
}) => {
  const theme = COLOR_MAP[color] || COLOR_MAP.blue;
  const isClickable = Boolean(onClick);

  if (layout === 'centered') {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col items-center justify-center text-center select-none ${
          isClickable ? 'cursor-pointer hover:shadow-md' : ''
        } ${
          isActive 
            ? `${theme.ring} shadow-xs` 
            : 'bg-white border-gray-200/80 shadow-2xs hover:border-gray-300'
        } ${className}`}
      >
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 truncate max-w-full">
          {label}
        </span>
        <div className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-none min-h-[30px] flex items-center justify-center">
          {loading ? (
            <Loader2 size={20} className="animate-spin text-slate-400" />
          ) : (
            value ?? 0
          )}
        </div>
        {sublabel && (
          <span className="text-xs font-medium text-slate-400 mt-1 truncate max-w-full">
            {sublabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4.5 sm:p-5 border transition-all duration-200 flex flex-col justify-between min-h-[110px] select-none ${
        isClickable ? 'cursor-pointer hover:shadow-md' : ''
      } ${
        isActive 
          ? `${theme.ring} shadow-xs` 
          : 'bg-white border-gray-200/80 shadow-2xs hover:border-gray-300'
      } ${className}`}
    >
      {/* Top Header: Label + Optional Icon */}
      <div className="flex items-center justify-between w-full mb-3 gap-2">
        <span className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider truncate">
          {label}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl ${theme.bg} ${theme.text} flex items-center justify-center shrink-0 shadow-2xs`}>
            {React.isValidElement(Icon) ? Icon : React.createElement(Icon, { size: 16 })}
          </div>
        )}
      </div>

      {/* Value & Subtitle */}
      <div>
        <div className="text-[26px] font-extrabold tracking-tight text-slate-900 leading-none flex items-center min-h-[30px]">
          {loading ? (
            <Loader2 size={22} className="animate-spin text-slate-400" />
          ) : (
            value ?? 0
          )}
        </div>
        {sublabel && (
          <div className="text-xs font-medium text-slate-400 mt-1.5 truncate">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
