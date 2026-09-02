import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabledPlaceholder,
  disabled = false,
  searchPlaceholder = 'Search state or region...',
  error,
  className = '',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const listRef = useRef(null);

  // Normalize options into { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value ?? opt.id ?? '', label: opt.label ?? opt.name ?? '' };
    }
    return { value: String(opt), label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options based on search term
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  const displayPlaceholder = disabled && disabledPlaceholder ? disabledPlaceholder : placeholder;
  const isCompact = size === 'sm';

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full px-3 ${isCompact ? 'py-2 text-xs font-medium' : 'py-2.5 text-sm'} rounded-lg border flex items-center justify-between transition-all bg-white select-none ${
          disabled
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
            : isOpen
            ? 'border-[#225091] ring-2 ring-[#225091]/15 cursor-pointer shadow-sm'
            : error
            ? 'border-rose-400 hover:border-rose-500 cursor-pointer'
            : 'border-gray-200 hover:border-gray-300 cursor-pointer shadow-2xs'
        }`}
      >
        <span
          className={`truncate pr-2 ${
            selectedOption?.value ? 'text-gray-900 font-semibold' : 'text-gray-500'
          }`}
        >
          {selectedOption ? selectedOption.label : displayPlaceholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-gray-400">
          {selectedOption?.value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X size={12} />
            </button>
          )}
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#225091]' : 'text-gray-400'}`}
          />
        </div>
      </div>

      {/* Downward Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-100">
          {/* Inline Search Input (shown if > 5 options) */}
          {normalizedOptions.length > 4 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/80">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#225091] focus:ring-1 focus:ring-[#225091]/20 text-gray-800 placeholder-gray-400 font-medium"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div ref={listRef} className="max-h-56 overflow-y-auto py-1 scrollbar-thin">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-center text-gray-400 font-medium">
                {searchTerm ? `No results matching "${searchTerm}"` : 'No options available'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-[#225091] font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check size={13} className="text-[#225091] shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
