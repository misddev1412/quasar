import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { UserLoginProvider, AuthProvider } from '../entities/user-login-provider.entity';
import { UserService } from './user.service';
import { ResponseService } from '../../shared/services/response.service';
import { FirebaseAuthService as FirebaseService } from '../../firebase/services/firebase-auth.service';

export interface FirebaseLoginDto {
  firebaseIdToken: string;
}

export interface DecodedFirebaseToken {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified: boolean;
  firebase: {
    sign_in_provider: string;
    identities?: {
      [key: string]: any;
    };
  };
}

@Injectable()
export class FirebaseAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLoginProvider)
    private readonly loginProviderRepository: Repository<UserLoginProvider>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Authenticate user with Firebase ID token
   */
  async authenticateWithFirebase(dto: { firebaseIdToken: string }) {
    try {
      // Verify Firebase ID token
      const decodedToken = await this.verifyFirebaseToken(dto.firebaseIdToken);
      
      // Find or create user
      let user = await this.findUserByFirebaseUid(decodedToken.uid);
      
      if (!user) {
        // Check if user exists with same email
        user = await this.userRepository.findOne({ 
          where: { email: decodedToken.email },
          relations: ['loginProviders', 'userRoles', 'userRoles.role']
        });

        if (user) {
          // Link Firebase to existing user
          await this.linkFirebaseToUser(user, decodedToken);
        } else {
          // Create new user with Firebase
          user = await this.createUserFromFirebase(decodedToken);
        }
      } else {
        // Update existing Firebase user
        await this.updateFirebaseUser(user, decodedToken);
      }

      // Update login tracking
      await this.trackUserLogin(user, decodedToken.firebase.sign_in_provider);

      // Generate JWT tokens
      const tokens = await this.generateAuthTokens(user);

      return this.responseService.createTrpcResponse(
        200,
        'Firebase authentication successful',
        {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            avatarUrl: user.avatarUrl,
            provider: user.provider,
            emailVerified: user.emailVerified,
            lastLoginAt: user.lastLoginAt,
          },
          ...tokens
        }
      );
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        throw new UnauthorizedException('Firebase token has expired');
      }
      if (error.code === 'auth/invalid-id-token') {
        throw new UnauthorizedException('Invalid Firebase token');
      }
      
      console.error('Firebase authentication error:', error);
      throw new BadRequestException('Firebase authentication failed: ' + error.message);
    }
  }

  /**
   * Verify Firebase ID token using Admin SDK
   */
  private async verifyFirebaseToken(idToken: string): Promise<DecodedFirebaseToken> {
    try {
      const decodedToken = await this.firebaseService.verifyIdToken(idToken);
      return decodedToken as DecodedFirebaseToken;
    } catch (error) {
      console.error('Firebase token verification failed:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  /**
   * Find user by Firebase UID
   */
  private async findUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { firebaseUid },
      relations: ['loginProviders', 'userRoles', 'userRoles.role']
    });
  }

  /**
   * Create new user from Firebase data
   */
  private async createUserFromFirebase(decodedToken: DecodedFirebaseToken): Promise<User> {
    const provider = this.mapFirebaseProviderToAuthProvider(decodedToken.firebase.sign_in_provider);
    
    // Generate username from email or use Firebase UID
    const baseUsername = decodedToken.email?.split('@')[0] || `user_${decodedToken.uid.substring(0, 8)}`;
    const username = await this.generateUniqueUsername(baseUsername);

    const user = this.userRepository.create({
      email: decodedToken.email,
      username,
      // Use a placeholder password for Firebase users since DB column is NOT NULL
      // This will be skipped during password hashing due to the Firebase provider
      password: `firebase_user_${decodedToken.uid}`,
      firebaseUid: decodedToken.uid,
      provider,
      providerId: decodedToken.uid,
      avatarUrl: decodedToken.picture,
      emailVerified: decodedToken.email_verified,
      isActive: true,
      lastLoginAt: new Date(),
      loginCount: 1,
    });

    const savedUser = await this.userRepository.save(user);

    // Create login provider record
    await this.createLoginProviderRecord(savedUser, decodedToken);

    // Assign default role
    await this.userService.assignDefaultRole(savedUser.id);

    return savedUser;
  }

  /**
   * Link Firebase to existing user
   */
  private async linkFirebaseToUser(user: User, decodedToken: DecodedFirebaseToken): Promise<void> {
    user.firebaseUid = decodedToken.uid;
    if (!user.avatarUrl && decodedToken.picture) {
      user.avatarUrl = decodedToken.picture;
    }
    if (decodedToken.email_verified) {
      user.emailVerified = true;
    }

    await this.userRepository.save(user);
    await this.createLoginProviderRecord(user, decodedToken);
  }

  /**
   * Update existing Firebase user
   */
  private async updateFirebaseUser(user: User, decodedToken: DecodedFirebaseToken): Promise<void> {
    let updated = false;

    // Update avatar if not set
    if (!user.avatarUrl && decodedToken.picture) {
      user.avatarUrl = decodedToken.picture;
      updated = true;
    }

    // Update email verification status
    if (decodedToken.email_verified && !user.emailVerified) {
      user.emailVerified = true;
      updated = true;
    }

    if (updated) {
      await this.userRepository.save(user);
    }

    // Update login provider record
    await this.updateLoginProviderRecord(user, decodedToken);
  }

  /**
   * Create login provider record
   */
  private async createLoginProviderRecord(user: User, decodedToken: DecodedFirebaseToken): Promise<void> {
    const provider = this.mapFirebaseProviderToAuthProvider(decodedToken.firebase.sign_in_provider);
    
    const existingProvider = await this.loginProviderRepository.findOne({
      where: {
        userId: user.id,
        provider,
        providerId: decodedToken.uid
      }
    });

    if (!existingProvider) {
      const loginProvider = this.loginProviderRepository.create({
        userId: user.id,
        provider,
        providerId: decodedToken.uid,
        providerEmail: decodedToken.email,
        providerData: {
          name: decodedToken.name,
          picture: decodedToken.picture,
          email_verified: decodedToken.email_verified,
          sign_in_provider: decodedToken.firebase.sign_in_provider,
        } as any,
        isVerified: decodedToken.email_verified,
        lastUsedAt: new Date(),
      });

      await this.loginProviderRepository.save(loginProvider);
    }
  }

  /**
   * Update login provider record
   */
  private async updateLoginProviderRecord(user: User, decodedToken: DecodedFirebaseToken): Promise<void> {
    const provider = this.mapFirebaseProviderToAuthProvider(decodedToken.firebase.sign_in_provider);
    
    await this.loginProviderRepository.update(
      {
        userId: user.id,
        provider,
        providerId: decodedToken.uid
      },
      {
        lastUsedAt: new Date(),
        isVerified: decodedToken.email_verified,
        providerData: {
          name: decodedToken.name,
          picture: decodedToken.picture,
          email_verified: decodedToken.email_verified,
          sign_in_provider: decodedToken.firebase.sign_in_provider,
        } as any
      }
    );
  }

  /**
   * Track user login
   */
  private async trackUserLogin(user: User, signInProvider: string): Promise<void> {
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
      loginCount: () => 'login_count + 1'
    });
  }

  /**
   * Generate unique username
   */
  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername;
    let counter = 1;

    while (await this.userRepository.findOne({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }

  /**
   * Map Firebase sign-in provider to our AuthProvider enum
   */
  private mapFirebaseProviderToAuthProvider(firebaseProvider: string): AuthProvider {
    switch (firebaseProvider) {
      case 'google.com':
        return AuthProvider.GOOGLE;
      case 'facebook.com':
        return AuthProvider.FACEBOOK;
      case 'twitter.com':
        return AuthProvider.TWITTER;
      case 'github.com':
        return AuthProvider.GITHUB;
      case 'password':
        return AuthProvider.EMAIL;
      default:
        return AuthProvider.FIREBASE;
    }
  }

  /**
   * Generate JWT tokens for authenticated user
   */
  private async generateAuthTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.userRoles?.[0]?.role?.code || 'user',
      isActive: user.isActive,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }
}