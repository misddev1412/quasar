import { MigrationInterface, QueryRunner } from 'typeorm';

const NEW_DEFAULT_CONFIG = {
  size: 'md',
  textTransform: 'uppercase',
  isBold: true,
  textColor: {
    light: '#4338ca',
    dark: '#c7d2fe',
  },
  backgroundColor: {
    light: 'transparent',
    dark: 'transparent',
  },
};

const NEW_CONFIG_SCHEMA = {
  size: {
    type: 'enum',
    options: ['sm', 'md', 'lg'],
    description: 'Button size preset',
  },
  textTransform: {
    type: 'enum',
    options: ['none', 'uppercase', 'capitalize'],
    description: 'Text transform style for the label',
  },
  isBold: {
    type: 'boolean',
    description: 'Toggle bold styling for the label',
  },
  textColor: {
    type: 'object',
    properties: {
      light: { type: 'string', description: 'Hex/RGB color for light mode text' },
      dark: { type: 'string', description: 'Hex/RGB color for dark mode text' },
    },
    description: 'Text colors for light/dark themes',
  },
  backgroundColor: {
    type: 'object',
    properties: {
      light: { type: 'string', description: 'Hex/RGB color for light mode background' },
      dark: { type: 'string', description: 'Hex/RGB color for dark mode background' },
    },
    description: 'Background colors for light/dark themes',
  },
};

const PREVIOUS_TEXT_COLOR_OPTIONS = [
  'text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-50',
  'text-gray-900 dark:text-gray-100',
  'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
  'text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
  'text-white hover:text-white dark:text-white dark:hover:text-white',
];

const PREVIOUS_BACKGROUND_COLOR_OPTIONS = [
  'bg-transparent hover:bg-gray-50 dark:bg-transparent dark:hover:bg-gray-900/40',
  'bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800',
  'bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200',
  'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600',
  'bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
];

const PREVIOUS_DEFAULT_CONFIG = {
  size: 'md',
  weight: 'medium',
  textColor: PREVIOUS_TEXT_COLOR_OPTIONS[2],
  backgroundColor: PREVIOUS_BACKGROUND_COLOR_OPTIONS[0],
};

const PREVIOUS_CONFIG_SCHEMA = {
  size: {
    type: 'enum',
    options: ['sm', 'md', 'lg'],
    description: 'Button size preset',
  },
  weight: {
    type: 'enum',
    options: ['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'extrabold', 'black'],
    description: 'Font weight for the button label',
  },
  textColor: {
    type: 'enum',
    options: PREVIOUS_TEXT_COLOR_OPTIONS,
    description: 'Text color utility classes applied to the CTA (includes hover & dark variants)',
  },
  backgroundColor: {
    type: 'enum',
    options: PREVIOUS_BACKGROUND_COLOR_OPTIONS,
    description: 'Background utility classes applied to the CTA (includes hover & dark variants)',
  },
};

export class SimplifyViewMoreButtonConfig1771500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        UPDATE component_configs
        SET default_config = $1::jsonb,
            config_schema = $2::jsonb
        WHERE component_key = 'view_more_button'
      `,
      [JSON.stringify(NEW_DEFAULT_CONFIG), JSON.stringify(NEW_CONFIG_SCHEMA)],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        UPDATE component_configs
        SET default_config = $1::jsonb,
            config_schema = $2::jsonb
        WHERE component_key = 'view_more_button'
      `,
      [JSON.stringify(PREVIOUS_DEFAULT_CONFIG), JSON.stringify(PREVIOUS_CONFIG_SCHEMA)],
    );
  }
}
