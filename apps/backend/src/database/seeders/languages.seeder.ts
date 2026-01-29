import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../modules/language/entities/language.entity';

@Injectable()
export class LanguagesSeeder {
    private readonly logger = new Logger(LanguagesSeeder.name);

    constructor(
        @InjectRepository(Language)
        private readonly languageRepository: Repository<Language>,
    ) { }

    private readonly languages = [
        { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', icon: '🇻🇳', isActive: true, isDefault: true, sortOrder: 1 },
        { code: 'en', name: 'English', nativeName: 'English', icon: '🇺🇸', isActive: true, isDefault: false, sortOrder: 2 },
        { code: 'zh', name: 'Chinese', nativeName: '中文', icon: '🇨🇳', isActive: true, isDefault: false, sortOrder: 3 },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', icon: '🇯🇵', isActive: true, isDefault: false, sortOrder: 4 },
        { code: 'ko', name: 'Korean', nativeName: '한국어', icon: '🇰🇷', isActive: true, isDefault: false, sortOrder: 5 },
        { code: 'fr', name: 'French', nativeName: 'Français', icon: '🇫🇷', isActive: true, isDefault: false, sortOrder: 6 },
        { code: 'de', name: 'German', nativeName: 'Deutsch', icon: '🇩🇪', isActive: true, isDefault: false, sortOrder: 7 },
        { code: 'es', name: 'Spanish', nativeName: 'Español', icon: '🇪🇸', isActive: true, isDefault: false, sortOrder: 8 },
        { code: 'th', name: 'Thai', nativeName: 'ไทย', icon: '🇹🇭', isActive: true, isDefault: false, sortOrder: 9 },
    ];

    async seed(): Promise<void> {
        this.logger.log('Seeding languages...');

        for (const langData of this.languages) {
            const existing = await this.languageRepository.findOne({
                where: { code: langData.code },
            });

            if (!existing) {
                const language = this.languageRepository.create(langData);
                await this.languageRepository.save(language);
                this.logger.log(`Created language: ${langData.name}`);
            } else {
                // Optional: Update existing if needed, or just skip
                // For now, we only ensure they exist.
                // If 'Vi' exists but is missing icon, we could update it?
                // Let's just log skipping.
                this.logger.log(`Skipped existing language: ${langData.name}`);
            }
        }

        this.logger.log('Languages seeded successfully.');
    }
}
