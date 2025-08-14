import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import clsx from 'clsx';
import './CountrySelector.css';

// Get country names in English (you can extend this for i18n later)
const getCountryName = (countryCode: string): string => {
  const countryNames: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'AU': 'Australia',
    'DE': 'Germany',
    'FR': 'France',
    'IT': 'Italy',
    'ES': 'Spain',
    'JP': 'Japan',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'RU': 'Russia',
    'KR': 'South Korea',
    'NL': 'Netherlands',
    'SE': 'Sweden',
    'NO': 'Norway',
    'DK': 'Denmark',
    'FI': 'Finland',
    'CH': 'Switzerland',
    'AT': 'Austria',
    'BE': 'Belgium',
    'IE': 'Ireland',
    'PT': 'Portugal',
    'GR': 'Greece',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'SI': 'Slovenia',
    'SK': 'Slovakia',
    'LT': 'Lithuania',
    'LV': 'Latvia',
    'EE': 'Estonia',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'LU': 'Luxembourg',
    'IS': 'Iceland',
    'TR': 'Turkey',
    'IL': 'Israel',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'EG': 'Egypt',
    'ZA': 'South Africa',
    'NG': 'Nigeria',
    'KE': 'Kenya',
    'GH': 'Ghana',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'SG': 'Singapore',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'NZ': 'New Zealand',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru',
    'VE': 'Venezuela',
    'UY': 'Uruguay',
    'PY': 'Paraguay',
    'BO': 'Bolivia',
    'EC': 'Ecuador',
    'CR': 'Costa Rica',
    'PA': 'Panama',
    'GT': 'Guatemala',
    'HN': 'Honduras',
    'SV': 'El Salvador',
    'NI': 'Nicaragua',
    'BZ': 'Belize',
    'JM': 'Jamaica',
    'TT': 'Trinidad and Tobago',
    'BB': 'Barbados',
    'GD': 'Grenada',
    'LC': 'Saint Lucia',
    'VC': 'Saint Vincent and the Grenadines',
    'DM': 'Dominica',
    'AG': 'Antigua and Barbuda',
    'KN': 'Saint Kitts and Nevis',
    'BS': 'Bahamas',
    'CU': 'Cuba',
    'DO': 'Dominican Republic',
    'HT': 'Haiti',
    'PR': 'Puerto Rico',
  };
  
  return countryNames[countryCode] || countryCode;
};

interface Country {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
}

interface CountrySelectorProps {
  value?: string;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calculate dropdown position when opened
  const calculateDropdownPosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Use fixed positioning relative to viewport
      let top = rect.bottom + 8; // 8px gap below the button for better spacing
      let left = rect.left;
      const width = Math.max(320, Math.min(400, rect.width * 1.8)); // Responsive width with limits

      // Adjust position if dropdown would go off-screen
      const dropdownHeight = 240; // Approximate max height

