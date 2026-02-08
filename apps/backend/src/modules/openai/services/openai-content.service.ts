import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AdminProductService } from '../../products/services/admin-product.service';
import { OpenAiConfigService } from './openai-config.service';
import { MediaService } from '../../storage/services/media.service';

export interface GenerateSeoArticleInput {
  topic: string;
  keywords?: string[];
  language?: string;
  tone?: string;
  wordCount?: number;
  audience?: string;
  includeFaq?: boolean;
  configId?: string;
}

export interface GeneratedSeoArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

@Injectable()
export class OpenAiContentService {
  private readonly logger = new Logger(OpenAiContentService.name);
  constructor(
    private readonly openAiConfigService: OpenAiConfigService,
    private readonly adminProductService: AdminProductService,
    private readonly mediaService: MediaService,
  ) { }

  async generateSeoArticle(input: GenerateSeoArticleInput): Promise<GeneratedSeoArticle> {
    const config = input.configId
      ? await this.openAiConfigService.getConfigById(input.configId)
      : await this.openAiConfigService.getActiveConfig();

    if (!config) {
      throw new BadRequestException('OpenAI configuration not found. Please configure an active OpenAI config.');
    }

    const keywords = (input.keywords || []).filter((keyword) => keyword.trim() !== '');
    const language = (input.language || 'vi').trim();
    const tone = input.tone?.trim() || 'professional';
    const audience = input.audience?.trim() || 'general readers';
    const wordCount = input.wordCount && input.wordCount > 0 ? input.wordCount : 1200;
    const includeFaq = input.includeFaq !== false;

    const systemPrompt = [
      'You are an expert SEO content writer.',
      'Return JSON only, no markdown and no code fences.',
      'Content must be valid HTML with headings, paragraphs, and lists as needed.',
      'The slug must be lowercase, use hyphens, and contain only letters, numbers, and hyphens.',
    ].join(' ');

    const userPrompt = [
      `Topic: ${input.topic}`,
      `Language: ${language}`,
      `Tone: ${tone}`,
      `Audience: ${audience}`,
      `Target word count: ${wordCount}`,
      `Include FAQ section: ${includeFaq ? 'yes' : 'no'}`,
      keywords.length ? `Focus keywords: ${keywords.join(', ')}` : 'Focus keywords: none',
      'Return a JSON object with keys: title, slug, excerpt, content, metaTitle, metaDescription, metaKeywords.',
      'metaKeywords should be a comma-separated string.',
    ].join('\n');

    const baseUrl = (config.baseUrl || 'https://api.openai.com').replace(/\/+$/, '');
    const apiUrl = baseUrl.endsWith('/v1')
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/v1/chat/completions`;

    try {
      const response = await axios.post(
        apiUrl,
        {
          model: config.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 45000,
        },
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new BadRequestException('OpenAI response is empty.');
      }

      const parsed = this.parseJson(content);

      const requiredFields: (keyof GeneratedSeoArticle)[] = [
        'title',
        'slug',
        'excerpt',
        'content',
        'metaTitle',
        'metaDescription',
        'metaKeywords',
      ];

      for (const field of requiredFields) {
        if (!parsed[field] || typeof parsed[field] !== 'string') {
          throw new BadRequestException(`OpenAI response missing field: ${field}`);
        }
      }

      return parsed as unknown as GeneratedSeoArticle;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data?.error;
        const errorMessage = errorData?.message || error.message;
        this.logger.error(`OpenAI SEO Generation API Error: ${errorMessage}`, {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new BadRequestException(`Failed to generate SEO article: ${errorMessage}`);
      }
      throw error;
    }
  }

  async generateContent(input: {
    entityType: 'product' | 'post';
    contentType: 'title' | 'description' | 'keywords' | 'image';
    context?: string;
    keywords?: string[];
    language?: string;
    tone?: string;
    style?: string;
    includeProductLinks?: boolean;
    includeImages?: boolean;
    length?: 'short' | 'medium' | 'long' | 'very_long';
  }): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const config = await this.openAiConfigService.getActiveConfig();

    if (!config) {
      throw new BadRequestException('OpenAI configuration not found. Please configure an active OpenAI config.');
    }

    const languageMap: Record<string, string> = {
      vi: 'Vietnamese',
      en: 'English',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      ko: 'Korean',
      zh: 'Chinese',
    };
    const languageName = languageMap[input.language?.toLowerCase()] || input.language || 'Vietnamese';
    const tone = input.tone?.trim() || 'professional';
    const context = input.context?.trim() || '';
    const keywords = (input.keywords || []).filter((k) => k.trim());

    let prompt = '';

    const style = input.style?.trim() || 'seo-standard';
    let role = 'expert SEO copywriter';
    let taskDescription = `Generate a catchy, SEO-friendly ${input.entityType} title`;

    if (style === 'blog-post') {
      role = 'professional blog writer';
      taskDescription = `Write a catchy blog post title for a ${input.entityType}`;
    } else if (style === 'social-media') {
      role = 'social media manager';
      taskDescription = `Write an engaging social media headline for a ${input.entityType}`;
    } else if (style === 'technical') {
      role = 'technical writer';
      taskDescription = `Write a precise technical title for a ${input.entityType}`;
    }

    if (input.contentType === 'image') {
      const seed = context || (keywords.length ? keywords.join(', ') : `${input.entityType} og image`);
      prompt = `[[IMAGE_PROMPT: ${seed}, ${tone}, modern, clean composition, high quality, product-focused, suitable for social sharing]]`;
    } else if (input.contentType === 'title') {
      prompt = `Act as an ${role}. ${taskDescription} in ${languageName}.
      Context/Description: "${context}"
      Keywords: ${keywords.join(', ')}
      Tone: ${tone}
      Constraints: Keep it under 60 characters if possible. Short, concise, and catchy.
      Return ONLY the title text, no quotes, no explanations.`;
    } else if (input.contentType === 'keywords') {
      prompt = `Act as an expert SEO specialist. Generate a concise, SEO-focused keyword list for a ${input.entityType} in ${languageName}.
      Context/Description: "${context}"
      Seed keywords (include if relevant): ${keywords.join(', ') || 'none'}
      Tone: ${tone}
      Constraints:
      - Return ONLY a comma-separated list of 8-15 keywords/phrases.
      - No hashtags, no numbering, no extra text, no HTML.
      - Prefer specific, intent-rich phrases over generic single words.`;
    } else {
      let requirements = '';
      if (style === 'blog-post') {
        role = 'professional blog writer';
        taskDescription = `Write a compelling blog post section about this ${input.entityType}`;
        requirements = `
          - Use engaging storytelling.
          - Use HTML format (p, h3, ul, li).
          - Length: Detailed and comprehensive (approx. 200-300 words).
          - Structure: Introduction, Key Points, Conclusion.
        `;
      } else if (style === 'social-media') {
        role = 'social media manager';
        taskDescription = `Write a high-converting social media caption for this ${input.entityType}`;
        requirements = `
          - Use emojis where appropriate.
          - Use hashtags.
          - Call to action.
          - Use HTML format (p, br).
          - Length: short and punchy.
        `;
      } else if (style === 'technical') {
        role = 'technical writer';
        taskDescription = `Write a detailed technical description for this ${input.entityType}`;
        requirements = `
          - Focus on specs and features.
          - Use bullet points.
          - Use HTML format (p, ul, li).
          - Tone: precise and neutral.
          - Length: Detailed technical breakdown.
        `;
      } else {
        // Default SEO Standard
        taskDescription = `Write a compelling, SEO-optimized description for a ${input.entityType}`;
        requirements = `
          - Use HTML format (p, ul, li, strong tags).
          - Include a catchy opening.
          - Highlight key features/benefits using bullet points if appropriate.
          - Naturally incorporate the keywords.
        `;
      }

      if (input.length) {
        const lengthMap = {
          short: 'around 100-200 words, concise but informative.',
          medium: 'around 300-500 words, detailed and balanced.',
          long: 'around 600-800 words, comprehensive with multiple sections.',
          very_long: 'at least 1000 words, very in-depth and thorough exploration of the topic.',
        };
        requirements += `\n- Length: ${lengthMap[input.length]}`;
      } else {
        requirements += `\n- Length: Comprehensive and detailed (2-3 paragraphs).`;
      }

      requirements += `\n- Hashtags: Include 5-10 relevant hashtags at the very end of the content (e.g., #product #seo #marketing).`;

      let productContext = '';
      if (input.includeProductLinks && input.entityType === 'post' && input.contentType === 'description') {
        // Search for relevant products based on context
        // If context is too long, it might break search, so we try to get some products anyway
        let productsResult = await this.adminProductService.getAllProducts({
          page: 1,
          limit: 10,
          search: input.context?.substring(0, 100), // Limit search string length
          isActive: true,
        });

        // Fallback: if no products found with search, just get latest products to give AI some options
        if (!productsResult.items || productsResult.items.length === 0) {
          productsResult = await this.adminProductService.getAllProducts({
            page: 1,
            limit: 10,
            isActive: true,
          });
        }

        if (productsResult.items && productsResult.items.length > 0) {
          const productList = productsResult.items.map(p => `- ${p.name}: /products/${p.slug}`).join('\n');
          productContext = `
      IMPORTANT: You MUST naturally mention and link to at least 2-3 of these relevant products.
      Use exactly this HTML format: <a href="LINK">PRODUCT_NAME</a>
      Available products to link:
      ${productList}
          `;
        }
      }

      let imageRequirements = '';
      if (input.includeImages) {
        let imageCount = '1';
        if (input.length === 'medium') imageCount = '1-2';
        else if (input.length === 'long') imageCount = '2-3';
        else if (input.length === 'very_long') imageCount = '3-4';

        imageRequirements = `- IMPORTANT: Include ${imageCount} highly relevant image placeholders.
      - PLACEMENT: Do NOT put all images at the end. Instead, place them naturally between major sections or paragraphs.
      - Format exactly like this: [[IMAGE_PROMPT: a detailed description of the image to be generated (this will also be used as the image alt text for SEO)]]`;
      }

      prompt = `Act as an ${role}. ${taskDescription} in ${languageName}.
      Product/Post Title: "${context}"
      Keywords: ${keywords.join(', ')}
      Tone: ${tone}

      Requirements:${requirements}
      ${productContext}
      ${imageRequirements}
      - valid HTML only, no markdown code blocks.`;
    }

    const baseUrl = (config.baseUrl || 'https://api.openai.com').replace(/\/+$/, '');
    const apiUrl = baseUrl.endsWith('/v1')
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/v1/chat/completions`;

    try {
      let content = '';
      let usage = undefined as undefined | { prompt_tokens: number; completion_tokens: number; total_tokens: number };

      if (input.contentType === 'image') {
        content = prompt;
      } else {
        const response = await axios.post(
          apiUrl,
          {
            model: config.model,
            messages: [
              { role: 'system', content: 'You are a helpful assistant.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        );

        content = response.data?.choices?.[0]?.message?.content || '';
        usage = response.data?.usage;
      }

      // Image generation step
      const shouldGenerateImages = (input.includeImages || input.contentType === 'image');
      if (shouldGenerateImages) {
        const imageRegex = /\[\[IMAGE_PROMPT:\s*(.+?)\s*\]\]/g;
        let match;
        const imagePrompts: Array<{ placeholder: string; prompt: string }> = [];

        while ((match = imageRegex.exec(content)) !== null) {
          imagePrompts.push({ placeholder: match[0], prompt: match[1] });
        }

        // If contentType=image and model didn't return IMAGE_PROMPT, use content/context as prompt.
        if (input.contentType === 'image' && imagePrompts.length === 0) {
          const fallbackPrompt = content.replace(/[\[\]]/g, '').trim()
            || context
            || (keywords.length ? keywords.join(', ') : '')
            || `${input.entityType} og image`;
          imagePrompts.push({ placeholder: '[[IMAGE_PROMPT: fallback]]', prompt: fallbackPrompt });
        }

        if (imagePrompts.length > 0) {
          const postImageGeneration = async (promptText: string) => {
            const payload = {
              model: "dall-e-3",
              prompt: `${promptText}, realistic, high resolution, 8k, highly detailed, professional cinematic photography, commercial product style, stunning lighting`,
              n: 1,
              size: "1024x1024",
              quality: "standard",
            };

            const headers = {
              Authorization: `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            };

