import slugify from 'slugify';

/**
 * Utility functions for slug generation with Unicode support using slugify package
 */

/**
 * Generate a URL-friendly slug from a given text, including Unicode characters
 * Supports multiple languages including Arabic, Chinese, Japanese, Korean, Russian, Vietnamese, etc.
 * 
 * @param text - The input text to convert to a slug
 * @param maxLength - Maximum length of the generated slug (default: 100)
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Configure Vietnamese and other character replacements
  const vietnameseMap = {
    'đ': 'd', 'Đ': 'D',
    'ă': 'a', 'Ă': 'A',
    'â': 'a', 'Â': 'A',
    'ê': 'e', 'Ê': 'E',
    'ô': 'o', 'Ô': 'O',
    'ơ': 'o', 'Ơ': 'O',
    'ư': 'u', 'Ư': 'U',
    'ý': 'y', 'Ý': 'Y',
  };

  // Use slugify with Unicode support and Vietnamese character handling
  let slug = slugify(text, {
    lower: true,           // Convert to lowercase
    strict: false,         // Allow Unicode characters
    trim: true,           // Trim leading/trailing separators
    replacement: '-',     // Replace spaces and special chars with hyphens
    remove: /[*+~()'"]/g,  // Remove only certain characters
    locale: 'vi',         // Use Vietnamese locale for better handling
  });

  // Apply manual Vietnamese character replacements for edge cases
  Object.keys(vietnameseMap).forEach(char => {
    const regex = new RegExp(char, 'g');
    slug = slug.replace(regex, vietnameseMap[char]);
  });

  // Additional processing: convert remaining punctuation to hyphens
  slug = slug
    .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')  // Convert punctuation to hyphens
    .replace(/-{2,}/g, '-')                        // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');                      // Remove leading/trailing hyphens

  // Limit length and clean up
  return slug
    .substring(0, maxLength)
    .replace(/-+$/, ''); // Remove trailing hyphens after truncation
}

/**
 * Generate a unique slug by appending a number if the slug already exists
 * 
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @param separator - Separator to use before the number (default: '-')
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseSlug: string, 
  existingSlugs: string[], 
  separator: string = '-'
): string {
  if (!baseSlug) {
    return '';
  }

  let slug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}${separator}${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a slug is valid according to our rules
 * Uses a more inclusive pattern to support Unicode characters from slugify
 * 
 * @param slug - The slug to validate
 * @returns True if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Allow Unicode characters that slugify produces
  // This is more permissive than the original regex to support all languages
  return (
    slug.length > 0 &&
    !slug.startsWith('-') &&
    !slug.endsWith('-') &&
    !/-{2,}/.test(slug) && // No consecutive hyphens
    !/[*+~.()'"!:@#$%^&<>{}[\]\\|`=]/.test(slug) // No forbidden special characters
  );
}

/**
 * Clean and validate a manually entered slug using slugify
 * 
 * @param slug - The manually entered slug
 * @returns A cleaned and valid slug
 */
export function cleanSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    return '';
  }

  // Configure Vietnamese character replacements
  const vietnameseMap = {
    'đ': 'd', 'Đ': 'D',
    'ă': 'a', 'Ă': 'A',
    'â': 'a', 'Â': 'A',
    'ê': 'e', 'Ê': 'E',
    'ô': 'o', 'Ô': 'O',
    'ơ': 'o', 'Ơ': 'O',
    'ư': 'u', 'Ư': 'U',
    'ý': 'y', 'Ý': 'Y',
  };

  // Use slugify to clean the manually entered slug
  let cleanedSlug = slugify(slug, {
    lower: true,
    strict: false,
    trim: true,
    replacement: '-',
    remove: /[*+~()'"]/g,
    locale: 'vi',
  });

  // Apply manual Vietnamese character replacements for edge cases
  Object.keys(vietnameseMap).forEach(char => {
    const regex = new RegExp(char, 'g');
    cleanedSlug = cleanedSlug.replace(regex, vietnameseMap[char]);
  });

  // Additional processing: convert remaining punctuation to hyphens
  cleanedSlug = cleanedSlug
    .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')  // Convert punctuation to hyphens
    .replace(/-{2,}/g, '-')                        // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '');                      // Remove leading/trailing hyphens

  return cleanedSlug;
}