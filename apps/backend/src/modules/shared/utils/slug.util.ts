import slugify from 'slugify';

export class SlugUtil {
    private static readonly VIETNAMESE_MAP: Record<string, string> = {
        đ: 'd',
        Đ: 'D',
        ă: 'a',
        Ă: 'A',
        â: 'a',
        Â: 'A',
        ê: 'e',
        Ê: 'E',
        ô: 'o',
        Ô: 'O',
        ơ: 'o',
        Ơ: 'O',
        ư: 'u',
        Ư: 'U',
        ý: 'y',
        Ý: 'Y',
    };

    /**
     * Generate a URL-friendly slug from text
     */
    static generate(text: string): string {
        if (!text) return '';

        let slug = slugify(text, {
            lower: true,
            strict: false,
            trim: true,
            replacement: '-',
            remove: /[*+~()'"]/g,
            locale: 'vi',
        });

        // Custom Vietnamese replacements to ensure best results
        Object.keys(this.VIETNAMESE_MAP).forEach((char) => {
            const regex = new RegExp(char, 'g');
            slug = slug.replace(regex, this.VIETNAMESE_MAP[char]);
        });

        // Clean up specific special characters and multiple dashes
        slug = slug
            .replace(/[,;.:!?@#$%^&<>{}[\]\\|`=]/g, '-')
            .replace(/-{2,}/g, '-')
            .replace(/^-+|-+$/g, '');

        return slug;
    }
}
