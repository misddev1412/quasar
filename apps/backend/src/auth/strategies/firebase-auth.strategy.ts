import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { FirebaseAuthService } from '../../modules/firebase/services/firebase-auth.service';
import { UserRepository } from '../../modules/user/repositories/user.repository';
import { User } from '../../modules/user/entities/user.entity';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(Strategy, 'firebase') {
  constructor(
    private firebaseAuthService: FirebaseAuthService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'firebase', // This won't be used as we verify with Firebase
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any): Promise<User> {
    try {
      // Extract Firebase ID token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        throw new UnauthorizedException('No authorization header');
      }

      const idToken = authHeader.replace('Bearer ', '');
      
      // Verify the Firebase ID token
      const firebaseUser = await this.firebaseAuthService.verifyIdToken(idToken);
      
      if (!firebaseUser.email) {
        throw new UnauthorizedException('Email not found in Firebase token');
      }

      // Find or create user in local database
      let user = await this.userRepository.findByEmail(firebaseUser.email);
      
      if (!user) {
        // Create new user from Firebase data
        user = await this.userRepository.createUser({
          email: firebaseUser.email,
          username: firebaseUser.email.split('@')[0],
          password: '', // No password for Firebase users
          firstName: firebaseUser.name?.split(' ')[0] || '',
          lastName: firebaseUser.name?.split(' ').slice(1).join(' ') || '',
          isActive: true,
          emailVerifiedAt: firebaseUser.email_verified ? new Date() : null,
        });
      } else if (!user.isActive) {
        throw new UnauthorizedException('User account is disabled');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}