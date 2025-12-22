import { MigrationInterface, QueryRunner } from 'typeorm';

const NEW_DEFAULT_CONFIG = {
  size: 'md',
  weight: 'medium',
  textColor: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-200',
  backgroundColor: 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/40',
};

const NEW_CONFIG_SCHEMA = {
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
    type: 'string',
    description: 'Tailwind text color classes (supporting hover/dark variants)',
  },
  backgroundColor: {
    type: 'string',
    description: 'Tailwind background color classes (supporting hover/dark variants)',
  },
};

const OLD_DEFAULT_CONFIG = {
  bold: true,
  href: '#',
  size: 'md',
  label: 'View More',
  variant: 'default',
  darkMode: {
    textColor: 'dark:text-gray-200',
    borderColor: 'dark:border-gray-700',
    hoverTextColor: 'dark:hover:text-gray-100',
    backgroundColor: 'dark:bg-transparent',
    hoverBorderColor: 'dark:hover:border-gray-500',
    hoverBackgroundColor: 'dark:hover:bg-gray-800',
  },
  showIcon: false,
  lightMode: {
    textColor: 'text-gray-700',
    borderColor: 'border-gray-200',
    hoverTextColor: 'hover:text-gray-900',
    backgroundColor: 'bg-transparent',
    hoverBorderColor: 'hover:border-gray-300',
    hoverBackgroundColor: 'hover:bg-gray-50',
  },
  uppercase: true,
  iconPosition: 'right',
};

const OLD_CONFIG_SCHEMA = {
  bold: { type: 'boolean', description: 'Use bold font weight (semibold)' },
  href: { type: 'string', description: 'Link destination URL' },
  size: { type: 'enum', options: ['sm', 'md', 'lg'], description: 'Button size preset' },
  label: { type: 'string', description: 'Button text content' },
  variant: { type: 'enum', options: ['default', 'primary', 'ghost', 'outline'], description: 'Visual style preset' },
  darkMode: {
    type: 'object',
    properties: {
      textColor: { type: 'string', description: 'Tailwind dark mode text color class (e.g., dark:text-gray-200)' },
      borderColor: { type: 'string', description: 'Tailwind dark mode border color class' },
      hoverTextColor: { type: 'string', description: 'Dark mode hover state text color' },
      backgroundColor: { type: 'string', description: 'Tailwind dark mode background color class' },
      hoverBorderColor: { type: 'string', description: 'Dark mode hover state border color' },
      hoverBackgroundColor: { type: 'string', description: 'Dark mode hover state background color' },
    },
    description: 'Dark mode color configuration',
  },
  showIcon: { type: 'boolean', description: 'Display an icon alongside text' },
  lightMode: {
    type: 'object',
    properties: {
      textColor: { type: 'string', description: 'Tailwind text color class (e.g., text-gray-700)' },
      borderColor: { type: 'string', description: 'Tailwind border color class' },
      hoverTextColor: { type: 'string', description: 'Hover state text color' },
      backgroundColor: { type: 'string', description: 'Tailwind background color class' },
      hoverBorderColor: { type: 'string', description: 'Hover state border color' },
      hoverBackgroundColor: { type: 'string', description: 'Hover state background color' },
    },
    description: 'Light mode color configuration',
  },
  uppercase: { type: 'boolean', description: 'Transform text to uppercase' },
  iconPosition: { type: 'enum', options: ['left', 'right'], description: 'Icon placement' },
};

export class UpdateViewMoreButtonConfig1771300000000 implements MigrationInterface {
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
      [JSON.stringify(OLD_DEFAULT_CONFIG), JSON.stringify(OLD_CONFIG_SCHEMA)],
    );
  }
}
