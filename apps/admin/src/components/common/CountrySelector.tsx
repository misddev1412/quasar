import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  return (
    <Combobox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className="relative country-selector-container">
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
            <div className="absolute left-0 top-full z-[9999] mt-1">
              <Combobox.Options
                static
                className="country-selector-dropdown w-80 max-h-60 overflow-auto rounded-lg bg-white dark:bg-neutral-800 py-1 text-base shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-neutral-200 dark:border-neutral-700"
              >
                <div className="sticky top-0 bg-white dark:bg-neutral-800 px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Combobox.Input
                      className="country-search-input w-full pl-10 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      displayValue={() => query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search countries..."
                    />
                  </div>
                </div>

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
                          'country-option relative cursor-pointer select-none py-2 px-4 flex items-center hover:bg-neutral-50 dark:hover:bg-neutral-700',
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
                      <span className="text-sm text-neutral-500 dark:text-neutral-400">
                        +{country.callingCode}
                      </span>
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </div>
          )}
        </div>
      )}
    </Combobox>
  );
};
