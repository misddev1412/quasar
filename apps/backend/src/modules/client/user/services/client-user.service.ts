import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../user/repositories/user.repository';
import { AuthService } from '../../../../auth/auth.service';
import { User, UserRole } from '../../../user/entities/user.entity';
import { 
  ClientRegisterDto, 
  ClientLoginDto, 
  ClientUpdateProfileDto,
  ClientUserResponseDto,
  ClientAuthResponseDto
} from '../dto/client-user.dto';

@Injectable()
export class ClientUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async register(registerDto: ClientRegisterDto): Promise<ClientAuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.authService.hashPassword(registerDto.password);
    
    const userData = {
      ...registerDto,
      password: hashedPassword,
      role: UserRole.USER, // Client users are always regular users
    };

    const user = await this.userRepository.create(userData);
    const userWithProfile = await this.userRepository.findWithProfile(user.id);
    const tokens = await this.authService.login(user);
    
    return {
      user: this.toClientUserResponse(userWithProfile || user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async login(loginDto: ClientLoginDto): Promise<ClientAuthResponseDto> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const userWithProfile = await this.userRepository.findWithProfile(user.id);
    const tokens = await this.authService.login(user);
    
    return {
      user: this.toClientUserResponse(userWithProfile || user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async getProfile(userId: string): Promise<ClientUserResponseDto> {
    const user = await this.userRepository.findWithProfile(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toClientUserResponse(user);
  }

  async updateProfile(userId: string, updateProfileDto: ClientUpdateProfileDto): Promise<ClientUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Convert string dateOfBirth to Date if provided
    const profileData = {
      ...updateProfileDto,
      dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
    };

    // Update the user profile using the profile update method
    const updatedProfile = await this.userRepository.updateProfile(userId, profileData);
    if (!updatedProfile) {
      throw new NotFoundException('User profile not found');
    }
    
    // Get the updated user with profile
    const userWithProfile = await this.userRepository.findWithProfile(userId);
    return this.toClientUserResponse(userWithProfile || user);
  }

  async refreshToken(refreshToken: string): Promise<ClientAuthResponseDto> {
    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      const payload = await this.authService.verifyToken(tokens.accessToken);
      
      const user = await this.userRepository.findWithProfile(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        user: this.toClientUserResponse(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private toClientUserResponse(user: User): ClientUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile ? {
        id: user.profile.id,
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        phoneNumber: user.profile.phoneNumber,
        dateOfBirth: user.profile.dateOfBirth,
        avatar: user.profile.avatar,
        bio: user.profile.bio,
        address: user.profile.address,
        city: user.profile.city,
        country: user.profile.country,
        postalCode: user.profile.postalCode,
      } : undefined,
    };
  }
} 