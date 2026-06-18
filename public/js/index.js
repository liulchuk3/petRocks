async function apiFetch(url, options = {}) {
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
      window.location.href = '/login';
    }
  }

  return res;
}

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