import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { 
  IUserRepository, 
  CreateUserDto, 
  UpdateUserDto, 
  UpdateUserProfileDto 
} from '../interfaces/user-repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, phoneNumber, role, ...userData } = createUserDto;
    
    // Create user first
    const userToCreate = {
      ...userData,
      role: role ? (role as UserRole) : UserRole.USER
    };
    
    const user = this.userRepository.create(userToCreate);
    const savedUser = await this.userRepository.save(user);
    
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
    return await this.userRepository.find({
      relations: ['profile']
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id }
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email }
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username }
    });
  }

  async findWithProfile(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['profile']
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const updateData = {
      ...updateUserDto,
      ...(updateUserDto.role && { role: updateUserDto.role as UserRole })
    };
    
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
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

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }
} 