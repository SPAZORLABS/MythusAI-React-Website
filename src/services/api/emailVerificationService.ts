import axiosClient from '@/api/axiosClient';

// Types for email verification
export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
  email: string;
  expires_in_minutes?: number;
  detail?: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp_code: string;
}

export interface VerifyOTPResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    email_verified: boolean;
  };
}

export interface VerificationStatusResponse {
  email: string;
  email_verified: boolean;
}

// Email verification API functions
export const emailVerificationService = {
  // Send OTP to email
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await axiosClient.post('/email-verification/send-otp', data);
    return response.data;
  },

  // Verify OTP code
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await axiosClient.post('/email-verification/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  async resendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await axiosClient.post('/email-verification/resend-otp', data);
    return response.data;
  },

  // Check verification status
  async getVerificationStatus(): Promise<VerificationStatusResponse> {
    const response = await axiosClient.get('/email-verification/verification-status');
    return response.data;
  }
};

export default emailVerificationService;
