import type { AxiosResponse } from 'axios';
import { WhatsAppApiError, whatsappClient } from './client';

export interface WhatsAppActionButton {
  id: string;
  title: string;
}

export interface WhatsAppMessageResponse {
  messaging_product: 'whatsapp';
  contacts?: Array<{ input: string; wa_id: string }>;
  messages?: Array<{ id: string }>;
}

interface TextMessagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'text';
  text: {
    body: string;
  };
}

interface ButtonsMessagePayload {
  messaging_product: 'whatsapp';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    body: {
      text: string;
    };
    action: {
      buttons: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
    };
  };
}

type MessageResponse = WhatsAppMessageResponse;

const postMessage = async <Payload>(payload: Payload): Promise<MessageResponse> => {
  try {
    const response: AxiosResponse<MessageResponse> = await whatsappClient.post('/messages', payload);
    return response.data;
  } catch (error) {
    if (error instanceof WhatsAppApiError) {
      throw error;
    }

    if (error instanceof Error) {
      throw new Error(`Failed to send WhatsApp message: ${error.message}`);
    }

    throw new Error('Unexpected error while sending WhatsApp message.');
  }
};

export const sendText = async (
  to: string,
  message: string
): Promise<WhatsAppMessageResponse> => {
  const payload: TextMessagePayload = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      body: message,
    },
  };

  return postMessage(payload);
};

export const sendButtons = async (
  to: string,
  body: string,
  buttons: WhatsAppActionButton[]
): Promise<WhatsAppMessageResponse> => {
  if (!buttons.length) {
    throw new Error('At least one button is required to send a button message.');
  }

  const payload: ButtonsMessagePayload = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: body,
      },
      action: {
        buttons: buttons.map((button) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      },
    },
  };

  return postMessage(payload);
};
