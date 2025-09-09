import { Injectable, Inject } from '@nestjs/common';
import { Router, Query } from 'nestjs-trpc';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { FirebaseConfigService } from '../../modules/firebase/services/firebase-config.service';
import { apiResponseSchema } from '../../trpc/schemas/response.schemas';

@Router({ alias: 'publicAuth' })
@Injectable()
export class PublicAuthRouter {
  constructor(
    @Inject(FirebaseConfigService)
    private readonly firebaseConfigService: FirebaseConfigService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async getFirebaseConfig() {
    try {
      const config = await this.firebaseConfigService.getWebConfig();
      
      // Return null if no configuration is found (this is expected behavior)
      if (!config) {
        return this.responseHandler.createTrpcSuccess(null);
      }
      
      return this.responseHandler.createTrpcSuccess(config);
    } catch (error) {
      // For public endpoints, we should handle errors gracefully
      // Return null instead of throwing errors to allow the app to continue working
      console.warn('Failed to get Firebase config:', error.message);
      return this.responseHandler.createTrpcSuccess(null);
    }
  }
}