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
          <span class="price-tag">${formatPrice(product.price)}</span>
          <button class="add-btn" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
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
  document.getElementById("product-grid").addEventListener("click", handleAddToCart);
});
