import { DataSource } from 'typeorm';
import { Visitor, VisitorType, VisitorSource } from '../../modules/visitor/entities/visitor.entity';
import { VisitorSession, SessionStatus } from '../../modules/visitor/entities/visitor-session.entity';
import { PageView, PageViewType } from '../../modules/visitor/entities/page-view.entity';
import { v4 as uuidv4 } from 'uuid';

export class VisitorDataSeeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    console.log('🌱 Seeding visitor analytics data...');

    const visitorRepo = this.dataSource.getRepository(Visitor);
    const sessionRepo = this.dataSource.getRepository(VisitorSession);
    const pageViewRepo = this.dataSource.getRepository(PageView);

    // Sample data
    const samplePages = [
      { url: '/', title: 'Home', type: PageViewType.PAGE_VIEW },
      { url: '/products', title: 'All Products', type: PageViewType.CATEGORY_VIEW },
      { url: '/products/electronics', title: 'Electronics', type: PageViewType.CATEGORY_VIEW },
      { url: '/products/laptop-pro', title: 'Laptop Pro', type: PageViewType.PRODUCT_VIEW },
      { url: '/products/smartphone-x', title: 'Smartphone X', type: PageViewType.PRODUCT_VIEW },
      { url: '/categories/clothing', title: 'Clothing', type: PageViewType.CATEGORY_VIEW },
      { url: '/search?q=laptop', title: 'Search Results', type: PageViewType.SEARCH_VIEW },
      { url: '/cart', title: 'Shopping Cart', type: PageViewType.CART_VIEW },
      { url: '/checkout', title: 'Checkout', type: PageViewType.CHECKOUT_VIEW },
      { url: '/about', title: 'About Us', type: PageViewType.PAGE_VIEW },
      { url: '/contact', title: 'Contact', type: PageViewType.PAGE_VIEW },
      { url: '/blog/latest-tech-trends', title: 'Latest Tech Trends', type: PageViewType.BLOG_VIEW },
    ];

    const countries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'IN', 'BR', 'MX'];
    const cities = ['New York', 'London', 'Los Angeles', 'Toronto', 'Sydney', 'Berlin', 'Paris', 'Tokyo', 'Mumbai', 'São Paulo'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Opera'];
    const operatingSystems = ['Windows', 'macOS', 'Linux', 'Android', 'iOS'];
    const deviceTypes = ['desktop', 'mobile', 'tablet'];

    // Generate visitors for the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    for (let day = 0; day < 30; day++) {
      const currentDay = new Date(thirtyDaysAgo.getTime() + day * 24 * 60 * 60 * 1000);

      // Generate 50-200 visitors per day
      const dailyVisitors = Math.floor(Math.random() * 150) + 50;

      for (let i = 0; i < dailyVisitors; i++) {
        const isReturning = Math.random() < 0.3; // 30% returning visitors
        const countryIndex = Math.floor(Math.random() * countries.length);
        const deviceTypeIndex = Math.floor(Math.random() * deviceTypes.length);
        const browserIndex = Math.floor(Math.random() * browsers.length);
        const osIndex = Math.floor(Math.random() * operatingSystems.length);

        // Create visitor
        const visitor = visitorRepo.create({
          visitorId: uuidv4(),
          ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          userAgent: `Mozilla/5.0 (compatible; VisitorBot/${Math.random()})`,
          visitorType: isReturning ? VisitorType.RETURNING : VisitorType.NEW,
          visitorSource: this.getRandomVisitorSource(),
          referrerUrl: Math.random() < 0.3 ? 'https://google.com' : null,
          landingPage: samplePages[Math.floor(Math.random() * samplePages.length)].url,
          utmSource: Math.random() < 0.2 ? 'google' : null,
          utmMedium: Math.random() < 0.2 ? 'cpc' : null,
          utmCampaign: Math.random() < 0.15 ? 'spring_sale' : null,
          countryCode: countries[countryIndex],
          city: cities[countryIndex],
          deviceType: deviceTypes[deviceTypeIndex],
          browserName: browsers[browserIndex],
          browserVersion: `${Math.floor(Math.random() * 20) + 80}.0.${Math.floor(Math.random() * 500)}`,
          osName: operatingSystems[osIndex],
          osVersion: `${Math.floor(Math.random() * 5) + 10}.0.0`,
          metadata: {
            screenResolution: `${Math.floor(Math.random() * 1000) + 1000}x${Math.floor(Math.random() * 500) + 600}`,
            timezone: `UTC${Math.random() < 0.5 ? '+' : '-'}${Math.floor(Math.random() * 12) + 1}:00`
          },
          createdAt: new Date(currentDay.getTime() + Math.random() * 24 * 60 * 60 * 1000)
        });

        await visitorRepo.save(visitor);

        // Create 1-3 sessions per visitor
        const sessionCount = Math.floor(Math.random() * 3) + 1;
        for (let s = 0; s < sessionCount; s++) {
          const sessionStartTime = new Date(currentDay.getTime() + Math.random() * 24 * 60 * 60 * 1000);
          const sessionDuration = Math.floor(Math.random() * 1800) + 60; // 1-30 minutes
          const pageViewsCount = Math.floor(Math.random() * 10) + 1;

          const session = sessionRepo.create({
            visitorId: visitor.id,
            sessionId: uuidv4(),
            status: SessionStatus.COMPLETED,
            startTime: sessionStartTime,
            endTime: new Date(sessionStartTime.getTime() + sessionDuration * 1000),
            durationSeconds: sessionDuration,
            pageViewsCount,
            bounceRate: pageViewsCount === 1 ? 100 : 0,
            ipAddress: visitor.ipAddress,
            userAgent: visitor.userAgent,
            deviceType: visitor.deviceType,
            browserName: visitor.browserName,
            browserVersion: visitor.browserVersion,
            osName: visitor.osName,
            osVersion: visitor.osVersion,
            countryCode: visitor.countryCode,
            city: visitor.city,
            createdAt: sessionStartTime
          });

          await sessionRepo.save(session);

          // Create page views for this session
          let currentPageUrl = visitor.landingPage;
          let currentPageTitle = samplePages.find(p => p.url === currentPageUrl)?.title || 'Page';

          for (let pv = 0; pv < pageViewsCount; pv++) {
            const pageViewTime = new Date(sessionStartTime.getTime() + (pv * sessionDuration * 1000) / pageViewsCount);

            // First page view uses the landing page
            if (pv > 0) {
              // Random page for subsequent views
              const randomPage = samplePages[Math.floor(Math.random() * samplePages.length)];
              currentPageUrl = randomPage.url;
              currentPageTitle = randomPage.title;
            }

            const pageView = pageViewRepo.create({
              sessionId: session.id,
              pageUrl: currentPageUrl,
              pageTitle: currentPageTitle,
              pageType: samplePages.find(p => p.url === currentPageUrl)?.type || PageViewType.PAGE_VIEW,
              resourceId: currentPageUrl.includes('/products/') ? currentPageUrl.split('/').pop() : null,
              resourceType: currentPageUrl.includes('/products/') ? 'product' : null,
              referrerUrl: pv > 0 ? samplePages[Math.floor(Math.random() * samplePages.length)].url : visitor.referrerUrl,
              searchQuery: currentPageUrl.includes('/search') ? 'laptop' : null,
              timeOnPageSeconds: Math.floor(sessionDuration / pageViewsCount),
              viewportWidth: deviceTypes[deviceTypeIndex] === 'mobile' ? 375 : (deviceTypes[deviceTypeIndex] === 'tablet' ? 768 : 1920),
              viewportHeight: deviceTypes[deviceTypeIndex] === 'mobile' ? 667 : (deviceTypes[deviceTypeIndex] === 'tablet' ? 1024 : 1080),
              scrollDepthPercent: Math.random() * 100,
              metadata: {
                loadTime: Math.floor(Math.random() * 3000) + 500,
                interactionEvents: Math.floor(Math.random() * 20)
              },
              createdAt: pageViewTime
            });

            await pageViewRepo.save(pageView);
          }
        }
      }
    }

    console.log(`✅ Visitor analytics data seeded successfully!`);
    console.log(`   - ${await visitorRepo.count()} visitors created`);
    console.log(`   - ${await sessionRepo.count()} sessions created`);
    console.log(`   - ${await pageViewRepo.count()} page views created`);
  }

  private getRandomVisitorSource(): VisitorSource {
    const sources = [
      VisitorSource.DIRECT,
      VisitorSource.SEARCH_ENGINE,
      VisitorSource.SOCIAL_MEDIA,
      VisitorSource.REFERRAL,
      VisitorSource.EMAIL,
      VisitorSource.PAID_ADVERTISING,
      VisitorSource.ORGANIC
    ];

    const weights = [0.35, 0.25, 0.15, 0.10, 0.05, 0.05, 0.05]; // Probability weights
    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < sources.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        return sources[i];
      }
    }

    return VisitorSource.DIRECT;
  }

  async clean(): Promise<void> {
    console.log('🧹 Cleaning visitor analytics data...');

    const visitorRepo = this.dataSource.getRepository(Visitor);
    const sessionRepo = this.dataSource.getRepository(VisitorSession);
    const pageViewRepo = this.dataSource.getRepository(PageView);

    await pageViewRepo.clear();
    await sessionRepo.clear();
    await visitorRepo.clear();

    console.log('✅ Visitor analytics data cleaned successfully!');
  }
}