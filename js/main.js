const productGrid = document.getElementById('productGrid');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');

let products = [];

async function loadProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    const json = await res.json();
    products = json.data || [];
    renderProducts();
  } catch (err) {
    productGrid.innerHTML = `<p>image is not loaded. please check server</p>`;
  }
}

function renderProducts() {
  if (products.length === 0) {
    productGrid.innerHTML = `<p>No product available।</p>`;
    return;
  }
  productGrid.innerHTML = products
    .map((p) => {
      const outOfStock = p.stock <= 0;
      return `
      <div class="product-card">
        <img class="product-img" src="${imageUrl(p.image)}" alt="${p.name}" onerror="this.src='https://placehold.co/300x300/e4f6ec/137a44?text=${encodeURIComponent(p.name)}'">
        <div class="product-body">
          <span class="stock-badge ${outOfStock ? 'out' : ''}">${outOfStock ? 'out of stock' : 'Available'}</span>
          <div class="product-name">${p.name}</div>
          <div class="product-unit">${p.unit}</div>
          <div class="product-desc">${p.description || ''}</div>
          <div class="product-price">₹${Number(p.price).toFixed(0)}</div>
          <button class="btn btn-primary btn-sm btn-block" ${outOfStock ? 'disabled' : ''} onclick='addToCart(${p.id})'>
            Add to Cart
          </button>
        </div>
      </div>`;
    })
    .join('');
}

function imageUrl(path) {
  if (!path) return 'https://placehold.co/300x300/e4f6ec/137a44?text=Dudh+Bazar';
  return path.startsWith('http') ? path : `${API_BASE_URL.replace('/api', '')}${path}`;
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  Cart.add(product, 1);
  renderCart();
  showToast(`${product.name} Added to cart 🛒`);
  openCart();
}

function renderCart() {
  const items = Cart.get();
  cartCountEl.textContent = Cart.count();

  if (items.length === 0) {
    cartItemsEl.innerHTML = `<div class="empty-cart">Empety cart.. 🥛<br>Please add some fresh product...</div>`;
  } else {
    cartItemsEl.innerHTML = items
      .map(
        (i) => `
      <div class="cart-item">
        <img src="${imageUrl(i.image)}" onerror="this.src='https://placehold.co/60x60/e4f6ec/137a44?text=🥛'">
        <div class="cart-item-info">
          <div style="font-weight:700;font-size:13px;">${i.name}</div>
          <div style="font-size:12px;color:var(--ink-soft)">₹${i.price} / ${i.unit}</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty(${i.product_id}, ${i.quantity - 1})">−</button>
            <span class="qty-val">${i.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${i.product_id}, ${i.quantity + 1})">+</button>
          </div>
        </div>
      </div>`
      )
      .join('');
  }

  cartTotalEl.textContent = `₹${Cart.total().toFixed(0)}`;
}

function changeQty(productId, qty) {
  Cart.updateQty(productId, qty);
  renderCart();
}

function openCart() {
  cartDrawer.classList.add('open');
  overlay.classList.add('open');
}
function closeCart() {
  cartDrawer.classList.remove('open');
  overlay.classList.remove('open');
}

document.getElementById('cartToggleBtn').addEventListener('click', openCart);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', () => {
  if (Cart.get().length === 0) {
    showToast('Empety cart...');
    return;
  }
  window.location.href = 'checkout.html';
});

loadProducts();
renderCart();
