import { apiFetch } from '/js/index.js'
import { getCookie } from '/js/index.js'
// public/js/auth.js

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ← головне: блокуємо звичайну відправку форми
  const messages = form.dataset;
  const submitButton = form.querySelector('button[type="submit"]');

  const email = form.email.value.trim();
  const password = form.password.value;

  // --- Валідація на фронті ---
  errorEl.hidden = true;

  if (!email || !password) {
    return showError(messages.fillError);
  }

  if (!isValidEmail(email)) {
    return showError(messages.invalidEmail);
  }

  if (password.length < 8) {
    return showError(messages.shortPassword);
  }

  // --- Відправка на сервер ---
  submitButton.disabled = true;
  form.dataset.loading = 'true';
  try {
    const res = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Вказуємо, що відправляємо JSON
      body: JSON.stringify({ email, password }), // Перетворюємо дані в JSON
    });

    const data = await res.json();
    
    if (data.success) {
      const lang = getCookie('i18next') || 'uk'; // Отримуємо мову з куки або встановлюємо за замовчуванням 'uk'
      window.location.href = '/' + lang;
    } else {
      showError(messages.genericError);
    }
  } catch (err) {
    showError(messages.networkError);
  } finally {
    submitButton.disabled = false;
    delete form.dataset.loading;
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.dataset.state = 'error';
  errorEl.hidden = false;
}