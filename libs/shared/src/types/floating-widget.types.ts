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
  tooltip: z.string().optional(),
  href: z.string().optional(),
  metadata: floatingWidgetActionMetadataSchema.optional(),
});

export type FloatingWidgetActionConfig = z.infer<typeof floatingWidgetActionSchema>;

export const floatingWidgetActionListSchema = z.array(floatingWidgetActionSchema);

export type FloatingWidgetActionConfigList = z.infer<typeof floatingWidgetActionListSchema>;
