export class StringUtil {
    private static readonly UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

    /**
     * Check if a string is a valid UUID
     */
    static isUuid(value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }
        return this.UUID_REGEX.test(value.trim());
    }

    /**
     * Clean text input (trim, return null if empty)
     */
    static cleanText(value: any): string | null {
        if (typeof value !== 'string') {
            return null;
        }
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    /**
     * Clean UUID input (trim, return null if empty/invalid)
     */
    static cleanUuid(value: any): string | null {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return null;
        }
        // Could add validation here if strict UUID required
        return value;
    }
}
