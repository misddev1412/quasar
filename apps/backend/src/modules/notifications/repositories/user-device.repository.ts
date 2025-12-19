import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDeviceEntity } from '../entities/user-device.entity';

@Injectable()
export class UserDeviceRepository {
    constructor(
        @InjectRepository(UserDeviceEntity)
        private readonly repository: Repository<UserDeviceEntity>,
    ) { }

    async createOrUpdate(
        userId: string,
        token: string,
        deviceInfo?: Partial<UserDeviceEntity>,
    ): Promise<UserDeviceEntity> {
        let device = await this.repository.findOne({
            where: { userId, token },
        });

        if (device) {
            Object.assign(device, {
                ...deviceInfo,
                lastActiveAt: new Date(),
            });
        } else {
            device = this.repository.create({
                userId,
                token,
                ...deviceInfo,
                lastActiveAt: new Date(),
            });
        }

        return this.repository.save(device);
    }

    async findByUserId(userId: string): Promise<UserDeviceEntity[]> {
        return this.repository.find({
            where: { userId },
            order: { lastActiveAt: 'DESC' },
        });
    }

    async removeByToken(token: string): Promise<void> {
        await this.repository.delete({ token });
    }

    async removeByUserAndToken(userId: string, token: string): Promise<void> {
        await this.repository.delete({ userId, token });
    }

    async updateLastActive(userId: string, token: string): Promise<void> {
        await this.repository.update(
            { userId, token },
            { lastActiveAt: new Date() }
        );
    }
}
