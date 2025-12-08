import React, { useMemo, useState, useRef, useEffect } from 'react';
import Select, {
  components,
  OptionProps,
  SingleValueProps,
  MenuProps,
  StylesConfig,
  GroupBase,
  InputProps
} from 'react-select';
import { getCountries, getCountryCallingCode } from 'react-phone-number-input';
import clsx from 'clsx';
import './CountrySelector.css';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

// Country data interface
interface Country {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
  searchTerms: string; // Combined search terms for fuzzy matching
}

// Fuzzy search utility function
const fuzzyMatch = (searchTerm: string, targetText: string): boolean => {
  if (!searchTerm) return true;

  const search = searchTerm.toLowerCase().trim();
  const target = targetText.toLowerCase();

  // Exact match
  if (target.includes(search)) return true;

  // Fuzzy matching - check if all characters in search term exist in order
  let searchIndex = 0;
  for (let i = 0; i < target.length && searchIndex < search.length; i++) {
    if (target[i] === search[searchIndex]) {
      searchIndex++;
    }
  }

  return searchIndex === search.length;
};

// Enhanced search function that searches across multiple fields
const searchCountries = (countries: Country[], searchTerm: string): Country[] => {
  if (!searchTerm || searchTerm.trim() === '') return countries;

  const search = searchTerm.toLowerCase().trim();

  return countries.filter(country => {
    // Search by country name (fuzzy)
    if (fuzzyMatch(search, country.name)) return true;

    // Search by country code
    if (country.code.toLowerCase().includes(search)) return true;

    // Search by calling code (with or without +)
    const callingCode = country.callingCode;
    if (callingCode.includes(search) ||
        callingCode.includes(search.replace('+', '')) ||
        (`+${callingCode}`).includes(search)) return true;

    // Search in combined search terms
    if (fuzzyMatch(search, country.searchTerms)) return true;

    return false;
  });
};

// Function to highlight matching text
const highlightMatch = (text: string, searchTerm: string): React.ReactNode => {
  if (!searchTerm || searchTerm.trim() === '') return text;

  const search = searchTerm.toLowerCase().trim();
  const lowerText = text.toLowerCase();

  // Find the first occurrence of the search term
  const index = lowerText.indexOf(search);
  if (index === -1) return text;

  const before = text.substring(0, index);
  const match = text.substring(index, index + search.length);
  const after = text.substring(index + search.length);

  return (
    <>
      {before}
      <span className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded">
        {match}
      </span>
      {highlightMatch(after, searchTerm)}
    </>
  );
};

// Component props interface
interface CountrySelectorProps {
  value?: string;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  variant?: 'embedded' | 'standalone';
}

// Function to get alternative names and common abbreviations for countries
const getAlternativeNames = (countryCode: string, countryName: string): string[] => {
  const alternatives: Record<string, string[]> = {
    'US': ['usa', 'america', 'united states', 'states'],
    'GB': ['uk', 'britain', 'england', 'united kingdom'],
    'DE': ['germany', 'deutschland'],
    'FR': ['france'],
    'IT': ['italy'],
    'ES': ['spain'],
    'CN': ['china', 'prc'],
    'JP': ['japan'],
    'KR': ['korea', 'south korea'],
    'IN': ['india'],
    'AU': ['australia', 'aussie'],
    'CA': ['canada'],
    'BR': ['brazil'],
    'RU': ['russia'],
    'MX': ['mexico'],
    'AR': ['argentina'],
    'CL': ['chile'],
    'CO': ['colombia'],
    'PE': ['peru'],
    'VE': ['venezuela'],
    'UY': ['uruguay'],
    'PY': ['paraguay'],
    'BO': ['bolivia'],
    'EC': ['ecuador'],
    'GY': ['guyana'],
    'SR': ['suriname'],
    'FK': ['falkland'],
    'GF': ['french guiana'],
    'VN': ['vietnam', 'viet nam'],
    'TH': ['thailand'],
    'MY': ['malaysia'],
    'SG': ['singapore'],
    'ID': ['indonesia'],
    'PH': ['philippines'],
    'TW': ['taiwan'],
    'HK': ['hong kong'],
    'MO': ['macau', 'macao'],
  };

  return alternatives[countryCode] || [];
};

