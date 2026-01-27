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
