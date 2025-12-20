export interface MaintenanceStatus {
  enabled: boolean;
  passwordRequired: boolean;
  message: string | null;
}

export interface MaintenanceVerifyResponse {
  token: string;
  expiresAt: number;
}
