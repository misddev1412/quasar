import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { UserRole as UserRoleEnum } from '@shared';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  /**
   * Assign default role to user (typically 'user' role)
   */
  async assignDefaultRole(userId: string): Promise<void> {
    try {
      // Find the default user role
      const userRole = await this.roleRepository.findOne({
        where: { code: UserRoleEnum.USER, isActive: true }
      });

      if (!userRole) {
        console.warn('Default user role not found');
        return;
      }

      // Check if user already has this role
      const existingUserRole = await this.userRoleRepository.findOne({
        where: { userId, roleId: userRole.id }
      });

      if (!existingUserRole) {
        // Assign the default role
        const newUserRole = this.userRoleRepository.create({
          userId,
          roleId: userRole.id,
          isActive: true,
          assignedAt: new Date(),
          assignedBy: userId, // Self-assigned for Firebase users
        });

        await this.userRoleRepository.save(newUserRole);
        console.log(`Assigned default role '${userRole.code}' to user ${userId}`);
      }
    } catch (error) {
      console.error('Error assigning default role:', error);
    }
  }

  /**
   * Find user by ID with roles
   */
  async findUserWithRoles(userId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['userRoles', 'userRoles.role', 'loginProviders']
    });
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role', 'loginProviders']
    });
  }

  /**
   * Find user by Firebase UID
   */
  async findUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { firebaseUid },
      relations: ['userRoles', 'userRoles.role', 'loginProviders']
    });
  }
}