// Get country names in English
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
    'BE': 'Belgium',
    'CH': 'Switzerland',
    'AT': 'Austria',
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
    'IS': 'Iceland',
    'MT': 'Malta',
    'CY': 'Cyprus',
    'LU': 'Luxembourg',
    'AD': 'Andorra',
    'MC': 'Monaco',
    'SM': 'San Marino',
    'VA': 'Vatican City',
    'LI': 'Liechtenstein',
    'TR': 'Turkey',
    'IL': 'Israel',
    'SA': 'Saudi Arabia',
    'AE': 'United Arab Emirates',
    'QA': 'Qatar',
    'KW': 'Kuwait',
    'BH': 'Bahrain',
    'OM': 'Oman',
    'JO': 'Jordan',
    'LB': 'Lebanon',
    'SY': 'Syria',
    'IQ': 'Iraq',
    'IR': 'Iran',
    'AF': 'Afghanistan',
    'PK': 'Pakistan',
    'BD': 'Bangladesh',
    'LK': 'Sri Lanka',
    'MV': 'Maldives',
    'NP': 'Nepal',
    'BT': 'Bhutan',
    'MM': 'Myanmar',
    'TH': 'Thailand',
    'VN': 'Vietnam',
    'KH': 'Cambodia',
    'LA': 'Laos',
    'MY': 'Malaysia',
    'SG': 'Singapore',
    'ID': 'Indonesia',
    'PH': 'Philippines',
    'TW': 'Taiwan',
    'HK': 'Hong Kong',
    'MO': 'Macau',
    'MN': 'Mongolia',
    'KZ': 'Kazakhstan',
    'UZ': 'Uzbekistan',
    'TM': 'Turkmenistan',
    'KG': 'Kyrgyzstan',
    'TJ': 'Tajikistan',
    'ZA': 'South Africa',
    'EG': 'Egypt',
    'MA': 'Morocco',
    'DZ': 'Algeria',
    'TN': 'Tunisia',
    'LY': 'Libya',
    'SD': 'Sudan',
    'ET': 'Ethiopia',
    'KE': 'Kenya',
    'UG': 'Uganda',
    'TZ': 'Tanzania',
    'RW': 'Rwanda',
    'BI': 'Burundi',
    'DJ': 'Djibouti',
    'SO': 'Somalia',
    'ER': 'Eritrea',
    'SS': 'South Sudan',
    'CF': 'Central African Republic',
    'TD': 'Chad',
    'CM': 'Cameroon',
    'GQ': 'Equatorial Guinea',
    'GA': 'Gabon',
    'CG': 'Republic of the Congo',
    'CD': 'Democratic Republic of the Congo',
    'AO': 'Angola',
    'ZM': 'Zambia',
    'ZW': 'Zimbabwe',
    'BW': 'Botswana',
    'NA': 'Namibia',
    'SZ': 'Eswatini',
    'LS': 'Lesotho',
    'MW': 'Malawi',
    'MZ': 'Mozambique',
    'MG': 'Madagascar',
    'MU': 'Mauritius',
    'SC': 'Seychelles',
    'KM': 'Comoros',
    'CV': 'Cape Verde',
    'ST': 'São Tomé and Príncipe',
    'GH': 'Ghana',
    'NG': 'Nigeria',
    'BJ': 'Benin',
    'TG': 'Togo',
    'BF': 'Burkina Faso',
    'CI': 'Côte d\'Ivoire',
    'LR': 'Liberia',
    'SL': 'Sierra Leone',
    'GN': 'Guinea',
    'GW': 'Guinea-Bissau',
    'SN': 'Senegal',
    'GM': 'Gambia',
    'ML': 'Mali',
    'NE': 'Niger',
    'MR': 'Mauritania',
    'AR': 'Argentina',
    'CL': 'Chile',
    'PE': 'Peru',
    'BO': 'Bolivia',
    'PY': 'Paraguay',
    'UY': 'Uruguay',
    'CO': 'Colombia',
    'VE': 'Venezuela',
    'GY': 'Guyana',
    'SR': 'Suriname',
    'EC': 'Ecuador',
    'PA': 'Panama',
    'CR': 'Costa Rica',
    'NI': 'Nicaragua',
    'HN': 'Honduras',
    'SV': 'El Salvador',
    'GT': 'Guatemala',
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

