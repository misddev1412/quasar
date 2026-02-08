import slugify from 'slugify';

export interface Heading {
    id: string;
    text: string;
    level: number;
}

/**
 * Extracts headings (h2, h3, h4) from HTML string and generates IDs for them.
 * Returns both the list of headings and the modified HTML with IDs injected.
 */
export function processHtmlWithToc(html: string): { content: string; headings: Heading[] } {
    const headings: Heading[] = [];

    // Regex to find headings: <h[2-4].*?>(.*?)</h[2-4]>
    // We use a global match with capture groups
    const headingRegex = /<(h[2-4])(?:\s+[^>]*)?>(.*?)<\/h[2-4]>/gi;

    const content = html.replace(headingRegex, (match, tag, text) => {
        // Strip HTML tags from text for the TOC label and slug
        const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
        if (!cleanText) return match;

        const level = parseInt(tag.substring(1));
        const id = slugify(cleanText, { lower: true, strict: true });

        // Add to our list
        headings.push({ id, text: cleanText, level });

        // Check if tag already has an ID, if not, inject it
        if (match.includes('id=')) {
            return match;
        }

        return `<${tag} id="${id}">${text}</${tag}>`;
    });

    return { content, headings };
}
