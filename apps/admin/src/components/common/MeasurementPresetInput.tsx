import React, { useEffect, useMemo, useState } from 'react';
import { Select } from './Select';
import { Input } from './Input';
import clsx from 'clsx';

type PresetKey = 'default' | 'small' | 'medium' | 'large' | 'custom';

type PresetMap = {
  small: string;
  medium: string;
  large: string;
};

type UnitOption = {
  value: string;
  label: string;
};

type LabelMap = Partial<Record<PresetKey | 'customHelper', string>>;

interface MeasurementPresetInputProps {
  value?: string;
  onChange: (value: string) => void;
  presets?: PresetMap;
  units?: UnitOption[];
  labels?: LabelMap;
  selectPlaceholder?: string;
  className?: string;
}

const DEFAULT_PRESETS: PresetMap = {
  small: '8px',
  medium: '16px',
  large: '32px',
};

const DEFAULT_UNITS: UnitOption[] = [
  { value: 'px', label: 'px' },
  { value: 'rem', label: 'rem' },
  { value: 'em', label: 'em' },
];

const parseMeasurementValue = (raw?: string) => {
  if (!raw) return null;
  const match = raw.trim().match(/^(-?\d*\.?\d+)\s*(px|rem|em)$/i);
  if (!match) return null;
  return {
    number: match[1],
    unit: match[2].toLowerCase(),
  };
};

export const MeasurementPresetInput: React.FC<MeasurementPresetInputProps> = ({
  value,
  onChange,
  presets = DEFAULT_PRESETS,
  units = DEFAULT_UNITS,
  labels,
  selectPlaceholder = 'Chọn tuỳ chọn',
  className,
}) => {
  const trimmedValue = (value ?? '').trim();
  const resolvedUnits = units.length ? units : DEFAULT_UNITS;

  const selectedPresetKey: PresetKey = useMemo(() => {
    if (!trimmedValue) {
      return 'default';
    }
    const presetEntry = Object.entries(presets).find(([, presetValue]) => presetValue === trimmedValue);
    return (presetEntry?.[0] as keyof PresetMap) ?? 'custom';
  }, [presets, trimmedValue]);

  const [customNumber, setCustomNumber] = useState('');
  const [customUnit, setCustomUnit] = useState(resolvedUnits[0]?.value ?? 'px');

  useEffect(() => {
    if (!trimmedValue) {
      setCustomNumber('');
      setCustomUnit(resolvedUnits[0]?.value ?? 'px');
      return;
    }

    if (selectedPresetKey === 'custom') {
      const parsed = parseMeasurementValue(trimmedValue);
      if (parsed) {
        setCustomNumber(parsed.number);
        setCustomUnit(
          resolvedUnits.find((unit) => unit.value === parsed.unit)?.value ?? resolvedUnits[0]?.value ?? parsed.unit
        );
      }
    }
  }, [selectedPresetKey, trimmedValue, resolvedUnits]);

  const handlePresetChange = (next: string) => {
    if (next === 'custom') {
      const combined = customNumber ? `${customNumber}${customUnit}` : '';
      onChange(combined);
      return;
    }

    if (next === 'default') {
      onChange('');
      return;
    }

    const presetValue = presets[next as keyof PresetMap];
    if (presetValue) {
      onChange(presetValue);
    }
  };

  const handleCustomNumberChange = (next: string) => {
    setCustomNumber(next);
    onChange(next ? `${next}${customUnit}` : '');
  };

  const handleUnitChange = (nextUnit: string) => {
    setCustomUnit(nextUnit);
    onChange(customNumber ? `${customNumber}${nextUnit}` : '');
  };

  return (
    <div className={clsx('space-y-2', className)}>
      <Select
        value={selectedPresetKey}
        onChange={(next) => handlePresetChange(next)}
        options={[
          { value: 'default', label: labels?.default ?? 'Giữ mặc định' },
          { value: 'small', label: labels?.small ?? 'Nhỏ' },
          { value: 'medium', label: labels?.medium ?? 'Vừa' },
          { value: 'large', label: labels?.large ?? 'Lớn' },
          { value: 'custom', label: labels?.custom ?? 'Tùy chỉnh' },
        ]}
        placeholder={selectPlaceholder}
        size="md"
      />

      {selectedPresetKey === 'custom' && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="number"
            min="0"
            step="0.5"
            inputSize="md"
            value={customNumber}
            onChange={(event) => handleCustomNumberChange(event.target.value)}
            placeholder="0"
            className="flex-1"
          />

          <div className="relative w-full sm:w-32">
            <select
              value={customUnit}
              onChange={(event) => handleUnitChange(event.target.value)}
              className={clsx(
                'w-full appearance-none rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900',
                'focus:outline-none focus:border-indigo-500 focus:ring-0 h-11'
              )}
            >
              {resolvedUnits.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-4 w-4 text-neutral-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      )}
      {selectedPresetKey === 'custom' && labels?.customHelper && (
        <p className="text-xs text-gray-500">{labels.customHelper}</p>
      )}
    </div>
  );
};
