// availability.js
// Looks 30 days ahead on the connected Google Calendar and returns
// which dates already have something on them, so the booking widget
// can grey those out. Timezone assumed: Australia/Perth (no DST) —
// change the offset below if that's wrong for you.

import { getAccessToken } from "./google-auth.js";

const OFFSET = "+08:00"; // Australia/Perth. Adjust if needed.

export async function handleAvailability(env) {
  const accessToken = await getAccessToken(env);

  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 30);

  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: now.toISOString(),
      timeMax: end.toISOString(),
      items: [{ id: env.GOOGLE_CALENDAR_ID }],
    }),
  });

  const data = await res.json();
  const busy = data.calendars?.[env.GOOGLE_CALENDAR_ID]?.busy || [];

  const busyDates = new Set();
  busy.forEach((range) => {
    let d = new Date(range.start);
    const rangeEnd = new Date(range.end);
    while (d < rangeEnd) {
      busyDates.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  });

  return new Response(JSON.stringify({ busyDates: Array.from(busyDates) }), {
    headers: { "Content-Type": "application/json" },
  });
}
