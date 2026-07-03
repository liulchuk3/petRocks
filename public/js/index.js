// public/js/index.js

// Global function to handle API requests with automatic token refresh
export async function apiFetch(url, options = {}) {
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  let res = await fetch(url, config);

  if (res.status === 401) {
    const refreshRes = await fetch('/auth/refresh', { method: 'POST', credentials: 'include' });

    if (refreshRes.ok) {
      res = await fetch(url, config);
    } else {
      const lang = getCookie('i18next') || 'uk'; // Отримуємо мову з куки або встановлюємо за замовчуванням 'uk'
      window.location.href = '/' + lang;
    }
  }

  return res;
}

// Global function to get a cookie value by name
export function getCookie(name) {
const match = document.cookie.match(
new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)')
);
return match ? decodeURIComponent(match[1]) : null;
}



// Logout button handler
// Знаходимо всі кнопки з цим класом
const logoutButtons = document.querySelectorAll('.logout-btn');

logoutButtons.forEach(btn => {
  btn.addEventListener('click', async () => {
    try {
      const res = await apiFetch('/auth/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        const lang = getCookie('i18next') || 'uk';
        window.location.href = '/' + lang;
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  });
});

document.getElementById('header-sidebar-open-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.add('open-sidebar');
    document.querySelector('.overlay').classList.add('open-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => { link.classList.add('sidebar-link-animation');});
});
document.getElementById('sidebar-sidebar-close-btn').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('open-sidebar');
    document.querySelector('.overlay').classList.remove('open-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => { link.classList.remove('sidebar-link-animation');});
});
document.getElementById('overlay').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.remove('open-sidebar');
    document.querySelector('.overlay').classList.remove('open-overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => { link.classList.remove('sidebar-link-animation');});
});

const themeBtn = document.getElementById('theme-btn');
const savedTheme = localStorage.getItem('theme');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

if (savedTheme === 'dark') {
  document.body.classList.add('dark');
  document.documentElement.classList.add('dark');
  themeColorMeta.setAttribute('content', '#1a2230');
}

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  document.documentElement.classList.toggle('dark');

  if (document.body.classList.contains('dark')) {
    themeColorMeta.setAttribute('content', '#1a2230');
  } else {
    themeColorMeta.setAttribute('content', 'rgb(245, 255, 232)');
  }
  
  if (document.body.classList.contains('dark')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});



const langBtn = document.getElementById('lang-btn');

langBtn.addEventListener('click', (e) => {
  // Зупиняємо спливання, щоб клік на саму кнопку не спрацьовував як клік "зовні"
  e.stopPropagation(); 
  
  // Перевіряємо поточний стан (відкрито чи закрито)
  const isExpanded = langBtn.getAttribute('aria-expanded') === 'true';
  
  // Перемикаємо стан на протилежний
  langBtn.setAttribute('aria-expanded', !isExpanded);
});

// Закриваємо дропдаун, якщо користувач клікнув у будь-якому іншому місці сайту
document.addEventListener('click', () => {
  if (langBtn.getAttribute('aria-expanded') === 'true') {
    langBtn.setAttribute('aria-expanded', 'false');
  }
});

document.getElementById('lang-en').addEventListener('click', (e) => {
  const selectedLanguage = 'en';
  document.cookie = `i18next=${selectedLanguage}; path=/; max-age=31536000`;
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/uk' || currentPath === '/en') {
        // Якщо це була головна — просто кидаємо на префікс
        window.location.href = `/${selectedLanguage}`;
    } else {
        // Якщо це була внутрішня сторінка (наприклад, "/uk/about"),
        // відрізаємо старий префікс і додаємо новий: "/en/about"
        const cleanPath = currentPath.replace(/^\/(uk|en)/, '');
        window.location.href = `/${selectedLanguage}${cleanPath}`;
    }
})

document.getElementById('lang-uk').addEventListener('click', (e) => {
  const selectedLanguage = 'uk';
  document.cookie = `i18next=${selectedLanguage}; path=/; max-age=31536000`;
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/uk' || currentPath === '/en') {
        // Якщо це була головна — просто кидаємо на префікс
        window.location.href = `/${selectedLanguage}`;
    } else {
        // Якщо це була внутрішня сторінка (наприклад, "/uk/about"),
        // відрізаємо старий префікс і додаємо новий: "/en/about"
        const cleanPath = currentPath.replace(/^\/(uk|en)/, '');
        window.location.href = `/${selectedLanguage}${cleanPath}`;
    }
})

const languageSelect = document.getElementById('language');

languageSelect.addEventListener('change', () => {
    const selectedLanguage = languageSelect.value; // 'uk' або 'en'
    
    // 1. Оновлюємо куку на нову мову (на 1 рік), щоб сервер її запам'ятав
    document.cookie = `i18next=${selectedLanguage}; path=/; max-age=31536000`;
    
    // 2. Отримуємо поточний шлях сторінки (наприклад, "/uk/about" або "/uk/contacts")
    const currentPath = window.location.pathname;
    
    // 3. Формуємо новий шлях.
    // Якщо користувач був не на головній, ми замінюємо старий префікс мови на новий.
    if (currentPath === '/' || currentPath === '/uk' || currentPath === '/en') {
        // Якщо це була головна — просто кидаємо на префікс
        window.location.href = `/${selectedLanguage}`;
    } else {
        // Якщо це була внутрішня сторінка (наприклад, "/uk/about"),
        // відрізаємо старий префікс і додаємо новий: "/en/about"
        const cleanPath = currentPath.replace(/^\/(uk|en)/, '');
        window.location.href = `/${selectedLanguage}${cleanPath}`;
    }
});