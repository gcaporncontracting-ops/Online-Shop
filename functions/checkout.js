// checkout.js
// Creates a Stripe Checkout Session and returns the URL to redirect to.
// Prices are looked up server-side from this list — NEVER trust prices
// sent from the browser, or someone could edit the page and pay $1 for
// the Unimog.
//
// IMPORTANT: keep this list in sync with products.js manually whenever
// you add/change/remove a product. This duplication is intentional —
// it's what stops a tampered price reaching Stripe.

const PRODUCTS_SERVER = [
  { id: "p001", name: "6x4 Enclosed Box Trailer", price: 300 },
  { id: "p002", name: "Stainless Steel Sink & Laundry Trough Set", price: 200 },
  { id: "p004", name: "1987 Mercedes-Benz Unimog U1700", price: 35000 },
];

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

  const lineItems = [];
  for (const [id, qty] of Object.entries(cart)) {
    const product = PRODUCTS_SERVER.find((p) => p.id === id);
    const quantity = parseInt(qty, 10);
    if (!product || !quantity || quantity < 1) continue;
    lineItems.push({ product, quantity });
  }
  if (lineItems.length === 0) {
    return jsonError("No valid items in cart", 400);
  }

  const origin = new URL(request.url).origin;

  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/?checkout=success`);
  params.append("cancel_url", `${origin}/?checkout=cancelled`);
  params.append("shipping_address_collection[allowed_countries][]", "AU");

  lineItems.forEach((item, i) => {
    params.append(`line_items[${i}][price_data][currency]`, "aud");
    params.append(
      `line_items[${i}][price_data][product_data][name]`,
      item.product.name
    );
    params.append(
      `line_items[${i}][price_data][unit_amount]`,
      Math.round(item.product.price * 100).toString()
    );
    params.append(`line_items[${i}][quantity]`, item.quantity.toString());
  });

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe error: ${data.error?.message || JSON.stringify(data)}`);
  }

  return new Response(JSON.stringify({ url: data.url }), {
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
