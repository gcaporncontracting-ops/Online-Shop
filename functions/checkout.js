// checkout.js
// Stripe checkout has been disconnected. Instead of creating a payment
// session, this now just tells the customer to get in touch to arrange
// payment. No requests are sent to Stripe from here anymore, and the
// STRIPE_SECRET_KEY binding is no longer used by this file.

export async function handleCheckout(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const { cart } = body;
  if (!cart || typeof cart !== "object" || Object.keys(cart).length === 0) {
    return jsonError("Cart is empty", 400);
  }

  return new Response(
    JSON.stringify({
      error:
        "Online checkout is currently unavailable. Please contact us directly to arrange payment for your order.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
