import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository, UserRole } from '@shared';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserProfileDto
} from '../interfaces/user-repository.interface';

export interface UserFilters {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {
    super(userRepository);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, phoneNumber, role, ...userData } = createUserDto;
    
    // Create user first
    const userToCreate = {
      ...userData,
      role: role ? (role as UserRole) : UserRole.USER
    };
    
    const user = this.repository.create(userToCreate);
    const savedUser = await this.repository.save(user);
    
    // Create profile
    const profile = this.userProfileRepository.create({
      userId: savedUser.id,
      firstName,
      lastName,
      phoneNumber,
    });
    await this.userProfileRepository.save(profile);
    
    return savedUser;
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      relations: ['profile']
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { username }
    });
  }

  async findWithProfile(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['profile']
    });
  }

  async findWithRoles(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role']
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    // Only map fields that actually exist on the User entity
    const updateData: Partial<User> = {};

    if (typeof updateUserDto.email !== 'undefined') {
      updateData.email = updateUserDto.email as any;
    }
    if (typeof updateUserDto.username !== 'undefined') {
      updateData.username = updateUserDto.username as any;
    }
    if (typeof updateUserDto.isActive !== 'undefined') {
      updateData.isActive = updateUserDto.isActive as any;
    }

    // NOTE: 'role' is managed via separate role entities. Ignore direct updates here for now.

    // If there's nothing to update, just return current user to avoid empty UPDATE
    if (Object.keys(updateData).length === 0) {
      return this.findById(id);
    }

    return super.update(id, updateData);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateUserProfileDto): Promise<UserProfile | null> {
    const profile = await this.userProfileRepository.findOne({
      where: { userId }
    });

    if (!profile) {
      return null;
    }

    await this.userProfileRepository.update(profile.id, updateProfileDto);
    return await this.userProfileRepository.findOne({
      where: { userId }
    });
  }

  async findUsersWithFilters(filters: UserFilters): Promise<PaginatedUsers> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile');

    // Apply search filter
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.email) LIKE :search OR LOWER(user.username) LIKE :search OR LOWER(profile.firstName) LIKE :search OR LOWER(profile.lastName) LIKE :search)',
        { search: searchTerm }
      );
    }

    // Apply role filter (when role system is implemented)
    // if (filters.role) {
    //   queryBuilder.andWhere('user.role = :role', { role: filters.role });
    // }

    // Apply isActive filter
    if (filters.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    // Apply pagination
    const skip = (filters.page - 1) * filters.limit;
    queryBuilder
      .skip(skip)
      .take(filters.limit)
      .orderBy('user.createdAt', 'DESC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Get paginated results
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / filters.limit);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  async findByIds(userIds: string[]): Promise<User[]> {
    if (userIds.length === 0) return [];
    
    return await this.repository.findBy({
      id: userIds as any
    });
  }

  async findByIdWithRoles(id: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role']
    });
  }

  async findUsersNotInRole(roleId: string, filters: { page: number; limit: number; search?: string }): Promise<PaginatedUsers> {
    const queryBuilder = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoin('user.userRoles', 'userRole', 'userRole.roleId = :roleId AND userRole.isActive = true', { roleId })
      .where('userRole.id IS NULL')
      .andWhere('user.isActive = true');

    // Apply search filter
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(user.email) LIKE :search OR LOWER(user.username) LIKE :search OR LOWER(profile.firstName) LIKE :search OR LOWER(profile.lastName) LIKE :search)',
        { search: searchTerm }
      );
    }

    // Apply pagination
    const skip = (filters.page - 1) * filters.limit;
    queryBuilder
      .skip(skip)
      .take(filters.limit)
      .orderBy('user.createdAt', 'DESC');

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Get paginated results
    const items = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / filters.limit);

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    };
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    // This method assumes you have a UserRole junction table
    // You'll need to implement this based on your database schema
    // For now, I'll add a basic implementation that should be adjusted based on your schema
    
    const userRoleRepository = this.repository.manager.getRepository('UserRole');
    
    // Check if association already exists
    const existing = await userRoleRepository.findOne({
      where: { userId, roleId }
    });
    
    if (!existing) {
      await userRoleRepository.save({
        userId,
        roleId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else if (!existing.isActive) {
      // Reactivate if it was previously deactivated
      await userRoleRepository.update(existing.id, {
        isActive: true,
        updatedAt: new Date()
      });
    }
  }

  async getUserCountByRole(roleId: string): Promise<number> {
    const userRoleRepository = this.repository.manager.getRepository('UserRole');
    
    const count = await userRoleRepository.count({
      where: { 
        roleId,
        isActive: true
      }
    });
    
    return count;
  }
}