import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { UserDeviceRepository } from '../repositories/user-device.repository';
import { FirebaseMessagingService } from './firebase-messaging.service';
import { NotificationPreferenceService } from './notification-preference.service';
import { NotificationChannelConfigService } from './notification-channel-config.service';
import { FirebaseRealtimeDatabaseService } from '../../firebase/services/firebase-realtime.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let userDeviceRepository: Partial<UserDeviceRepository>;
    let firebaseMessagingService: Partial<FirebaseMessagingService>;

    beforeEach(async () => {
        userDeviceRepository = {
            createOrUpdate: jest.fn(),
            removeByToken: jest.fn(),
            removeByUserAndToken: jest.fn(),
        };

        firebaseMessagingService = {
            validateToken: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: NotificationRepository,
                    useValue: {},
                },
                {
                    provide: UserDeviceRepository,
                    useValue: userDeviceRepository,
                },
                {
                    provide: FirebaseMessagingService,
                    useValue: firebaseMessagingService,
                },
                {
                    provide: NotificationPreferenceService,
                    useValue: {},
                },
                {
                    provide: NotificationChannelConfigService,
                    useValue: {},
                },
                {
                    provide: FirebaseRealtimeDatabaseService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerFCMToken', () => {
        it('should register a valid token', async () => {
            (firebaseMessagingService.validateToken as jest.Mock).mockResolvedValue(true);

            const userId = 'user-1';
            const token = 'valid-token';
            const deviceInfo = { platform: 'android' };

            await service.registerFCMToken(userId, token, deviceInfo);

            expect(firebaseMessagingService.validateToken).toHaveBeenCalledWith(token);
            expect(userDeviceRepository.createOrUpdate).toHaveBeenCalledWith(userId, token, deviceInfo);
        });

        it('should throw error for invalid token', async () => {
            (firebaseMessagingService.validateToken as jest.Mock).mockResolvedValue(false);

            const userId = 'user-1';
            const token = 'invalid-token';

            await expect(service.registerFCMToken(userId, token)).rejects.toThrow('Invalid FCM token');
            expect(userDeviceRepository.removeByToken).toHaveBeenCalledWith(token);
            expect(userDeviceRepository.createOrUpdate).not.toHaveBeenCalled();
        });
    });
});
