import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { FirebaseConfigService } from './firebase-config.service';
import * as admin from 'firebase-admin';

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
  firebase: {
    identities: any;
    sign_in_provider: string;
  };
}

@Injectable()
export class FirebaseAuthService {
  private readonly logger = new Logger(FirebaseAuthService.name);
  private adminApp: admin.app.App | null = null;

  constructor(
    private readonly firebaseConfigService: FirebaseConfigService,
  ) {
    this.initializeFirebaseAdmin();
  }

  private async initializeFirebaseAdmin(): Promise<void> {
    try {
      const adminConfig = await this.firebaseConfigService.getAdminConfig();
      
      if (adminConfig) {
        // Initialize Firebase Admin if service account key is available
        if (!admin.apps.length) {
          this.adminApp = admin.initializeApp({
            credential: admin.credential.cert(adminConfig),
          });
          this.logger.log('Firebase Admin initialized successfully');
        } else {
          this.adminApp = admin.apps[0];
        }
      } else {
        this.logger.log('No Firebase admin config found. Firebase features will not be available until configured.');
      }
    } catch (error) {
      this.logger.warn('Firebase initialization skipped due to configuration error:', (error as Error).message);
      // Don't throw error - allow app to continue without Firebase
    }
  }

  async getFirebaseWebConfig() {
    return this.firebaseConfigService.getWebConfig();
  }

  async verifyIdToken(idToken: string): Promise<FirebaseTokenPayload> {
    if (!this.adminApp) {
      await this.initializeFirebaseAdmin();
    }

    if (!this.adminApp) {
      throw new UnauthorizedException('Firebase Admin not configured');
    }

    try {
      const decodedToken = await admin.auth(this.adminApp).verifyIdToken(idToken);
      return decodedToken as FirebaseTokenPayload;
    } catch (error) {
      this.logger.error('Error verifying Firebase ID token:', error);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }

  async createCustomToken(uid: string, claims?: object): Promise<string> {
    if (!this.adminApp) {
      await this.initializeFirebaseAdmin();
    }

    if (!this.adminApp) {
      throw new UnauthorizedException('Firebase Admin not configured');
    }

    try {
      return await admin.auth(this.adminApp).createCustomToken(uid, claims);
    } catch (error) {
      this.logger.error('Error creating custom token:', error);
      throw new Error('Failed to create custom token');
    }
  }

  async getUserByUid(uid: string): Promise<admin.auth.UserRecord | null> {
    if (!this.adminApp) {
      await this.initializeFirebaseAdmin();
    }

    if (!this.adminApp) {
      return null;
    }

    try {
      return await admin.auth(this.adminApp).getUser(uid);
    } catch (error) {
      this.logger.error('Error getting user by UID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
    if (!this.adminApp) {
      await this.initializeFirebaseAdmin();
    }

    if (!this.adminApp) {
      return null;
    }

    try {
      return await admin.auth(this.adminApp).getUserByEmail(email);
    } catch (error) {
      this.logger.error('Error getting user by email:', error);
      return null;
    }
  }

  async setCustomClaims(uid: string, claims: object): Promise<void> {
    if (!this.adminApp) {
      await this.initializeFirebaseAdmin();
    }

    if (!this.adminApp) {
      throw new Error('Firebase Admin not configured');
    }

    try {
      await admin.auth(this.adminApp).setCustomUserClaims(uid, claims);
    } catch (error) {
      this.logger.error('Error setting custom claims:', error);
      throw new Error('Failed to set custom claims');
    }
  }

  async refreshFirebaseConfig(): Promise<void> {
    // Reinitialize Firebase Admin with updated config
    if (this.adminApp) {
      await this.adminApp.delete();
      this.adminApp = null;
    }
    
    await this.initializeFirebaseAdmin();
  }
}