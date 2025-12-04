// AWS configuration utility

import { AWSConfig } from '../types';

export class AWSConfigManager {
  public static getConfig(): AWSConfig {
    const useProfile = process.env.USE_AWS_PROFILE?.toLowerCase() === 'true';
    
    return {
      region: process.env.AWS_REGION || 'us-east-1',
      useProfile,
      profile: useProfile ? process.env.AWS_PROFILE : undefined,
      accessKeyId: !useProfile ? process.env.AWS_ACCESS_KEY_ID : undefined,
      secretAccessKey: !useProfile ? process.env.AWS_SECRET_ACCESS_KEY : undefined
    };
  }

  public static validateConfig(config: AWSConfig): boolean {
    if (config.useProfile) {
      // Profile-based authentication - AWS SDK will handle credential resolution
      return true;
    } else {
      // Direct credentials - ensure they are provided
      return !!(config.accessKeyId && config.secretAccessKey);
    }
  }
}