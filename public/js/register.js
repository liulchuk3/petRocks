// public/js/register.js

const form = document.getElementById('registerForm');
const errorEl = document.getElementById('formError');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // ← головне: блокуємо звичайну відправку форми

  const email = form.email.value.trim();
  const password = form.password.value;
  const confirmPassword = form.confirmPassword.value;

  // --- Валідація на фронті ---
  errorEl.style.display = 'none';

  if (!email || !password || !confirmPassword) {
    return showError('Заповніть усі поля');
  }

  if (!isValidEmail(email)) {
    return showError('Невірний формат email');
  }

  if (password.length < 8) {
    return showError('Пароль має містити мінімум 8 символів');
  }

  if (password !== confirmPassword) {
    return showError('Паролі не співпадають');
  }

  // --- Відправка на сервер ---
  try {
    const res = await fetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // Вказуємо, що відправляємо JSON
      body: JSON.stringify({ email, password }), // Перетворюємо дані в JSON
    });

    const data = await res.json();

    // if (!res.ok) {
    //   return showError(data.error || 'Помилка реєстрації');
    // }

    // // Успіх — редіректимо
    // window.location.href = '/<%= currentLng %>';

    if (data.success) {
      const lang = getCookie('i18next') || 'UK'; // Отримуємо мову з куки або встановлюємо за замовчуванням 'UK'
      window.location.href = '/' + lang;
    }
  } catch (err) {
    showError('Проблема з мережею. Спробуйте пізніше');
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
  errorEl.style.display = 'block';
}