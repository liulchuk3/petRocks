// public/js/register.js

const form = document.getElementById('registerForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ← головне: блокуємо звичайну відправку форми
  const messages = form.dataset;
  const submitButton = form.querySelector('button[type="submit"]');

  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // --- Валідація на фронті ---
  errorEl.hidden = true;

  if (!email || !password || !confirmPassword) {
    return showError(messages.fillError);
  }

  if (!isValidEmail(email)) {
    return showError(messages.invalidEmail);
  }

  if (password.length < 8) {
    return showError(messages.shortPassword);
  }

  if (password !== confirmPassword) {
    return showError(messages.passwordMismatch);
  }

  // --- Відправка на сервер ---
  submitButton.disabled = true;
  form.dataset.loading = 'true';
  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Вказуємо, що відправляємо JSON
      body: JSON.stringify({ email, password }), // Перетворюємо дані в JSON
    });

    const data = await res.json();
    
    if (data.success) {
      const lang = getCookie('i18next') || 'UK'; // Отримуємо мову з куки або встановлюємо за замовчуванням 'UK'
      window.location.href = '/' + lang;
    }
    else {
      showError(messages.genericError);
    }
  } catch (err) {
    showError(messages.networkError);
  } finally {
    submitButton.disabled = false;
    delete form.dataset.loading;
  }
});

function getCookie(name) {
const match = document.cookie.match(
new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)')
);
return match ? decodeURIComponent(match[1]) : null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.dataset.state = 'error';
  errorEl.hidden = false;
}