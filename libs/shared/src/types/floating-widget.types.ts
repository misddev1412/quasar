import { z } from 'zod';

export const floatingWidgetActionTypeValues = [
  'call',
  'email',
  'back_to_top',
  'zalo',
  'messenger',
  'custom',
] as const;

export type FloatingWidgetActionType = typeof floatingWidgetActionTypeValues[number];

export const floatingWidgetActionEffectValues = [
  'none',
  'pulse',
  'ring',
  'bounce',
] as const;

export type FloatingWidgetActionEffect = typeof floatingWidgetActionEffectValues[number];

export const floatingWidgetActionMetadataSchema = z
  .object({
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    messengerLink: z.string().optional(),
    zaloPhone: z.string().optional(),
    customUrl: z.string().optional(),
    note: z.string().optional(),
  })
  .partial();

export type FloatingWidgetActionMetadata = z.infer<typeof floatingWidgetActionMetadataSchema>;

export const floatingWidgetActionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(floatingWidgetActionTypeValues),
  icon: z.string().optional(),
  description: z.string().optional(),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  effect: z.enum(floatingWidgetActionEffectValues).default('none'),
  tooltip: z.string().optional(),
  href: z.string().optional(),
  metadata: floatingWidgetActionMetadataSchema.optional(),
});

export type FloatingWidgetActionConfig = z.infer<typeof floatingWidgetActionSchema>;

export const floatingWidgetActionListSchema = z.array(floatingWidgetActionSchema);

export type FloatingWidgetActionConfigList = z.infer<typeof floatingWidgetActionListSchema>;

export const DEFAULT_FLOATING_WIDGET_ACTIONS: FloatingWidgetActionConfigList = [
  {
    id: 'floating-call',
    label: 'Call us',
    type: 'call',
    icon: 'phone',
    description: 'Call our support team',
    order: 0,
    isActive: true,
    backgroundColor: '#0ea5e9',
    textColor: '#ffffff',
    effect: 'ring',
    tooltip: 'Call now',
    metadata: {
      phoneNumber: '0987654321',
    },
  },
  {
    id: 'floating-zalo',
    label: 'Chat on Zalo',
    type: 'zalo',
    icon: 'chat',
    description: 'Message us on Zalo',
    order: 1,
    isActive: true,
    backgroundColor: '#0b93f6',
    textColor: '#ffffff',
    effect: 'none',
    tooltip: 'Zalo chat',
    metadata: {
      zaloPhone: 'https://zalo.me/0987654321',
    },
  },
  {
    id: 'floating-messenger',
    label: 'Messenger',
    type: 'messenger',
    icon: 'chat',
    description: 'Contact via Facebook Messenger',
    order: 2,
    isActive: true,
    backgroundColor: '#0084ff',
    textColor: '#ffffff',
    effect: 'pulse',
    tooltip: 'Messenger chat',
    metadata: {
      messengerLink: 'https://m.me/yourpage',
    },
  },
  {
    id: 'floating-back-to-top',
    label: 'Back to top',
    type: 'back_to_top',
    icon: 'arrow-up',
    description: 'Scroll back to the top',
    order: 3,
    isActive: true,
    backgroundColor: '#111827',
    textColor: '#ffffff',
    effect: 'none',
    tooltip: 'Back to top',
  },
];
