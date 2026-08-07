// app.js
// Renders the product grid from products.js and handles a simple
// in-memory cart (no payment yet — that comes in Phase 3 with Stripe).

let cart = [];

function formatPrice(amount) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
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

function updateCartCount() {
  document.querySelector(".cart-count").textContent = cart.length;
}

function handleAddToCart(event) {
  const button = event.target.closest(".add-btn");
  if (!button) return;

  const id = button.dataset.id;
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;

  cart.push(product);
  updateCartCount();

  button.textContent = "Added ✓";
  setTimeout(() => (button.textContent = "Add to cart"), 900);
}

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderGiveaway();
  document.getElementById("product-grid").addEventListener("click", handleAddToCart);
});
