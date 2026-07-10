// Simple cart stored in the browser (localStorage) — no login required.
// Keeps things beginner-friendly: no cart table, no sessions to manage.
const Cart = {
  KEY: 'db_cart',

  get() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  add(product, qty = 1) {
    const items = this.get();
    const existing = items.find((i) => i.product_id === product.id);
    if (existing) {
      existing.quantity += qty;
    } else {
      items.push({
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        unit: product.unit,
        image: product.image,
        quantity: qty,
      });
    }
    this.save(items);
  },

  updateQty(productId, qty) {
    let items = this.get();
    if (qty <= 0) {
      items = items.filter((i) => i.product_id !== productId);
    } else {
      const item = items.find((i) => i.product_id === productId);
      if (item) item.quantity = qty;
    }
    this.save(items);
  },

  remove(productId) {
    this.save(this.get().filter((i) => i.product_id !== productId));
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },

  count() {
    return this.get().reduce((sum, i) => sum + i.quantity, 0);
  },

  total() {
    return this.get().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
};
