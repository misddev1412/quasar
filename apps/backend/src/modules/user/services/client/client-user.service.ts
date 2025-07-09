import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repositories/user.repository';
import { AuthService } from '../../../../auth/auth.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { User } from '../../entities/user.entity';
import { UserRole } from '@shared';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { 
  ClientRegisterDto, 
  ClientLoginDto, 
  ClientUpdateProfileDto,
  ClientUserResponseDto,
  ClientAuthResponseDto
} from '../../dto/client/client-user.dto';

@Injectable()
export class ClientUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly responseHandler: ResponseService,
  ) {}

  async register(registerDto: ClientRegisterDto): Promise<ClientAuthResponseDto> {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw this.responseHandler.createConflictError(
        null, // moduleCode not needed
        null, // operationCode not needed
        'User with this email already exists'
      );
    }

    try {
      const hashedPassword = await this.authService.hashPassword(registerDto.password);
      
      const userData = {
        ...registerDto,
        password: hashedPassword,
        role: UserRole.USER, // Client users are always regular users
      };

      const user = await this.userRepository.createUser(userData);
      const userWithProfile = await this.userRepository.findWithProfile(user.id);
      const tokens = await this.authService.login(user);
      
      return {
        user: this.toClientUserResponse(userWithProfile || user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createDatabaseError(
        null, // moduleCode not needed
        null, // operationCode not needed
        error as Error
      );
    }
  }

  async login(loginDto: ClientLoginDto): Promise<ClientAuthResponseDto> {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw this.responseHandler.createUnauthorizedError(
        null, // moduleCode not needed
        null  // operationCode not needed
      );
    }

    if (!user.isActive) {
      throw this.responseHandler.createTRPCErrorWithCodes(
        null, // moduleCode not needed
        null, // operationCode not needed
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        'Account is inactive'
      );
    }

    try {
      const userWithProfile = await this.userRepository.findWithProfile(user.id);
      const tokens = await this.authService.login(user);
      
      return {
        user: this.toClientUserResponse(userWithProfile || user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createDatabaseError(
        null, // moduleCode not needed
        null, // operationCode not needed
        error as Error
      );
    }
  }

  async getProfile(userId: string): Promise<ClientUserResponseDto> {
    const user = await this.userRepository.findWithProfile(userId);
    if (!user) {
      throw this.responseHandler.createNotFoundError(
        null, // moduleCode not needed
        null, // operationCode not needed
        'User'
      );
    }
    return this.toClientUserResponse(user);
  }

  async updateProfile(userId: string, updateProfileDto: ClientUpdateProfileDto): Promise<ClientUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw this.responseHandler.createNotFoundError(
        null, // moduleCode not needed
        null, // operationCode not needed
        'User'
      );
    }

    try {
      // Convert string dateOfBirth to Date if provided
      const profileData = {
        ...updateProfileDto,
        dateOfBirth: updateProfileDto.dateOfBirth ? new Date(updateProfileDto.dateOfBirth) : undefined,
      };

      // Update the user profile using the profile update method
      const updatedProfile = await this.userRepository.updateProfile(userId, profileData);
      if (!updatedProfile) {
        throw this.responseHandler.createNotFoundError(
          null, // moduleCode not needed
          null, // operationCode not needed
          'User profile'
        );
      }
      
      // Get the updated user with profile
      const userWithProfile = await this.userRepository.findWithProfile(userId);
      return this.toClientUserResponse(userWithProfile || user);
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createDatabaseError(
        null, // moduleCode not needed
        null, // operationCode not needed
        error as Error
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<ClientAuthResponseDto> {
    try {
      const tokens = await this.authService.refreshToken(refreshToken);
      const payload = await this.authService.verifyToken(tokens.accessToken);
      
      const user = await this.userRepository.findWithProfile(payload.sub);
      if (!user) {
        throw this.responseHandler.createNotFoundError(
          null, // moduleCode not needed
          null, // operationCode not needed
          'User'
        );
      }

      return {
        user: this.toClientUserResponse(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error.code && error.code.includes('10')) {
        throw error; // Re-throw our structured errors
      }
      throw this.responseHandler.createTRPCErrorWithCodes(
        null, // moduleCode not needed
        null, // operationCode not needed
        ErrorLevelCode.TOKEN_ERROR,
        'Invalid refresh token'
      );
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