      // If dropdown would go below viewport, position it above the button
      if (rect.bottom + dropdownHeight > viewportHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      // If dropdown would go off the right edge, adjust left position
      if (left + width > viewportWidth) {
        left = viewportWidth - width - 16; // 16px margin from edge
      }

      // Ensure dropdown doesn't go off the left edge
      if (left < 16) {
        left = 16; // 16px margin from edge
      }

      // Ensure top doesn't go above viewport
      if (top < 16) {
        top = 16;
      }

      setDropdownPosition({ top, left, width });
    }
  }, []);

  // Get all countries with their data
  const countries: Country[] = useMemo(() => {
    return getCountries().map(countryCode => ({
      code: countryCode,
      name: getCountryName(countryCode),
      callingCode: getCountryCallingCode(countryCode),
      flag: `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`,
    }));
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (query === '') {
      return countries;
    }

    return countries.filter((country) =>
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.toLowerCase().includes(query.toLowerCase()) ||
      country.callingCode.includes(query)
    );
  }, [countries, query]);

  // Find selected country
  const selectedCountry = useMemo(() =>
    countries.find(country => country.code === value),
    [countries, value]
  );

  // Size classes
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-11',
    lg: 'h-12',
  };

  const flagSizeClasses = {
    sm: 'w-4 h-3',
    md: 'w-5 h-4',
    lg: 'w-6 h-5',
  };

  // Update position when dropdown opens and on resize
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [calculateDropdownPosition]);

  return (
    <Combobox
      value={value}
      onChange={(newValue) => {
        onChange(newValue);
        setQuery(''); // Clear search when selection is made
      }}
      disabled={disabled}
    >
      {({ open }) => {
        // Calculate position when dropdown opens
        if (open) {
          // Use requestAnimationFrame for better timing
          requestAnimationFrame(() => {
            calculateDropdownPosition();
            // Auto-focus the search input when dropdown opens
            if (searchInputRef.current) {
              setTimeout(() => {
                searchInputRef.current?.focus();
              }, 100);
            }
          });
        } else {
          // Reset query when dropdown closes
          setQuery('');
        }

        return (
          <div
            className="relative country-selector-container"
            style={{
              overflow: 'visible',
              zIndex: 1,
              isolation: 'isolate',
              position: 'relative'
            }}
          >
            <div className={clsx(
              'relative flex items-center bg-transparent cursor-pointer',
              sizeClasses[size],
              {
                'opacity-50 cursor-not-allowed': disabled,
              },
              className
            )}>
              <Combobox.Button
                ref={buttonRef}
                className="flex items-center w-full h-full px-3 focus:outline-none hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                style={{
                  pointerEvents: 'auto',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Calculate position when button is clicked
                  setTimeout(calculateDropdownPosition, 0);
                }}
              >
                {selectedCountry && (
                  <>
                    <img
                      src={selectedCountry.flag}
                      alt={`${selectedCountry.name} flag`}
                      className={clsx('country-flag object-cover rounded-sm mr-2', flagSizeClasses[size])}
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 mr-1">
                      +{selectedCountry.callingCode}
                    </span>
                  </>
                )}
                <ChevronDownIcon
                  className={clsx(
                    'w-4 h-4 text-neutral-400 dark:text-neutral-500 transition-transform',
                    open && 'rotate-180'
                  )}
                  aria-hidden="true"
                />
              </Combobox.Button>
            </div>

            {open && (
              <div
                className="country-selector-dropdown rounded-lg bg-white dark:bg-neutral-800 text-base shadow-xl ring-1 ring-black ring-opacity-5 sm:text-sm border border-neutral-200 dark:border-neutral-700"
                style={{
                  position: 'fixed',
                  top: `${dropdownPosition.top}px`,
                  left: `${dropdownPosition.left}px`,
                  width: `${dropdownPosition.width}px`,
                  zIndex: 2147483647,
                  pointerEvents: 'auto',
                  isolation: 'isolate',
                  backdropFilter: 'none',
                  WebkitBackdropFilter: 'none',
                  transform: 'none',
                  filter: 'none',
                  visibility: 'visible',
                  opacity: 1,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
              {/* Search Input Section */}
              <div className="sticky top-0 bg-white dark:bg-neutral-800 px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 z-10">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="country-search-input w-full pl-10 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                    }}
                    placeholder="Search countries..."
                    autoComplete="off"
                    spellCheck={false}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      // Ensure the input gets focus
                      setTimeout(() => {
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }, 0);
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      // Allow normal typing behavior
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        // Close dropdown on escape
                        if (searchInputRef.current) {
                          searchInputRef.current.blur();
                        }
                      }
                      // Don't stop propagation for normal typing keys
                    }}
                    onInput={(e) => {
                      // Ensure the input value is updated
                      const target = e.target as HTMLInputElement;
                      setQuery(target.value);
                    }}
                  />
                </div>
              </div>

              {/* Options Section */}
              <Combobox.Options
                className="max-h-60 overflow-y-auto py-1 focus:outline-none"
              >

                {filteredCountries.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-neutral-700 dark:text-neutral-300">
                    No countries found.
                  </div>
                ) : (
                  filteredCountries.map((country) => (
                    <Combobox.Option
                      key={country.code}
                      className={({ active }) =>
                        clsx(
                          'country-option relative cursor-pointer select-none py-2 px-4 flex items-center',
                          active
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100'
                            : 'text-neutral-900 dark:text-neutral-100'
                        )
                      }
                      value={country.code}
                    >
                      <img
                        src={country.flag}
                        alt={`${country.name} flag`}
                        className={clsx('country-flag object-cover rounded-sm mr-3', flagSizeClasses[size])}
                      />
                      <div className="flex-1">
                        <span className="country-name block truncate font-medium">
                          {country.name}
                        </span>
                      </div>
                      <span className="country-calling-code text-sm text-neutral-500 dark:text-neutral-400">
                        +{country.callingCode}
                      </span>
                    </Combobox.Option>
                    ))
                    )}
              </Combobox.Options>
              </div>
            )}
          </div>
        );
      }}
    </Combobox>
  );
};
