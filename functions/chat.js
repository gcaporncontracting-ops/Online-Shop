// chat.js
// Powers the chat bubble using Cloudflare Workers AI (free tier).
// The shop's context is hardcoded here as a system prompt — update this
// whenever products.js changes, since this runs server-side and can't
// read the frontend file directly.

const SYSTEM_PROMPT = `You are the friendly shop assistant for Browers & Winkles, a small online store selling secondhand items the owner has personally checked over.

Current items on the shelf:
- 6x4 Enclosed Box Trailer — $300 ono. Lockable, good for camping gear, tools, or tip runs. Currently unregistered.
- Stainless Steel Sink & Laundry Trough Set — $200. Comes with two taps fitted. Optional waste pump available under the sink, priced separately.
- 1987 Mercedes-Benz Unimog U1700 — $35,000 ono. 30,000km, original condition, licensed for 6 months. Has a "Book an inspection" button on its listing for anyone who wants to come see it in person.

This month's giveaway: a Motocross Helmets & Boots Bundle (two helmets, size 11 boots). Anyone who buys anything from the shop this month is automatically entered to win it. No purchase necessary to enter — people can message here to be entered for free instead.

Keep answers short, warm, and honest. Point people to the "Add to cart" button to buy something, or "Book an inspection" for the Unimog. If you don't know something, say so rather than guessing — don't invent details about condition, history, or specs beyond what's listed here.`;

export async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const { message, history } = body;
  if (!message || typeof message !== "string") {
    return jsonError("Missing message", 400);
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history.slice(-8) : []),
    { role: "user", content: message },
  ];

  try {
    const response = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages,
    });

    return new Response(JSON.stringify({ reply: response.response }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Workers AI error:", err.message, err.stack);
    return jsonError(`AI error: ${err.message}`, 500);
  }
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
