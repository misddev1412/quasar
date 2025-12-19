import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationEventFlow } from '../../modules/notifications/entities/notification-event-flow.entity';
import { NotificationEvent } from '../../modules/notifications/entities/notification-event.enum';
import { NotificationChannel } from '../../modules/notifications/entities/notification-preference.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { UserRole as UserRoleEntity } from '../../modules/user/entities/user-role.entity';
import { UserRole } from '@shared';

interface FlowDefinition {
  eventKey: NotificationEvent;
  displayName: string;
  description: string;
  firebasePath: string;
  template: {
    title: string;
    body: string;
  };
}

@Injectable()
export class NotificationEventFlowSeeder {
  private readonly logger = new Logger(NotificationEventFlowSeeder.name);

  private readonly flowDefinitions: FlowDefinition[] = [
    {
      eventKey: NotificationEvent.ORDER_CREATED,
      displayName: 'Thông báo đơn hàng mới',
      description:
        'Tự động cảnh báo cho đội vận hành khi có đơn hàng mới giúp xử lý kịp thời.',
      firebasePath: '/order-events/created',
      template: {
        title: 'Đơn hàng mới #{{orderCode}}',
        body: 'Khách hàng {{customerName}} vừa đặt đơn trị giá {{orderTotal}}.',
      },
    },
    {
      eventKey: NotificationEvent.ORDER_CONFIRMED,
      displayName: 'Đơn hàng đã xác nhận',
      description: 'Thông báo xác nhận đơn hàng để đội kho chuẩn bị đóng gói.',
      firebasePath: '/order-events/confirmed',
      template: {
        title: 'Đơn hàng #{{orderCode}} đã xác nhận',
        body: 'Đơn của {{customerName}} đã được duyệt và chờ chuẩn bị hàng.',
      },
    },
    {
      eventKey: NotificationEvent.ORDER_SHIPPED,
      displayName: 'Đơn hàng đang giao',
      description: 'Theo dõi hành trình vận đơn khi hàng rời kho.',
      firebasePath: '/order-events/shipped',
      template: {
        title: 'Đơn hàng #{{orderCode}} đã bàn giao vận chuyển',
        body: 'Đơn đang trên đường giao đến khách. Mã vận đơn: {{trackingNumber}}.',
      },
    },
    {
      eventKey: NotificationEvent.ORDER_DELIVERED,
      displayName: 'Đơn hàng giao thành công',
      description: 'Cập nhật cho đội chăm sóc khách hàng khi đơn hoàn tất.',
      firebasePath: '/order-events/delivered',
      template: {
        title: 'Đơn hàng #{{orderCode}} đã giao thành công',
        body: 'Khách {{customerName}} đã nhận hàng. Đánh giá trải nghiệm để cải thiện dịch vụ.',
      },
    },
    {
      eventKey: NotificationEvent.ORDER_CANCELLED,
      displayName: 'Đơn hàng bị hủy',
      description: 'Giúp phát hiện các đơn hủy để phối hợp với đội chăm sóc khách hàng.',
      firebasePath: '/order-events/cancelled',
      template: {
        title: 'Đơn hàng #{{orderCode}} đã bị hủy',
        body: '{{cancelledBy}} vừa hủy đơn. Kiểm tra lý do để hỗ trợ khách kịp thời.',
      },
    },
    {
      eventKey: NotificationEvent.ORDER_REFUNDED,
      displayName: 'Đơn hàng hoàn tiền',
      description: 'Theo dõi các yêu cầu hoàn tiền nhằm xử lý kế toán nhanh chóng.',
      firebasePath: '/order-events/refunded',
      template: {
        title: 'Đơn hàng #{{orderCode}} đã hoàn tiền',
        body: 'Đã hoàn {{refundAmount}} cho khách. Ghi chú: {{refundNote}}.',
      },
    },
  ];

  constructor(
    @InjectRepository(NotificationEventFlow)
    private readonly flowRepository: Repository<NotificationEventFlow>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding notification event flows for order lifecycle...');
    const recipientUserIds = await this.resolveAdminRecipients();

    for (const definition of this.flowDefinitions) {
      await this.upsertFlow(definition, recipientUserIds);
    }

    this.logger.log('Notification event flow seeding completed.');
  }

  private async resolveAdminRecipients(): Promise<string[]> {
    const roles = await this.roleRepository.find({
      where: {
        code: In([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER]),
      },
    });

    if (!roles.length) {
      this.logger.warn('No admin roles found when seeding notification flows.');
      return [];
    }

    const roleIds = roles.map(role => role.id);
    const userRoles = await this.userRoleRepository.find({
      where: {
        roleId: In(roleIds),
        isActive: true,
      },
    });

    const userIds = Array.from(new Set(userRoles.map(userRole => userRole.userId)));
    if (!userIds.length) {
      this.logger.warn('Admin roles exist but no users assigned. Flows will have empty recipients.');
    }

    return userIds;
  }

  private async upsertFlow(definition: FlowDefinition, recipientUserIds: string[]): Promise<void> {
    const existing = await this.flowRepository.findOne({ where: { eventKey: definition.eventKey } });

    const baseData = {
      displayName: definition.displayName,
      description: definition.description,
      channelPreferences: [
        NotificationChannel.IN_APP,
        NotificationChannel.PUSH,
        NotificationChannel.EMAIL,
      ],
      includeActor: false,
      recipientUserIds,
      ccUserIds: [],
      bccUserIds: [],
      ccEmails: [],
      bccEmails: [],
      channelMetadata: {
        firebaseRealtime: {
          enabled: true,
          path: definition.firebasePath,
          template: definition.template,
          tags: ['orders', definition.eventKey],
          priority: 'high',
        },
      } as Record<string, unknown>,
      isActive: true,
    } satisfies Partial<NotificationEventFlow>;

    if (existing) {
      Object.assign(existing, baseData);
      await this.flowRepository.save(existing);
      this.logger.log(`Updated notification flow for event ${definition.eventKey}`);
      return;
    }

    const created = this.flowRepository.create({
      eventKey: definition.eventKey,
      ...baseData,
      mailTemplates: [],
    });

    await this.flowRepository.save(created);
    this.logger.log(`Created notification flow for event ${definition.eventKey}`);
  }
}
