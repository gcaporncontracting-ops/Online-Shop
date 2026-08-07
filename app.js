// app.js
// Renders the product grid from products.js and handles the cart,
// including the slide-out cart drawer. Checkout is a placeholder for
// now — real payment gets wired in during the Stripe phase.

// Cart is stored as { productId: quantity }
let cart = {};

function formatPrice(amount) {
  return amount.toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  PRODUCTS.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card";

    card.innerHTML = `
      <div class="product-photo">
        ${
          product.image
            ? `<img src="${product.image}" alt="${product.name}">`
            : "No photo yet"
        }
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.description}</p>
        <div class="product-footer">
          <span class="price-tag">${formatPrice(product.price)}${
            product.priceNote ? ` <em>${product.priceNote}</em>` : ""
          }</span>
          <button class="add-btn" data-id="${product.id}">Add to cart</button>
        </div>
        ${
          product.bookable
            ? `<button class="book-inspection-btn" data-id="${product.id}">Book an inspection</button>`
            : ""
        }
      </div>
    `;

    grid.appendChild(card);
  });
}

function renderGiveaway() {
  const banner = document.getElementById("giveaway-banner");
  if (!banner || typeof GIVEAWAY === "undefined") return;

  banner.innerHTML = `
    <div class="giveaway-photo">
      <img src="${GIVEAWAY.image}" alt="${GIVEAWAY.name}">
    </div>
    <div class="giveaway-info">
      <span class="giveaway-label">This month's giveaway</span>
      <h3>${GIVEAWAY.name}</h3>
      <p>${GIVEAWAY.description}</p>
      <p class="giveaway-fine-print">One winner drawn at random. No purchase necessary to enter — message us via chat to enter free.</p>
    </div>
  `;
}

function getCartTotalItems() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function getCartSubtotal() {
  return Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = PRODUCTS.find((p) => p.id === id);
    return product ? sum + product.price * qty : sum;
  }, 0);
}

function updateCartCount() {
  document.querySelector(".cart-count").textContent = getCartTotalItems();
}

function renderCartDrawer() {
  const itemsEl = document.getElementById("cart-items");
  const subtotalEl = document.getElementById("cart-subtotal");
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Your cart is empty. Go find something good on the shelf.</p>`;
  } else {
    itemsEl.innerHTML = entries
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === id);
        if (!product) return "";
        return `
          <div class="cart-line" data-id="${id}">
            <div class="cart-line-photo">
              ${
                product.image
                  ? `<img src="${product.image}" alt="${product.name}">`
                  : ""
              }
            </div>
            <div class="cart-line-info">
              <p class="cart-line-name">${product.name}</p>
              <p class="cart-line-price">${formatPrice(product.price)} each</p>
              <div class="cart-line-qty">
                <button class="qty-btn" data-action="decrease" data-id="${id}">&minus;</button>
                <span>${qty}</span>
                <button class="qty-btn" data-action="increase" data-id="${id}">&plus;</button>
                <button class="cart-remove" data-action="remove" data-id="${id}">Remove</button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  subtotalEl.textContent = formatPrice(getCartSubtotal());
}

function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
  renderCartDrawer();
}

function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
}

function handleAddToCart(event) {
  const button = event.target.closest(".add-btn");
  if (!button) return;

  const id = button.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();

  button.textContent = "Added ✓";
  setTimeout(() => (button.textContent = "Add to cart"), 900);
}

function handleCartDrawerClick(event) {
  const target = event.target.closest("button[data-action]");
  if (!target) return;

  const { action, id } = target.dataset;

  if (action === "increase") {
    cart[id] = (cart[id] || 0) + 1;
  } else if (action === "decrease") {
    cart[id] = Math.max(0, (cart[id] || 0) - 1);
    if (cart[id] === 0) delete cart[id];
  } else if (action === "remove") {
    delete cart[id];
  }

  updateCartCount();
  renderCartDrawer();
}

function handleCheckout() {
  if (Object.keys(cart).length === 0) return;

  const btn = document.getElementById("checkout-btn");
  btn.disabled = true;
  btn.textContent = "Redirecting to payment...";

  fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cart }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.url) {
        window.location.href = data.url;
      } else {
        showCheckoutBanner(data.error || "Could not start checkout. Please try again.", "error");
        btn.disabled = false;
        btn.textContent = "Checkout";
      }
    })
    .catch(() => {
      showCheckoutBanner("Could not start checkout. Please try again.", "error");
      btn.disabled = false;
      btn.textContent = "Checkout";
    });
}

function showCheckoutBanner(message, type) {
  const existing = document.querySelector(".checkout-banner");
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.className = `checkout-banner checkout-banner-${type}`;
  banner.textContent = message;
  document.body.insertBefore(banner, document.body.firstChild);
  setTimeout(() => banner.remove(), 9000);
}

// ---- Inspection booking modal ----

let selectedBookingDate = null;

function openBookingModal(productId) {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return;

  selectedBookingDate = null;
  document.getElementById("booking-overlay").classList.add("open");
  document.getElementById("booking-modal").classList.add("open");
  document.getElementById("booking-modal").setAttribute("aria-hidden", "false");

  const body = document.getElementById("booking-modal-body");
  body.innerHTML = `<p class="booking-loading">Checking available days for ${product.name}&hellip;</p>`;

  fetch("/api/availability")
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) {
        body.innerHTML = `<p class="booking-error">Couldn't verify calendar availability right now (${
          data.error || "unknown error"
        }). Please use the chat in the corner to arrange a time instead — don't want to risk double-booking you.</p>`;
        return;
      }
      renderBookingForm(product, data.busyDates || []);
    })
    .catch(() => {
      body.innerHTML = `<p class="booking-error">Couldn't load availability right now. Please try again shortly, or use the chat in the corner.</p>`;
    });
}

