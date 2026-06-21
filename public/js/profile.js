// public/js/profile.js

import { apiFetch } from '/js/index.js'
import { getCookie } from '/js/index.js'

(() => {
  // ── i18n strings ──────────────────────────────────────────────────────
  const i18nEl = document.getElementById('profile-i18n');
  const i18n = { // Ці рядки передаються завантажуються з файла HTML для можливості використання в JS
    loading:    i18nEl.dataset.loading,
    cartEmpty:  i18nEl.dataset.cartEmpty,
    likesEmpty: i18nEl.dataset.likesEmpty,
    itemsEmpty: i18nEl.dataset.itemsEmpty,
    total:      i18nEl.dataset.total,
    quantity:   i18nEl.dataset.quantity,
    remove:     i18nEl.dataset.remove,
    inStock:    i18nEl.dataset.inStock,
    price:      i18nEl.dataset.price,
  };

  // ── State ──────────────────────────────────────────────────────────────
  const state = { cart: null, likes: null, items: null };

  // ── Helpers ────────────────────────────────────────────────────────────
  const fmt = (n) => `$${Number(n).toFixed(2)}`; // Форматування ціни

  // async function apiFetch(url, options = {}) { 
  //   const res = await fetch(url, { credentials: 'same-origin', ...options });
  //   if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //   return res.json();
  // }

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.textContent = count;
      el.classList.add('visible');
    } else {
      el.textContent = '';
      el.classList.remove('visible');
    }
  }

  // ── TABS ───────────────────────────────────────────────────────────────
  const tabs   = document.querySelectorAll('.profile-tab');
  const panels = document.querySelectorAll('.profile-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(`panel-${tab.dataset.tab}`);
      if (panel) panel.classList.add('active');

      // Lazy load data on first open
      if (tab.dataset.tab === 'cart'  && state.cart  === null) loadCart();
      if (tab.dataset.tab === 'likes' && state.likes === null) loadLikes();
      if (tab.dataset.tab === 'items' && state.items === null) loadItems();
    });
  });

  // ── CART ───────────────────────────────────────────────────────────────
  async function loadCart() {
    const el = document.getElementById('cart-content');
    el.innerHTML = `<p class="panel-loading">${i18n.loading}</p>`;
    try {
      state.cart = await apiFetch('/api/profile/cart');
      renderCart();
    } catch {
      el.innerHTML = `<p class="panel-loading">Error loading cart</p>`;
    }
  }

  function renderCart() {
    const el     = document.getElementById('cart-content');
    const total  = document.getElementById('cart-total');
    const totalV = document.getElementById('cart-total-value');

    if (!state.cart.length) {
      el.innerHTML = `<p class="panel-empty">${i18n.cartEmpty}</p>`;
      total.style.display = 'none';
      setBadge('cart-badge', 0);
      return;
    }

    setBadge('cart-badge', state.cart.reduce((s, c) => s + c.quantity, 0));

    el.innerHTML = state.cart.map(c => `
      <div class="cart-card" data-id="${c.itemId}">
        <img src="${c.item.imageUrl}" alt="${c.item.name}">
        <p class="cart-card-name">${c.item.name}</p>
        <p class="cart-card-price">${fmt(c.item.discountPrice ?? c.item.price)}</p>
        <div class="cart-card-qty">
          <button class="cart-qty-btn" data-action="dec" data-id="${c.itemId}">−</button>
          <span class="cart-qty-value">${c.quantity}</span>
          <button class="cart-qty-btn" data-action="inc" data-id="${c.itemId}">+</button>
        </div>
        <button class="cart-remove-btn" data-id="${c.itemId}">${i18n.remove}</button>
      </div>
    `).join('');

    const sum = state.cart.reduce((s, c) => {
      const price = Number(c.item.discountPrice ?? c.item.price);
      return s + price * c.quantity;
    }, 0);
    totalV.textContent = fmt(sum);
    total.style.display = 'block';

    // Events
    el.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', () => changeQty(Number(btn.dataset.id), btn.dataset.action));
    });
    el.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.id)));
    });
  }

  async function changeQty(itemId, action) {
    const entry = state.cart.find(c => c.itemId === itemId);
    if (!entry) return;
    const newQty = action === 'inc' ? entry.quantity + 1 : entry.quantity - 1;
    try {
      if (newQty < 1) {
        await removeFromCart(itemId);
        return;
      }
      const updated = await apiFetch(`/api/profile/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      });
      const idx = state.cart.findIndex(c => c.itemId === itemId);
      state.cart[idx] = updated;
      renderCart();
    } catch { /* silent */ }
  }

  async function removeFromCart(itemId) {
    try {
      await apiFetch(`/api/profile/cart/${itemId}`, { method: 'DELETE' });
      state.cart = state.cart.filter(c => c.itemId !== itemId);
      renderCart();
    } catch { /* silent */ }
  }

  // ── LIKES ──────────────────────────────────────────────────────────────
  async function loadLikes() {
    const el = document.getElementById('likes-content');
    el.innerHTML = `<p class="panel-loading">${i18n.loading}</p>`;
    try {
      state.likes = await apiFetch('/api/profile/likes');
      renderLikes();
    } catch {
      el.innerHTML = `<p class="panel-loading">Error loading likes</p>`;
    }
  }

  function renderLikes() {
    const el = document.getElementById('likes-content');

    if (!state.likes.length) {
      el.innerHTML = `<p class="panel-empty">${i18n.likesEmpty}</p>`;
      setBadge('likes-badge', 0);
      return;
    }

    setBadge('likes-badge', state.likes.length);

    el.innerHTML = state.likes.map(l => `
      <div class="like-card" data-id="${l.itemId}">
        <img src="${l.item.imageUrl}" alt="${l.item.name}">
        <p class="like-card-name">${l.item.name}</p>
        <p class="like-card-price">${fmt(l.item.discountPrice ?? l.item.price)}</p>
        <button class="unlike-btn" data-id="${l.itemId}">♡ ${i18n.remove}</button>
      </div>
    `).join('');

    el.querySelectorAll('.unlike-btn').forEach(btn => {
      btn.addEventListener('click', () => unlikeItem(Number(btn.dataset.id)));
    });
  }

  async function unlikeItem(itemId) {
    try {
      await apiFetch(`/api/profile/likes/${itemId}`, { method: 'POST' });
      state.likes = state.likes.filter(l => l.itemId !== itemId);
      renderLikes();
    } catch { /* silent */ }
  }

  // ── OWN ITEMS ──────────────────────────────────────────────────────────
  async function loadItems() {
    const el = document.getElementById('items-content');
    el.innerHTML = `<p class="panel-loading">${i18n.loading}</p>`;
    try {
      state.items = await apiFetch('/api/profile/items');
      renderItems();
    } catch {
      el.innerHTML = `<p class="panel-loading">Error loading items</p>`;
    }
  }

  function renderItems() {
    const el = document.getElementById('items-content');

    if (!state.items.length) {
      el.innerHTML = `<p class="panel-empty">${i18n.itemsEmpty}</p>`;
      setBadge('items-badge', 0);
      return;
    }

    setBadge('items-badge', state.items.length);

    el.innerHTML = state.items.map(item => `
      <div class="own-item-card">
        <img src="${item.imageUrl}" alt="${item.name}">
        <p class="own-item-name">${item.name}</p>
        <p class="own-item-price">${fmt(item.price)}</p>
        <p class="own-item-stock">${i18n.inStock}: ${item.stock}</p>
        ${!item.isActive ? `<span class="own-item-inactive">Inactive</span>` : ''}
      </div>
    `).join('');
  }
})();
