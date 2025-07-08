/**
 * Environment enumeration
 * Defines different deployment environments
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  TESTING = 'testing',
  PRODUCTION = 'production'
}

/**
 * Sort order enumeration
 * Defines sorting directions for queries
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

/**
 * Date format enumeration
 * Defines standard date formats used in the application
 */
export enum DateFormat {
  ISO = 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DATE_ONLY = 'YYYY-MM-DD',
  TIME_ONLY = 'HH:mm:ss',
  DATETIME = 'YYYY-MM-DD HH:mm:ss',
  READABLE = 'MMM DD, YYYY',
  FULL = 'dddd, MMMM DD, YYYY'
}

/**
 * File type enumeration
 * Defines supported file types for uploads
 */
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

/**
 * File extension enumeration for images
 */
export enum ImageExtension {
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  GIF = 'gif',
  WEBP = 'webp',
  SVG = 'svg'
}

/**
 * Language enumeration
 * Defines supported languages for internationalization
 */
export enum Language {
  ENGLISH = 'en',
  VIETNAMESE = 'vi',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  CHINESE = 'zh',
  JAPANESE = 'ja'
}

/**
 * Currency enumeration
 * Defines supported currencies
 */
export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  VND = 'VND',
  GBP = 'GBP',
  JPY = 'JPY',
  CNY = 'CNY'
} 