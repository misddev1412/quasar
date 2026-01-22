'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SectionTranslationContent } from './HeroSlider';
import SectionContainer from './SectionContainer';
import Link from 'next/link';

export interface IntroductionStatItem {
    id?: string;
    value: string;
    label: string;
}

export interface IntroductionSectionConfig {
    stats?: IntroductionStatItem[];
    ctaLabel?: string;
    ctaUrl?: string;
    titleColor?: string;
    statsColor?: string;
}

interface IntroductionSectionProps {
    config: IntroductionSectionConfig;
    translation?: SectionTranslationContent | null;
}

const fallbackStats: IntroductionStatItem[] = [
    { id: 'exp', value: '30+', label: 'Năm kinh nghiệm' },
    { id: 'customers', value: '1000+', label: 'Khách hàng' },
    { id: 'delay', value: '24/7', label: 'Hỗ trợ kỹ thuật' },
    { id: 'satisfaction', value: '100%', label: 'Khách hàng hài lòng' },
];

export const IntroductionSection: React.FC<IntroductionSectionProps> = ({ config, translation }) => {
    const { t } = useTranslation();

    const title = translation?.title || t('sections.introduction.title', 'GIỚI THIỆU MGA VIỆT NAM');
    // Use description from translation, fallback to empty if null/undefined
    const description = translation?.description;

    const stats = config.stats || fallbackStats;
    const ctaLabel = config.ctaLabel || t('sections.introduction.cta', 'Tìm hiểu thêm');
    const ctaUrl = config.ctaUrl || '/about';

    return (
        <section className="py-8 lg:py-16">
            <SectionContainer>
                <div className="rounded-xl border border-orange-200 bg-white p-6 shadow-sm lg:p-12">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2
                            className="text-2xl font-bold uppercase text-orange-500 lg:text-3xl"
                            style={{ color: config.titleColor }}
                        >
                            {title}
                        </h2>
                    </div>

                    {/* Description Content */}
                    <div className="prose mx-auto mb-12 max-w-5xl text-justify text-gray-700 lg:text-center">
                        {description ? (
                            <div dangerouslySetInnerHTML={{ __html: description }} />
                        ) : (
                            <p>
                                Mgavietnam – Đơn vị chuyên cung cấp các dòng xe nâng điện, xe nâng dầu, xe nâng tay điện, xe nâng tay thấp, xe nâng tay cao với chất lượng và dịch vụ tốt nhất.
                                <br /><br />
                                Công ty Cổ Phần Xe Nâng MGA là đơn vị tiên phong trong ngành xe nâng tại Việt Nam, với hơn 25 năm kinh nghiệm cung cấp giải pháp nâng hạ toàn diện. Là đại diện ủy quyền của MGA Forklift INC. (USA) và đối tác của ISUZU (Nhật Bản), chúng tôi mang đến các dòng xe nâng dầu, xe nâng điện, xe nâng tay, cùng dịch vụ cho thuê, sửa chữa, bảo trì và phụ tùng chính hãng. Sản phẩm của MGA được trang bị động cơ ISUZU nhập khẩu từ Mỹ và Nhật, đảm bảo hiệu suất bền bỉ – tiết kiệm nhiên liệu – tối ưu vận hành. Với hệ thống chi nhánh trên toàn quốc và đội ngũ kỹ thuật viên chuyên sâu, MGA cam kết chất lượng vượt trội, dịch vụ tận tâm, đồng hành cùng sự phát triển bền vững của doanh nghiệp.
                            </p>
                        )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4 mb-12">
                        {stats.map((stat, index) => (
                            <div key={stat.id || index} className="flex flex-col items-center">
                                <span
                                    className="text-3xl font-bold text-orange-400 lg:text-4xl"
                                    style={{ color: config.statsColor }}
                                >
                                    {stat.value}
                                </span>
                                <span className="mt-2 text-sm text-gray-600 lg:text-base">
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <Link
                            href={ctaUrl}
                            className="rounded-md bg-blue-700 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {ctaLabel}
                        </Link>
                    </div>
                </div>
            </SectionContainer>
        </section>
    );
};
