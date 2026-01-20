import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SeederModule } from './seeder.module';
import { Service } from '../../modules/services/entities/service.entity';
import { ServiceTranslation } from '../../modules/services/entities/service-translation.entity';
import { ServiceItem } from '../../modules/services/entities/service-item.entity';
import { ServiceItemTranslation } from '../../modules/services/entities/service-item-translation.entity';

@Injectable()
export class ServicesSeeder implements SeederModule {
    constructor(private readonly dataSource: DataSource) { }

    async seed(): Promise<void> {
        const serviceRepository = this.dataSource.getRepository(Service);
        // Determine if we need to check existence. For simplicity, we can check by a unique field or just count.
        const count = await serviceRepository.count();
        if (count > 0) {
            console.log('Services already seeded based on count.');
            return;
        }

        // Define sample services
        const services = [
            {
                unitPrice: 500000,
                isContactPrice: false,
                thumbnail: 'https://images.unsplash.com/photo-1581092921461-eab62e97a783?auto=format&fit=crop&w=800&q=80',
                isActive: true,
                translations: [
                    {
                        locale: 'en',
                        name: 'Standard Maintenance',
                        content: 'Routine check-up and basic maintenance for your equipment.',
                        description: 'Ensure your systems run smoothly with our standard maintenance package.',
                    },
                    {
                        locale: 'vi',
                        name: 'Bảo trì tiêu chuẩn',
                        content: 'Kiểm tra định kỳ và bảo trì cơ bản cho thiết bị của bạn.',
                        description: 'Đảm bảo hệ thống vận hành trơn tru với gói bảo trì tiêu chuẩn.',
                    },
                ],
                items: [
                    {
                        price: 200000,
                        sortOrder: 1,
                        translations: [
                            { locale: 'en', name: 'Inspection', description: 'Visual inspection of all key components.' },
                            { locale: 'vi', name: 'Kiểm tra', description: 'Kiểm tra trực quan tất cả các thành phần chính.' },
                        ],
                    },
                    {
                        price: 300000,
                        sortOrder: 2,
                        translations: [
                            { locale: 'en', name: 'Cleaning', description: 'Deep cleaning of filters and specific parts.' },
                            { locale: 'vi', name: 'Vệ sinh', description: 'Vệ sinh sâu các bộ lọc và các bộ phận cụ thể.' },
                        ],
                    },
                ],
            },
            {
                unitPrice: 0,
                isContactPrice: true,
                thumbnail: 'https://images.unsplash.com/photo-1521791136064-7985ccfd11f9?auto=format&fit=crop&w=800&q=80',
                isActive: true,
                translations: [
                    {
                        locale: 'en',
                        name: 'Custom Installation',
                        content: 'Full service installation tailored to your specific needs.',
                        description: 'Get a quote for a complete installation solution designed for your space.',
                    },
                    {
                        locale: 'vi',
                        name: 'Lắp đặt tùy chỉnh',
                        content: 'Dịch vụ lắp đặt trọn gói phù hợp với nhu cầu cụ thể của bạn.',
                        description: 'Nhận báo giá cho giải pháp lắp đặt hoàn chỉnh được thiết kế cho không gian của bạn.',
                    },
                ],
                items: [],
            },
            {
                unitPrice: 1500000,
                isContactPrice: false,
                thumbnail: 'https://images.unsplash.com/photo-1504384308090-c54be3855485?auto=format&fit=crop&w=800&q=80',
                isActive: true,
                translations: [
                    {
                        locale: 'en',
                        name: 'Emergency Repair',
                        content: '24/7 emergency repair service for critical failures.',
                        description: 'Rapid response team ready to fix your urgent issues immediately.',
                    },
                    {
                        locale: 'vi',
                        name: 'Sửa chữa khẩn cấp',
                        content: 'Dịch vụ sửa chữa khẩn cấp 24/7 cho các sự cố nghiêm trọng.',
                        description: 'Đội ngũ phản ứng nhanh sẵn sàng khắc phục các vấn đề cấp bách của bạn ngay lập tức.',
                    },
                ],
                items: [
                    {
                        price: 500000,
                        sortOrder: 1,
                        translations: [
                            { locale: 'en', name: 'Diagnostic Fee', description: 'Initial assessment of the problem.' },
                            { locale: 'vi', name: 'Phí chẩn đoán', description: 'Đánh giá ban đầu về vấn đề.' },
                        ],
                    },
                ],
            },
        ];

        // Seed data
        await this.dataSource.transaction(async (manager) => {
            for (const serviceData of services) {
                const { translations, items, ...stats } = serviceData;

                // Create service
                const service = manager.create(Service, stats);
                const savedService = await manager.save(service);

                // Create translations
                if (translations) {
                    const transEntities = translations.map(t => manager.create(ServiceTranslation, { ...t, service: savedService }));
                    await manager.save(transEntities);
                }

                // Create items
                if (items) {
                    for (const itemData of items) {
                        const { translations: itemTranslations, ...itemStats } = itemData;
                        const item = manager.create(ServiceItem, { ...itemStats, service: savedService });
                        const savedItem = await manager.save(item);

                        if (itemTranslations) {
                            const itemTransEntities = itemTranslations.map(t => manager.create(ServiceItemTranslation, { ...t, serviceItem: savedItem }));
                            await manager.save(itemTransEntities);
                        }
                    }
                }
            }
        });

        console.log(`Seeded ${services.length} services.`);
    }
}
