import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { OpenAiConfigService } from './openai-config.service';

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
  constructor(private readonly openAiConfigService: OpenAiConfigService) { }

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
        timeout: 30000,
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
  }

  async generateContent(input: {
    entityType: 'product' | 'post';
    contentType: 'title' | 'description';
    context?: string;
    keywords?: string[];
    language?: string;
    tone?: string;
    style?: string;
  }): Promise<{ content: string; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const config = await this.openAiConfigService.getActiveConfig();

    if (!config) {
      throw new BadRequestException('OpenAI configuration not found. Please configure an active OpenAI config.');
    }

    const language = (input.language || 'vi').trim();
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

    if (input.contentType === 'title') {
      prompt = `Act as an ${role}. ${taskDescription} in ${language}.
      Context/Description: "${context}"
      Keywords: ${keywords.join(', ')}
      Tone: ${tone}
      Constraints: Keep it under 60 characters if possible. Short, concise, and catchy.
      Return ONLY the title text, no quotes, no explanations.`;
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
          - Length: Comprehensive and detailed (2-3 paragraphs).
        `;
      }

      prompt = `Act as an ${role}. ${taskDescription} in ${language}.
      Product/Post Title: "${context}"
      Keywords: ${keywords.join(', ')}
      Tone: ${tone}

      Requirements:${requirements}
      - valid HTML only, no markdown code blocks.`;
    }

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

      const content = response.data?.choices?.[0]?.message?.content;
      const usage = response.data?.usage;

      return {
        content: content?.trim() || '',
        usage: usage ? {
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens,
        } : undefined
      };
    } catch (error) {
      // Log the error for internal debugging but return a user-friendly message or rethrow
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new BadRequestException('Failed to generate content from OpenAI.');
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
