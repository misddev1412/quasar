# Agent Rules for Admin Pages

## Admin form pages (apps/admin/src/pages)
- Prefer `StandardFormPage` (wrapper over `CreatePageTemplate`) for create/edit forms unless the page is intentionally non-form.
- Default to `maxWidth="full"` and the template action bar for create/edit forms.
- Always pass `isSubmitting` from the page-level mutation to the template.
- Use translated `entityName` / `entityNamePlural` keys when available; avoid raw strings.
- Use an icon with the standard color classes: `text-primary-600 dark:text-primary-400`.

## Exceptions
- If a page must be narrow for a reason (e.g., wizard, modal-like flow), document the reason inline in the page file.
