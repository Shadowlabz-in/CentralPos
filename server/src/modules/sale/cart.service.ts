// In-memory cart store keyed by userId
// In production, this should use Redis or database
const carts = new Map<
  string,
  { items: { productVariantId: string; quantity: number; unitPrice: number }[]; note?: string }
>();

export const cartService = {
  getCart(userId: string) {
    return carts.get(userId) || { items: [] };
  },

  addItem(userId: string, productVariantId: string, quantity: number, unitPrice: number) {
    const cart = carts.get(userId) || { items: [] };
    const existing = cart.items.find((i) => i.productVariantId === productVariantId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productVariantId, quantity, unitPrice });
    }
    carts.set(userId, cart);
    return cart;
  },

  updateItem(userId: string, productVariantId: string, quantity: number) {
    const cart = carts.get(userId);
    if (!cart) return null;
    if (quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productVariantId !== productVariantId);
    } else {
      const item = cart.items.find((i) => i.productVariantId === productVariantId);
      if (item) item.quantity = quantity;
    }
    carts.set(userId, cart);
    return cart;
  },

  removeItem(userId: string, productVariantId: string) {
    const cart = carts.get(userId);
    if (!cart) return null;
    cart.items = cart.items.filter((i) => i.productVariantId !== productVariantId);
    carts.set(userId, cart);
    return cart;
  },

  clearCart(userId: string) {
    carts.delete(userId);
  },

  holdCart(userId: string, note?: string) {
    const cart = carts.get(userId);
    if (cart) {
      cart.note = note || 'Held cart';
      carts.set(`held:${userId}:${Date.now()}`, cart);
      carts.delete(userId);
    }
  },

  resumeCart(key: string) {
    const cart = carts.get(key);
    if (cart) {
      const userId = key.split(':')[1];
      carts.set(userId, cart);
      carts.delete(key);
      return { userId, cart };
    }
    return null;
  },

  listHeldCarts() {
    const held: { key: string; note?: string; itemCount: number }[] = [];
    carts.forEach((cart, key) => {
      if (key.startsWith('held:')) {
        held.push({ key, note: cart.note, itemCount: cart.items.length });
      }
    });
    return held;
  },
};
