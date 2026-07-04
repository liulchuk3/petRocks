// public/js/profile.js
import { apiFetch } from '/js/index.js'
import { getCookie } from '/js/index.js'

const state = {
    info: true,
    cart: false,
    orders: false
  };

const infoButton = document.getElementById('infoButton');
const cartButton = document.getElementById('cartButton');
const ordersButton = document.getElementById('ordersButton');

infoButton.addEventListener('click', () => switchView('info'));
cartButton.addEventListener('click', () => switchView('cart'));
ordersButton.addEventListener('click', () => switchView('orders'));

function switchView(view) {
  state[view] = true;

  for (const key in state) { 
    if (key !== view) {
      state[key] = false;
    }
  }
  for (const key in state) {
    const container = document.getElementById(`panel-${key}`);
    const button = document.getElementById(`${key}Button`);
    if (container) {
      if (state[key]) {
        container.classList.add('profile-panel-active');
      } else {
        container.classList.remove('profile-panel-active');
      }
    }
    if (button) {
        if (state[key]) {
          button.classList.add('profile-tab-active');
        } else {
          button.classList.remove('profile-tab-active');
        }
      }
  }
}