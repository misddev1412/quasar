import React from 'react';
import { SectionTranslation } from '../../types/sections';
import { SectionContainer } from './SectionContainer';

export interface TeamConfig { }

interface TeamSectionProps {
    config: TeamConfig;
    translation?: SectionTranslation;
}

export const TeamSection: React.FC<TeamSectionProps> = ({
    config,
    translation,
}) => {
    return (
        <SectionContainer>
            <div className="py-12 text-center">
                <h2 className="text-2xl font-bold">{translation?.title || 'Team Section'}</h2>
                <p className="text-gray-500">Coming Soon</p>
            </div>
        </SectionContainer>
    );
};