function renderBookingForm(product, busyDates) {
  const body = document.getElementById("booking-modal-body");
  const busySet = new Set(busyDates);

  const days = [];
  const today = new Date();
  for (let i = 1; days.length < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().split("T")[0];
    if (!busySet.has(iso)) {
      days.push({
        iso,
        label: d.toLocaleDateString("en-AU", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
      });
    }
  }

  body.innerHTML = `
    <p class="booking-intro">Pick a day for a 10am inspection of the ${product.name}.</p>
    <div class="booking-day-grid" id="booking-day-grid">
      ${days
        .map(
          (d) =>
            `<button class="booking-day" data-date="${d.iso}">${d.label}</button>`
        )
        .join("")}
    </div>
    <div class="booking-email-step" id="booking-email-step" style="display:none;">
      <label for="booking-email">Your email</label>
      <input type="email" id="booking-email" placeholder="you@example.com">
      <button class="btn-primary booking-confirm-btn" id="booking-confirm-btn">Confirm booking</button>
      <p class="booking-status" id="booking-status"></p>
    </div>
  `;

  document.getElementById("booking-day-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".booking-day");
    if (!btn) return;

    document
      .querySelectorAll(".booking-day")
      .forEach((el) => el.classList.remove("selected"));
    btn.classList.add("selected");
    selectedBookingDate = btn.dataset.date;

    document.getElementById("booking-email-step").style.display = "block";
  });

  document
    .getElementById("booking-confirm-btn")
    .addEventListener("click", handleBookingConfirm);
}

function handleBookingConfirm() {
  const email = document.getElementById("booking-email").value.trim();
  const statusEl = document.getElementById("booking-status");
  const confirmBtn = document.getElementById("booking-confirm-btn");

  if (!selectedBookingDate) {
    statusEl.textContent = "Please pick a day first.";
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    statusEl.textContent = "Please enter a valid email.";
    return;
  }

  confirmBtn.disabled = true;
  statusEl.textContent = "Booking...";

  fetch("/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: selectedBookingDate, email }),
  })
    .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
    .then(({ ok, data }) => {
      if (ok && data.success) {
        document.getElementById("booking-modal-body").innerHTML = `
          <p class="booking-success">You're booked in for ${selectedBookingDate} at 10am. We've got your email (${email}) on file and will be in touch if anything changes.</p>
        `;
      } else {
        console.error("Booking error detail:", data.error);
        statusEl.textContent = data.error || "Something went wrong. Please try again.";
        confirmBtn.disabled = false;
      }
    })
    .catch(() => {
      statusEl.textContent = "Something went wrong. Please try again.";
      confirmBtn.disabled = false;
    });
}

function closeBookingModal() {
  document.getElementById("booking-overlay").classList.remove("open");
  document.getElementById("booking-modal").classList.remove("open");
  document.getElementById("booking-modal").setAttribute("aria-hidden", "true");
}

// ---- Chat widget ----

let chatHistory = [];
let chatBusy = false;

function openChat() {
  document.getElementById("chat-panel").classList.add("open");
  document.getElementById("chat-panel").setAttribute("aria-hidden", "false");
  document.getElementById("chat-input").focus();
}

function closeChat() {
  document.getElementById("chat-panel").classList.remove("open");
  document.getElementById("chat-panel").setAttribute("aria-hidden", "true");
}

function appendChatMessage(text, sender) {
  const messagesEl = document.getElementById("chat-messages");
  const msg = document.createElement("div");
  msg.className = `chat-msg chat-msg-${sender}`;
  msg.textContent = text;
  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return msg;
}

function handleChatSubmit(event) {
  event.preventDefault();
  if (chatBusy) return;

  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message) return;

  appendChatMessage(message, "user");
  input.value = "";
  chatBusy = true;

  const thinkingMsg = appendChatMessage("...", "bot");

  fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history: chatHistory }),
  })
    .then((res) => res.json())
    .then((data) => {
      thinkingMsg.remove();
      const reply = data.reply || data.error || "Sorry, something went wrong.";
      appendChatMessage(reply, "bot");
      chatHistory.push({ role: "user", content: message });
      chatHistory.push({ role: "assistant", content: reply });
    })
    .catch(() => {
      thinkingMsg.remove();
      appendChatMessage("Sorry, something went wrong. Please try again.", "bot");
    })
    .finally(() => {
      chatBusy = false;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderGiveaway();

  const params = new URLSearchParams(window.location.search);
  if (params.get("checkout") === "success") {
    cart = {};
    updateCartCount();
    showCheckoutBanner("Thanks for your order! We'll be in touch to confirm details and arrange shipping.", "success");
    window.history.replaceState({}, "", window.location.pathname);
  } else if (params.get("checkout") === "cancelled") {
    showCheckoutBanner("Checkout was cancelled — your cart is still saved.", "cancelled");
    window.history.replaceState({}, "", window.location.pathname);
  }

  document.getElementById("product-grid").addEventListener("click", handleAddToCart);
  document.getElementById("product-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".book-inspection-btn");
    if (btn) openBookingModal(btn.dataset.id);
  });
  document.getElementById("booking-close").addEventListener("click", closeBookingModal);
  document.getElementById("booking-overlay").addEventListener("click", closeBookingModal);
  document.querySelector(".cart-btn").addEventListener("click", openCart);
  document.getElementById("chat-bubble").addEventListener("click", openChat);
  document.getElementById("chat-close").addEventListener("click", closeChat);
  document.getElementById("chat-form").addEventListener("submit", handleChatSubmit);
  document.getElementById("cart-close").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("cart-items").addEventListener("click", handleCartDrawerClick);
  document.getElementById("checkout-btn").addEventListener("click", handleCheckout);
});
