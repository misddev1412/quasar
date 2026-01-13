type MessageMap = Record<string, any>;

const isPlainObject = (value: unknown): value is MessageMap =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const mergeMessages = (base: MessageMap, override?: MessageMap): MessageMap => {
  const result: MessageMap = { ...base };

  if (!override) {
    return result;
  }

  Object.entries(override).forEach(([key, value]) => {
    const existing = result[key];
    if (isPlainObject(existing) && isPlainObject(value)) {
      result[key] = mergeMessages(existing, value);
      return;
    }

    result[key] = value;
  });

  return result;
};
