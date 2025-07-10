import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from './seeder.module';
import { SEOEntity } from '../../modules/seo/entities/seo.entity';

@Injectable()
export class SeoSeeder implements SeederModule {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<any> {
    const seoRepository = this.dataSource.getRepository(SEOEntity);
    
    // Check if we already have SEO data
    const count = await seoRepository.count();
    if (count > 0) {
      console.log('SEO data already exists, skipping seed');
      return;
    }

    // Sample SEO data for common routes
    const seoEntries = [
      {
        title: 'Quasar - Home',
        description: 'Welcome to Quasar - A modern web application platform',
        keywords: 'quasar, home, web application, platform, javascript, typescript, react',
        path: '/',
        active: true,
        additionalMetaTags: {
          'og:title': 'Quasar Home',
          'og:description': 'Modern web application platform built with TypeScript',
          'og:type': 'website',
          'twitter:card': 'summary_large_image'
        }
      },
      {
        title: 'About Quasar',
        description: 'Learn about the Quasar platform and our team',
        keywords: 'about, quasar, team, company, mission, vision',
        path: '/about',
        active: true,
        additionalMetaTags: {
          'og:title': 'About Quasar',
          'og:description': 'Learn about the Quasar platform and our team',
          'og:type': 'website'
        }
      },
      {
        title: 'Contact Us | Quasar',
        description: 'Get in touch with the Quasar team',
        keywords: 'contact, quasar, support, help, questions',
        path: '/contact',
        active: true,
        additionalMetaTags: {
          'og:title': 'Contact Us | Quasar',
          'og:description': 'Get in touch with the Quasar team',
          'og:type': 'website'
        }
      },
      {
        title: 'Quasar Admin Dashboard',
        description: 'Admin dashboard for Quasar application',
        keywords: 'admin, dashboard, management, quasar',
        path: '/admin',
        active: true,
        additionalMetaTags: {
          'og:title': 'Quasar Admin Dashboard',
          'og:type': 'website',
          'robots': 'noindex, nofollow'
        }
      },
      {
        title: 'Quasar Documentation',
        description: 'Comprehensive documentation for the Quasar platform',
        keywords: 'documentation, docs, quasar, guide, tutorial, api',
        path: '/docs',
        active: true,
        additionalMetaTags: {
          'og:title': 'Quasar Documentation',
          'og:description': 'Comprehensive documentation for the Quasar platform',
          'og:type': 'article'
        }
      }
    ];

    // Insert sample SEO data
    await seoRepository.save(seoEntries.map(entry => seoRepository.create(entry)));
    
    console.log(`Seeded ${seoEntries.length} SEO entries`);
  }
} 