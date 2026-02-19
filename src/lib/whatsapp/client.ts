import axios, { AxiosError, AxiosInstance } from 'axios';

const getEnvVar = (name: 'WHATSAPP_TOKEN' | 'PHONE_NUMBER_ID'): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to initialize the WhatsApp API client.`);
  }
  return value;
};

const whatsappToken = getEnvVar('WHATSAPP_TOKEN');
const phoneNumberId = getEnvVar('PHONE_NUMBER_ID');

export class WhatsAppApiError extends Error {
  readonly status: number;
  readonly original?: AxiosError;

  constructor(message: string, status: number, original?: AxiosError) {
    super(message);
    this.name = 'WhatsAppApiError';
    this.status = status;
    this.original = original;
  }
}

export const whatsappClient: AxiosInstance = axios.create({
  baseURL: `https://graph.facebook.com/v19.0/${phoneNumberId}`,
  headers: {
    Authorization: `Bearer ${whatsappToken}`,
    'Content-Type': 'application/json',
  },
});

interface WhatsAppErrorResponse {
  error?: {
    message?: string;
    error_user_msg?: string;
    code?: number;
    type?: string;
  };
}

whatsappClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const payload = error.response?.data as WhatsAppErrorResponse | undefined;
    const status = error.response?.status ?? 500;
    const message =
      payload?.error?.error_user_msg ??
      payload?.error?.message ??
      error.message ??
      'Unknown WhatsApp API error';

    return Promise.reject(new WhatsAppApiError(message, status, error));
  }
);
