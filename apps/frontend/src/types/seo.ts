export interface SEOData {
  title: string;
  description?: string | null;
  keywords?: string | null;
  additionalMetaTags?: Record<string, string> | null;
}