// Custom Option component with flag, calling code, and search highlighting
const CustomOption: React.FC<OptionProps<Country, false, GroupBase<Country>>> = (props) => {
  const { data, isSelected, isFocused, selectProps } = props;
  const searchTerm = (selectProps as any).menuSearch || '';

  return (
    <components.Option {...props}>
      <div className="flex items-center gap-3 py-2">
        <img
          src={data.flag}
          alt={`${data.name} flag`}
          className="w-5 h-3 object-cover rounded-sm border border-gray-200 dark:border-gray-600 flex-shrink-0"
          onError={(e) => {
            // Fallback for broken flag images
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {highlightMatch(data.name, searchTerm)}
          </div>
          {searchTerm && (data.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
           data.callingCode.includes(searchTerm.replace('+', ''))) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {(props.selectProps as any).t?.('phone.country_code_label', 'Code')}: {highlightMatch(data.code, searchTerm)}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
          {highlightMatch(`+${data.callingCode}`, searchTerm)}
        </span>
      </div>
    </components.Option>
  );
};

// Custom SingleValue component for selected value - always shows selected country clearly
const CustomSingleValue: React.FC<SingleValueProps<Country, false, GroupBase<Country>>> = (props) => {
  const { data } = props;

  return (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2 py-1">
        <img
          src={data.flag}
          alt={`${data.name} flag`}
          className="w-5 h-3 object-cover rounded-sm border border-gray-200 dark:border-gray-600 flex-shrink-0"
          onError={(e) => {
            // Fallback for broken flag images
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
          +{data.callingCode}
        </span>
      </div>
    </components.SingleValue>
  );
};



// Custom Control component to prevent search input from appearing in the main control
const CustomControl: React.FC<any> = (props) => {
  return (
    <components.Control {...props}>
      {props.children}
    </components.Control>
  );
};
// Custom Menu component to render a search input inside the dropdown
const CustomMenu: React.FC<MenuProps<Country, false, GroupBase<Country>>> = (props) => {
  const { children, selectProps } = props;
  const { menuSearch, setMenuSearch, setMenuIsOpen } = (selectProps as any);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectProps.menuIsOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [selectProps.menuIsOpen]);

  return (
    <components.Menu {...props}>
      <div className="country-selector-search-header">
        <input
          ref={inputRef}
          type="text"
          value={menuSearch}
          onChange={(e) => setMenuSearch?.(e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setMenuIsOpen?.(false);
              setMenuSearch?.('');
            }
            e.stopPropagation();
          }}
          placeholder={(selectProps as any).t?.('phone.search_placeholder', 'Search countries by name, code, or +calling code')}
          className="country-selector-search-input"
          aria-label={(selectProps as any).t?.('phone.search_aria_label', 'Search countries')}
        />
      </div>
      {children}
    </components.Menu>
  );
};

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  size = 'md',
  className = '',
  variant = 'standalone',
}) => {
  const { t } = useTranslationWithBackend();
  // Local state to control search visibility inside dropdown
  const [menuSearch, setMenuSearch] = useState('');
  const [menuIsOpen, setMenuIsOpen] = useState(false);


  // Ref to the container div for click handling
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Ref to Select to programmatically focus/open
  const selectRef = useRef<any>(null);


  // Stable instance id to scope menu portal/lookups for this component instance
  const instanceIdRef = useRef(`country-selector-${Math.random().toString(36).slice(2, 10)}`);
  const instanceId = instanceIdRef.current;

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (!menuIsOpen) {
      // Prevent React-Select’s own mousedown from toggling twice
      e.preventDefault();
      // Focus the select and open menu
      selectRef.current?.focus?.();
      setMenuIsOpen(true);
    }
  };
  // Prevent immediate-close by stopping React-Select from seeing menu clicks as blur
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (!menuIsOpen) return;
      const target = e.target as HTMLElement;
      const inContainer = !!containerRef.current && containerRef.current.contains(target);

      // Only treat clicks inside THIS select's portal as internal
      let inThisPortal = false;
      const portal = target.closest('.react-select__menu-portal') as HTMLElement | null;
      if (portal) {
        if (target.closest(`[id^="react-select-${instanceId}-"]`)) {
          inThisPortal = true;
        } else if (portal.querySelector(`[id^="react-select-${instanceId}-"]`)) {
          inThisPortal = portal.contains(target);
        }
      }

      if (inContainer || inThisPortal) {
        e.preventDefault();
      }
    };
    document.addEventListener('mousedown', handleMouseDown, true);
    return () => document.removeEventListener('mousedown', handleMouseDown, true);
  }, [menuIsOpen]);

  // Close when clicking outside the component or its own menu portal
  useEffect(() => {
    if (!menuIsOpen) return;

    const handleGlobalPointer = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const inContainer = !!containerRef.current && containerRef.current.contains(target);

      // Limit to this instance's menu rendered in portal
      let inThisMenu = false;
      const portal = target.closest('.react-select__menu-portal') as HTMLElement | null;
      if (portal) {
        // react-select uses ids like `react-select-${instanceId}-option-...` / `...-listbox`
        if (target.closest(`[id^="react-select-${instanceId}-"]`)) {
          inThisMenu = true;
        } else if (portal.querySelector(`[id^="react-select-${instanceId}-"]`)) {
          // Fallback: if the portal contains our instance id nodes, any click inside counts
          inThisMenu = portal.contains(target);
        }
      }

      if (!inContainer && !inThisMenu) {
        setMenuIsOpen(false);
        setMenuSearch('');
      }
    };

    document.addEventListener('mousedown', handleGlobalPointer);
    document.addEventListener('touchstart', handleGlobalPointer, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleGlobalPointer);
      document.removeEventListener('touchstart', handleGlobalPointer);
    };
  }, [menuIsOpen, instanceId]);


  // Generate countries data with enhanced search terms
  // Generate countries data with enhanced search terms
  const countries: Country[] = useMemo(() => {





    return getCountries().map(countryCode => {
      const name = getCountryName(countryCode);
      const callingCode = getCountryCallingCode(countryCode);

      // Create comprehensive search terms
      const searchTerms = [
        name.toLowerCase(),
        countryCode.toLowerCase(),
        callingCode,
        `+${callingCode}`,
        // Add common alternative names and abbreviations
        ...(getAlternativeNames(countryCode, name))
      ].join(' ');

      return {
        code: countryCode,
        name,
        callingCode,
        flag: `https://purecatamphetamine.github.io/country-flag-icons/3x2/${countryCode}.svg`,
        searchTerms
      };
    });
  }, []);

  // Find selected country
  const selectedCountry = useMemo(() => {
    return countries.find(country => country.code === value) || null;
  }, [countries, value]);

  // Size-based styling
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  const heightClasses = {
    sm: '38px',
    md: '42px',
    lg: '46px',
  };

  // Custom styles for react-select with proper z-index and dark mode support
  const customStyles: StylesConfig<Country, false, GroupBase<Country>> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: heightClasses[size],
      height: heightClasses[size],
      borderColor: variant === 'embedded' ? 'transparent' : (error
        ? '#ef4444'
        : state.isFocused
          ? '#3b82f6'
          : '#d1d5db'),
      borderWidth: variant === 'embedded' ? '0px' : '1px',
      borderRadius: variant === 'embedded' ? '0px' : '0.5rem',
      backgroundColor: 'transparent',
      boxShadow: state.isFocused && variant !== 'embedded'
        ? '0 0 0 1px #3b82f6'
        : 'none',
      '&:hover': {
        borderColor: variant === 'embedded' ? 'transparent' : (error ? '#ef4444' : '#9ca3af'),
      },
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
    }),
    valueContainer: (provided, state) => ({
      ...provided,
      padding: variant === 'embedded' ? '0 12px' : '0 8px',
      height: heightClasses[size],
    }),
    input: (provided, state) => ({
      ...provided,
      margin: '0',
      padding: '0',
      color: 'inherit',
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: sizeClasses[size] === 'text-sm' ? '14px' : '16px',
    }),
    singleValue: (provided, state) => ({
      ...provided,
      color: 'inherit',
      fontSize: sizeClasses[size] === 'text-sm' ? '14px' : '16px',
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999,
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
    }),
    menuList: (provided, state) => ({
      ...provided,
      maxHeight: '300px',
      padding: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? 'var(--color-primary-500, #3b82f6)'
        : state.isFocused
          ? 'var(--color-hover-secondary, #f3f4f6)'
          : 'transparent',
      color: state.isSelected
        ? 'white'
        : 'inherit',
      padding: '8px 12px',
      borderRadius: '0.375rem',
      margin: '2px 0',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-hover-secondary, #f3f4f6)',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: '#6b7280',
      padding: '8px',
      '&:hover': {
        color: '#374151',
      },
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s',
    }),
  };

  // Dark mode styles override
  const darkModeStyles: StylesConfig<Country, false, GroupBase<Country>> = {
    ...customStyles,
    control: (provided, state) => ({
      ...customStyles.control!(provided, state),
      backgroundColor: 'transparent',
      borderColor: variant === 'embedded' ? 'transparent' : (error
        ? '#ef4444'
        : state.isFocused
          ? '#60a5fa'
          : '#4b5563'),
      '&:hover': {
        borderColor: variant === 'embedded' ? 'transparent' : (error ? '#ef4444' : '#6b7280'),
      },
    }),
    menu: (provided, state) => ({
      ...customStyles.menu!(provided, state),
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
    }),
    option: (provided, state) => ({
      ...customStyles.option!(provided, state),
      backgroundColor: state.isSelected
        ? 'var(--color-primary-500, #3b82f6)'
        : state.isFocused
          ? 'var(--color-hover-secondary, #374151)'
          : 'transparent',
      color: state.isSelected
        ? 'white'
        : '#f9fafb',
      '&:hover': {
        backgroundColor: state.isSelected ? 'var(--color-primary-500, #3b82f6)' : 'var(--color-hover-secondary, #374151)',
      },
    }),
    placeholder: (provided, state) => ({
      ...customStyles.placeholder!(provided, state),
      color: '#6b7280',
    }),
    singleValue: (provided, state) => ({
      ...customStyles.singleValue!(provided, state),
      color: '#f9fafb',
    }),
    dropdownIndicator: (provided, state) => ({
      ...customStyles.dropdownIndicator!(provided, state),
      color: '#9ca3af',
      '&:hover': {
        color: '#d1d5db',
      },
    }),
  };

  // Detect dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div ref={containerRef} onMouseDown={handleContainerMouseDown} className={clsx('relative cursor-pointer', className)} style={{ overflow: 'visible', zIndex: 10 }}>
      <Select<Country, false, GroupBase<Country>>
        ref={selectRef}
        instanceId={instanceId}
        value={selectedCountry}
        onChange={(selectedOption) => {
          if (selectedOption) {
            onChange(selectedOption.code);
            setMenuIsOpen(false);
            setMenuSearch('');
          }
        }}
        options={countries}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.code}
        isDisabled={disabled}
        isSearchable={true}
        isClearable={false}
        placeholder={undefined}
        closeMenuOnSelect={true}
        closeMenuOnScroll={false}
        filterOption={(option, _inputValue) => {
          const search = (menuSearch || '').trim();
          if (!search) return true;
          const country = option.data as Country;
          return searchCountries([country], search).length > 0;
        }}
        styles={isDarkMode ? darkModeStyles : customStyles}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
          Menu: CustomMenu,
          Control: CustomControl,
          DropdownIndicator: components.DropdownIndicator,
          IndicatorSeparator: () => null,
          Input: () => null,
        }}
        menuPortalTarget={document.body}
        // Control menu state explicitly to avoid immediate close on click
        menuIsOpen={menuIsOpen}
        onMenuOpen={() => setMenuIsOpen(true)}
        onMenuClose={() => {
          setMenuIsOpen(false);
          setMenuSearch('');
        }}
        // @ts-ignore
        setMenuIsOpen={setMenuIsOpen}
        // Pass custom search state to subcomponents
        inputValue={menuSearch}
        // @ts-ignore
        menuSearch={menuSearch}
        // @ts-ignore
        setMenuSearch={setMenuSearch}
        // Pass translation function to subcomponents
        // @ts-ignore
        t={t}
        menuPosition="fixed"
        menuPlacement="auto"
        className={clsx(
          'react-select-container',
          sizeClasses[size],
          error && 'react-select-error',
          variant === 'embedded' && 'country-selector--embedded !border-0 !shadow-none'
        )}
        classNamePrefix="react-select"
      />
    </div>
  );
};

export default CountrySelector;
