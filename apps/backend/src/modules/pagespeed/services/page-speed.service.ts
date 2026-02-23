import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PageSpeedConfigService } from '@backend/modules/pagespeed/services/page-speed-config.service';

export interface RunPageSpeedInput {
  url?: string;
  strategy?: 'mobile' | 'desktop';
  categories?: Array<'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa'>;
  locale?: string;
}

@Injectable()
export class PageSpeedService {
  private readonly logger = new Logger(PageSpeedService.name);
  private readonly endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  constructor(private readonly pageSpeedConfigService: PageSpeedConfigService) {}

  async runInsights(input: RunPageSpeedInput): Promise<Record<string, unknown>> {
    const trimmedUrl = input.url?.trim() || '';

    if (!trimmedUrl) {
      throw new BadRequestException('URL is required.');
    }

    const params = new URLSearchParams();
    params.append('url', trimmedUrl);
    params.append('strategy', input.strategy || 'mobile');

    for (const category of input.categories || []) {
      params.append('category', category);
    }

    if (input.locale?.trim()) {
      params.append('locale', input.locale.trim());
    }

    const apiKey = await this.pageSpeedConfigService.getApiKey();
    if (apiKey) {
      params.append('key', apiKey);
    }

    try {
      const response = await axios.get(this.endpoint, {
        params,
        timeout: 45000,
      });

      return response.data as Record<string, unknown>;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error?.message ||
          error.response?.data?.error_description ||
          error.message ||
          'Google PageSpeed API request failed.';

        this.logger.error(`Google PageSpeed API error: ${message}`, {
          status: error.response?.status,
          data: error.response?.data,
        });

        throw new BadRequestException(`Google PageSpeed API error: ${message}`);
      }

      throw error;
    }
  }
}
