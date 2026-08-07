// worker.js
// Entry point for the deployed Worker. Static files (html/css/js/images)
// are served automatically via the ASSETS binding. Anything hitting
// /api/* is handled by the functions in /functions.

import { handleAvailability } from "./functions/availability.js";
import { handleBook } from "./functions/book.js";
import { handleChat } from "./functions/chat.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/availability" && request.method === "GET") {
      try {
        return await handleAvailability(env);
      } catch (err) {
        return new Response(JSON.stringify({ error: "Availability check failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/book" && request.method === "POST") {
      try {
        return await handleBook(request, env);
      } catch (err) {
        return new Response(JSON.stringify({ error: "Booking failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        return await handleChat(request, env);
      } catch (err) {
        return new Response(JSON.stringify({ error: "Chat failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
