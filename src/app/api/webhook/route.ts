import { NextRequest, NextResponse } from 'next/server';
import { sendText } from '@/lib/whatsapp/messages';
import { getSession, setSession } from '@/services/sessionService';

const VERIFY_TOKEN = process.env.VERIFY_TOKEN ?? '';

interface WhatsAppWebhookMessage {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          text?: {
            body?: string;
          };
        }>;
      };
    }>;
  }>;
}

const extractMessageDetails = (payload: WhatsAppWebhookMessage): {
  phone?: string;
  text?: string;
 } => {
  const message =
    payload.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  const phone = message?.from;
  const text = message?.text?.body;

  return { phone, text };
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { success: false, message: 'Verification failed.' },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as WhatsAppWebhookMessage;
  const { phone, text } = extractMessageDetails(payload);

  console.log('Incoming WhatsApp webhook', { phone, text, payload });

  if (!phone || !text) {
    return NextResponse.json({ success: false, message: 'Missing payload data' }, { status: 400 });
  }

  const existingSession = await getSession(phone);
  if (!existingSession) {
    await setSession(phone, {
      phone,
      step: 'SELECTING',
      cart: [],
      updatedAt: Date.now(),
    });

    await sendText(
      phone,
      "Welcome. Today's menu:\n1 Paneer\n2 Milk\nReply with number"
    );
  }

  return NextResponse.json({ success: true });
}
