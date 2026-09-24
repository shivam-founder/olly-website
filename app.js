// =====================
// Olly — Frontend Logic
// =====================

// Phase 5 me yahan backend ka URL daalenge.
// Abhi khali hai = DEMO MODE (sample products chalenge)
const API_URL = "https://olly-api.sayulakshay.workers.dev/";

const DEMO_PRODUCTS = [
  { id: 1, name: "Olly Classic T-Shirt", price: 499, emoji: "👕" },
  { id: 2, name: "Olly Coffee Mug", price: 249, emoji: "☕" },
  { id: 3, name: "Olly Hoodie", price: 999, emoji: "🧥" },
  { id: 4, name: "Olly Cap", price: 299, emoji: "🧢" },
  { id: 5, name: "Olly Tote Bag", price: 349, emoji: "👜" },
  { id: 6, name: "Olly Sticker Pack", price: 99, emoji: "✨" },
];

let products = [];
let cart = JSON.parse(localStorage.getItem("ollyCart")) || [];

// ---------- Products Load ----------
async function loadProducts() {
  if (API_URL) {
    try {
      const res = await fetch(`${API_URL}/products`);
      products = await res.json();
    } catch (e) {
      products = DEMO_PRODUCTS;
    }
  } else {
    products = DEMO_PRODUCTS;
  }
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-emoji">${p.emoji || "🛍️"}</div>
      <h3>${p.name}</h3>
      <p class="price">₹${p.price}</p>
      <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>`).join("");
}

// ---------- Cart ----------
function addToCart(id) {
  const item = cart.find(i => i.id === id);
  if (item) item.qty += 1;
  else cart.push({ id, qty: 1 });
  saveCart();
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
}

function saveCart() {
  localStorage.setItem("ollyCart", JSON.stringify(cart));
  updateCartUI();
}

function cartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return cart.reduce((sum, i) => {
    const p = products.find(pr => pr.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function updateCartUI() {
  document.getElementById("cartCount").textContent = cartCount();
  document.getElementById("cartTotal").textContent = "₹" + cartTotal();

  const itemsDiv = document.getElementById("cartItems");
  if (cart.length === 0) {
    itemsDiv.innerHTML = `<p class="empty-msg">Cart khali hai 🛒</p>`;
    return;
  }
  itemsDiv.innerHTML = cart.map(i => {
    const p = products.find(pr => pr.id === i.id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <span class="item-emoji">${p.emoji || "🛍️"}</span>
        <div class="item-info">
          <p class="item-name">${p.name}</p>
          <p class="item-price">₹${p.price} × ${i.qty}</p>
        </div>
        <div class="qty-controls">
          <button onclick="changeQty(${p.id}, -1)">−</button>
          <span>${i.qty}</span>
          <button onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>`;
  }).join("");
}

// ---------- Cart Panel ----------
const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");

document.getElementById("cartBtn").onclick = () => {
  cartPanel.classList.add("open");
  cartOverlay.classList.add("show");
};
function closeCart() {
  cartPanel.classList.remove("open");
  cartOverlay.classList.remove("show");
}
document.getElementById("closeCart").onclick = closeCart;
cartOverlay.onclick = closeCart;

// ---------- Checkout ----------
const checkoutModal = document.getElementById("checkoutModal");

document.getElementById("checkoutBtn").onclick = () => {
  if (cart.length === 0) {
    alert("Pehle kuch to add karo! 😄");
    return;
  }
  closeCart();
  checkoutModal.classList.add("show");
};

document.getElementById("cancelCheckout").onclick = () =>
  checkoutModal.classList.remove("show");

document.getElementById("checkoutForm").onsubmit = async (e) => {
  e.preventDefault();
  const order = {
    customer: {
      name: document.getElementById("custName").value,
      phone: document.getElementById("custPhone").value,
      address: document.getElementById("custAddress").value,
    },
    items: cart.map(i => {
      const p = products.find(pr => pr.id === i.id);
      return { productId: p.id, name: p.name, price: p.price, qty: i.qty };
    }),
    total: cartTotal(),
  };

  if (!API_URL) {
    console.log("DEMO ORDER:", order);
    showSuccess("Ye demo order tha — backend jodne ke baad database me save hoga!");
  } else {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (!res.ok) throw new Error("Order fail");
      const data = await res.json();
      showSuccess(`Order #${data.orderId} confirm ho gaya!`);
    } catch (err) {
      alert("Order place nahi hua. Thodi der baad try karo.");
      return;
    }
  }

  cart = [];
  saveCart();
  checkoutModal.classList.remove("show");
};

function showSuccess(msg) {
  document.getElementById("successMsg").textContent = msg;
  document.getElementById("successModal").classList.add("show");
}
document.getElementById("successClose").onclick = () =>
  document.getElementById("successModal").classList.remove("show");

// ---------- Start ----------
loadProducts();
updateCartUI();