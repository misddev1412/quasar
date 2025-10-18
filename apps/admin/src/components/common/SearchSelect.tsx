import React, { useMemo } from 'react';
import clsx from 'clsx';
import ReactSelect, { GroupBase, Props as ReactSelectProps, StylesConfig } from 'react-select';
import './CountrySelector.css';

type SearchSelectSize = 'sm' | 'md' | 'lg';

const SIZE_HEIGHT_MAP: Record<SearchSelectSize, number> = {
  sm: 40,  // 40px height to match Input/Select sm
  md: 44,  // 44px height to match Input/Select md
  lg: 48,  // 48px height to match Input/Select lg
};

export interface SearchSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
> extends ReactSelectProps<Option, IsMulti, Group> {
  label?: string;
  required?: boolean;
  helperText?: string;
  error?: string;
  containerClassName?: string;
  size?: SearchSelectSize;
}

const createStyles = <Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  height: number,
  external?: StylesConfig<Option, IsMulti, Group>,
): StylesConfig<Option, IsMulti, Group> => ({
  control: (provided, state) => {
    const base = {
      ...provided,
      minHeight: height,
      height,
      borderRadius: '12px',
      borderColor: state.isFocused ? '#4f46e5' : '#e5e7eb',
      boxShadow: 'none',
      backgroundColor: state.isDisabled ? '#f9fafb' : '#ffffff',
      transition: 'border-color 150ms ease, box-shadow 150ms ease',
      '&:hover': {
        borderColor: '#4f46e5',
      },
    };

    return external?.control ? external.control(base, state) : base;
  },
  valueContainer: (provided, state) => {
    const base = {
      ...provided,
      height,
      minHeight: height,
      padding: '0 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.875rem',
    };

    return external?.valueContainer ? external.valueContainer(base, state) : base;
  },
  input: (provided, state) => {
    const base = {
      ...provided,
      margin: 0,
      padding: 0,
      border: 0,
      outline: 'none',
      boxShadow: 'none',
    };

    return external?.input ? external.input(base, state) : base;
  },
  placeholder: (provided, state) => {
    const base = {
      ...provided,
      fontSize: '0.875rem',
      color: '#9ca3af',
    };

    return external?.placeholder ? external.placeholder(base, state) : base;
  },
  singleValue: (provided, state) => {
    const base = {
      ...provided,
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#111827',
    };

    return external?.singleValue ? external.singleValue(base, state) : base;
  },
  multiValue: (provided, state) => {
    if (!external?.multiValue) {
      return provided;
    }
    return external.multiValue(provided, state);
  },
  multiValueLabel: (provided, state) => {
    if (!external?.multiValueLabel) {
      return provided;
    }
    return external.multiValueLabel(provided, state);
  },
  multiValueRemove: (provided, state) => {
    if (!external?.multiValueRemove) {
      return provided;
    }
    return external.multiValueRemove(provided, state);
  },
  menuPortal: (provided, state) => {
    const base = {
      ...provided,
      zIndex: 9999,
    };

    return external?.menuPortal ? external.menuPortal(base, state) : base;
  },
  menu: (provided, state) => {
    const base = {
      ...provided,
      zIndex: 9999,
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
    };

    return external?.menu ? external.menu(base, state) : base;
  },
  option: (provided, state) => {
    const base = {
      ...provided,
      backgroundColor: state.isSelected
        ? '#4338ca'
        : state.isFocused
          ? '#4f46e5'
          : provided.backgroundColor,
      color: state.isSelected || state.isFocused ? '#ffffff' : '#1f2937',
    };

    return external?.option ? external.option(base, state) : base;
  },
  indicatorsContainer: (provided, state) => {
    const base = {
      ...provided,
      height,
    };

    return external?.indicatorsContainer ? external.indicatorsContainer(base, state) : base;
  },
  dropdownIndicator: (provided, state) => {
    if (!external?.dropdownIndicator) {
      return provided;
    }
    return external.dropdownIndicator(provided, state);
  },
});

export function SearchSelect<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  label,
  required = false,
  helperText,
  error,
  containerClassName,
  size = 'md',
  classNamePrefix = 'react-select',
  styles: customStyles,
  className: selectClassName,
  menuPortalTarget,
  menuPlacement = 'auto',
  ...selectProps
}: SearchSelectProps<Option, IsMulti, Group>) {
  const height = SIZE_HEIGHT_MAP[size];
  const resolvedMenuPortalTarget = menuPortalTarget ?? (typeof window !== 'undefined' ? window.document.body : undefined);

  const styles = useMemo(
    () => createStyles<Option, IsMulti, Group>(height, customStyles as StylesConfig<Option, IsMulti, Group> | undefined),
    [height, customStyles],
  );

  return (
    <div className={clsx('space-y-2', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <ReactSelect<Option, IsMulti, Group>
        {...selectProps}
        styles={styles}
        menuPortalTarget={resolvedMenuPortalTarget}
        menuPlacement={menuPlacement}
        className={clsx('react-select-container', selectClassName, error && 'react-select-error')}
        classNamePrefix={classNamePrefix}
      />

      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
}

export default SearchSelect;
