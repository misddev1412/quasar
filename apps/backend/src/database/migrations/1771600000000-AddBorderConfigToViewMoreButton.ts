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
  border: {
    width: 'thin',
    color: {
      light: '#4338ca',
      dark: '#818cf8',
    },
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
  border: {
    type: 'object',
    properties: {
      width: {
        type: 'enum',
        options: ['none', 'thin', 'medium', 'thick'],
        description: 'Border thickness',
      },
      color: {
        type: 'object',
        properties: {
          light: { type: 'string', description: 'Border color for light mode' },
          dark: { type: 'string', description: 'Border color for dark mode' },
        },
      },
    },
    description: 'Border appearance for light/dark themes',
  },
};

const PREVIOUS_DEFAULT_CONFIG = {
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

const PREVIOUS_CONFIG_SCHEMA = {
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

export class AddBorderConfigToViewMoreButton1771600000000 implements MigrationInterface {
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
