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
    const updateData = {
      ...updateUserDto,
      ...(updateUserDto.role && { role: updateUserDto.role as UserRole })
    };
    
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
} 