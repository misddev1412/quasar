import React from 'react';
import { Modal } from '../common/Modal';
import { CreateSettingForm } from './CreateSettingForm';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

interface CreateSettingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CreateSettingModal: React.FC<CreateSettingModalProps> = ({
    isOpen,
    onClose,
}) => {
    const { t } = useTranslationWithBackend();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="sm"
        >
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t('settings.create_new_setting', 'Create New Setting')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {t('settings.create_setting_desc', 'Add a new configuration setting to the system.')}
                    </p>
                </div>
                <CreateSettingForm onClose={onClose} />
            </div>
        </Modal>
    );
};