            const maxAttempts = 2;
            let lastError: unknown;

            for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
              try {
                return await axios.post(
                  `${baseUrl}/v1/images/generations`,
                  payload,
                  { headers, timeout: 60000 }
                );
              } catch (err) {
                lastError = err;
                if (attempt === maxAttempts) {
                  throw err;
                }
              }
            }
            throw lastError;
          };

          const imagePromises: Promise<{ placeholder: string; url: string; alt: string }>[] = imagePrompts.map(({ placeholder, prompt }) => (async () => {
            try {
              const imgResponse = await postImageGeneration(prompt);
              const url = imgResponse.data?.data?.[0]?.url || '';
              if (!url) {
                throw new BadRequestException('OpenAI image generation returned empty URL.');
              }

              if (url) {
                try {
                  // Download image from OpenAI
                  const imageResponse = await axios.get(url, { responseType: 'arraybuffer' });
                  const buffer = Buffer.from(imageResponse.data);

                  // Mock file object for MediaService
                  const mockFile = {
                    buffer: buffer,
                    originalname: `ai-gen-${Date.now()}.png`,
                    mimetype: 'image/png',
                    size: buffer.length,
                  };

                  // Upload to permanent storage
                  // We don't have user ID here easily, passing null since it's system generated
                  const uploadedMedia = await this.mediaService.uploadMedia(mockFile, null as any, {
                    folder: 'ai-generated',
                    alt: prompt,
                  });

                  return {
                    placeholder,
                    url: uploadedMedia.url,
                    alt: prompt
                  };
                } catch (uploadError) {
                  this.logger.error('Failed to upload AI image to storage:', uploadError);
                  if (input.contentType === 'image') {
                    throw new BadRequestException('Failed to upload AI image to Media Manager.');
                  }
                  return { placeholder, url, alt: prompt }; // Fallback to OpenAI URL
                }
              }

              return {
                placeholder,
                url: '',
                alt: prompt
              };
            } catch (err) {
              const errMessage = axios.isAxiosError(err)
                ? (err.response?.data?.error?.message || err.message)
                : (err as Error).message;
              this.logger.error('DALL-E Error:', errMessage);
              if (input.contentType === 'image') {
                throw new BadRequestException(`Failed to generate OG image: ${errMessage}`);
              }
              return { placeholder, url: '', alt: '' };
            }
          })());

          const generatedImages = await Promise.all(imagePromises);
          if (input.contentType === 'image') {
            const firstUrl = generatedImages.find(img => img.url)?.url || '';
            if (!firstUrl) {
              throw new BadRequestException('Failed to generate OG image.');
            }
            return {
              content: firstUrl,
              usage: usage ? {
                prompt_tokens: usage.prompt_tokens,
                completion_tokens: usage.completion_tokens,
                total_tokens: usage.total_tokens,
              } : undefined
            };
          }

          for (const img of generatedImages) {
            if (img.url) {
              const imgHtml = `<img src="${img.url}" alt="${img.alt.replace(/"/g, '&quot;')}" class="rounded-lg my-6 shadow-md w-full" />`;
              content = content.replace(img.placeholder, imgHtml);
            } else {
              content = content.replace(img.placeholder, ''); // Remove failed placeholders
            }
          }
        }
      }

      return {
        content: content.trim(),
        usage: usage ? {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        } : undefined
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data?.error;
        const errorMessage = errorData?.message || error.message;
        this.logger.error(`OpenAI Content Generation API Error: ${errorMessage}`, {
          status: error.response?.status,
          data: error.response?.data,
        });
        throw new BadRequestException(`Failed to generate content from OpenAI: ${errorMessage}`);
      }
      this.logger.error('OpenAI Generation Unexpected Error:', error);
      throw new BadRequestException(`Failed to generate content from OpenAI: ${error.message}`);
    }
  }

  private parseJson(content: string): Record<string, unknown> {
    const trimmed = content.trim();
    const jsonText = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      return JSON.parse(jsonText);
    } catch (error) {
      throw new BadRequestException('Failed to parse OpenAI response as JSON.');
    }
  }
}
