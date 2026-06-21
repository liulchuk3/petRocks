import { apiFetch } from '/js/index.js'
// public/js/auth.js

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ← головне: блокуємо звичайну відправку форми

  const email = form.email.value.trim();
  const password = form.password.value;

  // --- Валідація на фронті ---
  errorEl.style.display = 'none';

  if (!email || !password) {
    return showError('Заповніть усі поля');
  }

  if (!isValidEmail(email)) {
    return showError('Невірний формат email');
  }

  if (password.length < 8) {
    return showError('Пароль має містити мінімум 8 символів');
  }

  // --- Відправка на сервер ---
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
    }
  } catch (err) {
    showError('Проблема з мережею. Спробуйте пізніше');
  }
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}