// book.js
// Creates the actual calendar event once someone confirms a date and
// email. Re-checks the day is still free right before booking, in case
// two people were looking at the same day at once.

import { getAccessToken } from "./google-auth.js";

const OFFSET = "+08:00"; // Australia/Perth. Adjust if needed.

export async function handleBook(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request", 400);
  }

  const { date, email } = body;
  if (!date || !email) {
    return jsonError("Missing date or email", 400);
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return jsonError("That email doesn't look right", 400);
  }

  const accessToken = await getAccessToken(env);

  // Re-check the day is still free before booking it.
  const dayStart = `${date}T00:00:00${OFFSET}`;
  const dayEnd = `${date}T23:59:59${OFFSET}`;

  const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: dayStart,
      timeMax: dayEnd,
      items: [{ id: env.GOOGLE_CALENDAR_ID }],
    }),
  });
  const fbData = await fbRes.json();
  const busy = fbData.calendars?.[env.GOOGLE_CALENDAR_ID]?.busy || [];

  if (busy.length > 0) {
    return jsonError("That day was just taken — please pick another.", 409);
  }

  // Default inspection slot: 10am–11am on the chosen date.
  const eventRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      env.GOOGLE_CALENDAR_ID
    )}/events?sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Unimog inspection booking",
        description: `Booked via the Browers & Winkles website.\nVisitor email: ${email}`,
        start: { dateTime: `${date}T10:00:00${OFFSET}`, timeZone: "Australia/Perth" },
        end: { dateTime: `${date}T11:00:00${OFFSET}`, timeZone: "Australia/Perth" },
        attendees: [{ email }],
      }),
    }
  );

  if (!eventRes.ok) {
    return jsonError("Could not create the booking. Try again shortly.", 500);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
