export const stripNumberLeadingZeros = (value: string): string => {
  if (!value) {
    return value;
  }

  const sign = value.startsWith('-')
    ? '-'
    : value.startsWith('+')
      ? '+'
      : '';

  const unsignedValue = sign ? value.slice(1) : value;

  if (!unsignedValue.startsWith('0')) {
    return value;
  }

  const [integerPartRaw, fractionalPartRaw] = unsignedValue.split('.', 2);
  const normalizedInteger = (() => {
    if (!integerPartRaw) {
      return '0';
    }

    const trimmed = integerPartRaw.replace(/^0+(?=\d)/, '');
    return trimmed === '' ? '0' : trimmed;
  })();

  if (fractionalPartRaw !== undefined) {
    return `${sign}${normalizedInteger}.${fractionalPartRaw}`;
  }

  return `${sign}${normalizedInteger}`;
};
