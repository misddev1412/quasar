import React, { useMemo, useState, useRef, useCallback } from 'react';
import Select, { Props as ReactSelectProps, StylesConfig } from 'react-select';
import clsx from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends Omit<ReactSelectProps<SelectOption, false>, 'options' | 'value' | 'onChange'> {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  /**
   * Current selected option value.
   */
  value?: string | null;
  onChange?: (value: string | null) => void;
  containerClassName?: string;
}

const baseSelectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '63px',
    height: '63px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#2563eb' : base.borderColor,
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#2563eb' : '#94a3b8',
    },
    backgroundColor: '#fff',
    cursor: 'pointer',
    padding: '0 0.75rem',
  }),
  valueContainer: (base) => ({
    ...base,
    padding: '0 0.25rem',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: '0.25rem',
    whiteSpace: 'nowrap',
    minWidth: 0,
    lineHeight: '1.2',
    overflow: 'hidden',
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    lineHeight: '1.2',
  }),
  singleValue: (base) => ({
    ...base,
    color: '#0f172a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    lineHeight: '1.2',
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
    lineHeight: '1.2',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : '#fff',
    color: state.isSelected ? '#fff' : '#0f172a',
    cursor: 'pointer',
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  required,
  error,
  helperText,
  options,
  value,
  onChange,
  classNamePrefix = 'app-select',
  styles,
  containerClassName,
  menuPortalTarget: menuPortalTargetProp,
  menuPosition = 'fixed',
  isClearable = true,
  placeholder,
  onFocus,
  onBlur,
  ...rest
}) => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(selectedOption);

  const computedStyles = useMemo<StylesConfig<SelectOption, false>>(() => {
    const baseControl = baseSelectStyles.control;
    const baseValueContainer = baseSelectStyles.valueContainer;

    const control = (base: any, state: any) => {
      const mergedBase = baseControl ? baseControl(base, state) : base;
      const next = {
        ...mergedBase,
        minHeight: '63px',
        height: '63px',
        paddingTop: label ? 18 : mergedBase.paddingTop,
        paddingBottom: label ? 12 : mergedBase.paddingBottom,
        display: 'flex',
        alignItems: 'center',
      } as Record<string, any>;

      if (error) {
        next.borderColor = '#f31260';
        next['&:hover'] = {
          ...(mergedBase['&:hover'] || {}),
          borderColor: '#f31260',
        };
      }

      return next;
    };

    const valueContainer = (base: any) => {
      const mergedBase = baseValueContainer ? baseValueContainer(base) : base;
      return {
        ...mergedBase,
        paddingTop: label ? 0 : mergedBase.paddingTop,
        paddingBottom: label ? 0 : mergedBase.paddingBottom,
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        minWidth: 0,
        height: '100%',
      } as Record<string, any>;
    };

    return {
      ...baseSelectStyles,
      control,
      valueContainer,
      ...styles,
    };
  }, [error, label, styles]);

  const menuPortalTarget = useMemo(() => {
    if (menuPortalTargetProp) {
      return menuPortalTargetProp;
    }
    if (typeof document !== 'undefined') {
      return document.body;
    }
    return undefined;
  }, [menuPortalTargetProp]);

  const handleFocus: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> = useCallback(
    (event) => {
      setIsFocused(true);
      onFocus?.(event as any);
    },
    [onFocus]
  );

  const handleBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement> = useCallback(
    (event) => {
      setIsFocused(false);
      onBlur?.(event as any);
    },
    [onBlur]
  );

  const labelClass = clsx(
    'pointer-events-none absolute left-3 top-1.5 z-10 origin-[0] inline-flex h-4 items-center bg-white px-1 text-xs leading-none whitespace-nowrap transition-colors duration-150',
    error ? 'text-danger-500' : isFocused ? 'text-primary-500' : 'text-gray-500'
  );

  const effectivePlaceholder = hasValue ? undefined : placeholder;

  return (
    <div className={clsx('relative', containerClassName)} ref={rootRef}>
      {label && (
        <span className={labelClass}>
          {label}
          {required && <span className="text-danger-500">*</span>}
        </span>
      )}

      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange?.(option?.value ?? null)}
        styles={computedStyles}
        classNamePrefix={classNamePrefix}
        menuPortalTarget={menuPortalTarget}
        menuPosition={menuPosition}
        isClearable={isClearable}
        placeholder={effectivePlaceholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />

      {error ? (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      ) : (
        helperText && <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default SelectField;
