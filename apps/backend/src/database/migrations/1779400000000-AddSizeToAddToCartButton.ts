import { MigrationInterface, QueryRunner } from 'typeorm';

const NEW_DEFAULT_CONFIG = {
  backgroundColor: {
    light: '#3b82f6',
    dark: '#2563eb',
  },
  outOfStockBackgroundColor: {
    light: '#94a3b8',
    dark: '#64748b',
  },
  textColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  outOfStockTextColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  size: 'md',
  textTransform: 'normal',
  icon: 'shopping-cart',
};

const NEW_CONFIG_SCHEMA = {
  backgroundColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for light mode background (e.g., #3b82f6, rgb(59, 130, 246))',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for dark mode background (e.g., #2563eb, rgb(37, 99, 235))',
      },
    },
    description: 'Background colors for light and dark themes',
  },
  outOfStockBackgroundColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock background in light mode',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock background in dark mode',
      },
    },
    description: 'Out-of-stock background colors for light and dark themes',
  },
  textColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for light mode text (e.g., #ffffff, rgb(255, 255, 255))',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for dark mode text (e.g., #ffffff, rgb(255, 255, 255))',
      },
    },
    description: 'Text colors for light and dark themes',
  },
  outOfStockTextColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock text in light mode',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock text in dark mode',
      },
    },
    description: 'Out-of-stock text colors for light and dark themes',
  },
  size: {
    type: 'enum',
    options: ['sm', 'md', 'lg'],
    description: 'Button size preset',
  },
  textTransform: {
    type: 'enum',
    options: ['normal', 'uppercase', 'capitalize'],
    description: 'Text transform style: normal (Viết hoa), uppercase (VIẾT HOA), capitalize (Viết Hoa)',
  },
  icon: {
    type: 'string',
    description: 'Icon name from icon library (e.g., shopping-cart, cart, plus). Leave empty to hide icon.',
  },
};

const PREVIOUS_DEFAULT_CONFIG = {
  backgroundColor: {
    light: '#3b82f6',
    dark: '#2563eb',
  },
  outOfStockBackgroundColor: {
    light: '#94a3b8',
    dark: '#64748b',
  },
  textColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  outOfStockTextColor: {
    light: '#ffffff',
    dark: '#ffffff',
  },
  textTransform: 'normal',
  icon: 'shopping-cart',
};

const PREVIOUS_CONFIG_SCHEMA = {
  backgroundColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for light mode background (e.g., #3b82f6, rgb(59, 130, 246))',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for dark mode background (e.g., #2563eb, rgb(37, 99, 235))',
      },
    },
    description: 'Background colors for light and dark themes',
  },
  outOfStockBackgroundColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock background in light mode',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock background in dark mode',
      },
    },
    description: 'Out-of-stock background colors for light and dark themes',
  },
  textColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for light mode text (e.g., #ffffff, rgb(255, 255, 255))',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for dark mode text (e.g., #ffffff, rgb(255, 255, 255))',
      },
    },
    description: 'Text colors for light and dark themes',
  },
  outOfStockTextColor: {
    type: 'object',
    properties: {
      light: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock text in light mode',
      },
      dark: {
        type: 'string',
        description: 'Hex, rgb, or Tailwind-compatible color for out-of-stock text in dark mode',
      },
    },
    description: 'Out-of-stock text colors for light and dark themes',
  },
  textTransform: {
    type: 'enum',
    options: ['normal', 'uppercase', 'capitalize'],
    description: 'Text transform style: normal (Viết hoa), uppercase (VIẾT HOA), capitalize (Viết Hoa)',
  },
  icon: {
    type: 'string',
    description: 'Icon name from icon library (e.g., shopping-cart, cart, plus). Leave empty to hide icon.',
  },
};

export class AddSizeToAddToCartButton1779400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
        UPDATE component_configs
        SET default_config = $1::jsonb,
            config_schema = $2::jsonb
        WHERE component_key = 'add_to_cart_button'
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
        WHERE component_key = 'add_to_cart_button'
      `,
      [JSON.stringify(PREVIOUS_DEFAULT_CONFIG), JSON.stringify(PREVIOUS_CONFIG_SCHEMA)],
    );
  }
}
