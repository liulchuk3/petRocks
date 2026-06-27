// ── CART ───────────────────────────────────────────────────────────────
const cartBtn = document.getElementById('header-cart');
cartBtn.addEventListener('click', () => {
    window.location.href = `/:lng/profile`;
});