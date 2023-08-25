import type { APIRoute } from 'astro';

export const post: APIRoute = async ({ request }) => {
  if (request.headers.get('content-type') !== 'application/json') {
    return {
      status: 400,
      body: 'Bad Request',
    };
  }

  const { email } = await request.json();

  await fetch(import.meta.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: `Add ${email} to waitlist!` }),
  });

  return new Response(JSON.stringify({ message: 'Add to waitlist!' }), {
    status: 200,
  });
};
