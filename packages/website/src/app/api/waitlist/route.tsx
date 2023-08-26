import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  await fetch(process.env.DISCORD_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: `${email} joined the waitlist!` }),
  });

  return NextResponse.json({ status: 'ok' });
}
