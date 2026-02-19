import { NextResponse } from 'next/server';
import { sendText } from '@/lib/whatsapp/messages';

// Replace this with an actual testing number that accepts messages.
const TEST_PHONE_NUMBER = '+12345678901';

export async function GET() {
  try {
    await sendText(TEST_PHONE_NUMBER, 'WhatsApp bot connected');
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
