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

