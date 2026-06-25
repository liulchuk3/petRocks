  // const i18nEl = document.getElementById('admin-i18n');
  // const i18n = {
  //   addSuccess: i18nEl.dataset.addSuccess,
  //   addError: i18nEl.dataset.addError
  // };

const state = {
    addItem: true,
    allItems: false,
    allOrders: false,
    dashboardStatistics: false
  };

const addItemButton = document.getElementById('addItemButton');
const viewItemsButton = document.getElementById('allItemsButton');
const viewOrdersButton = document.getElementById('allOrdersButton');
const viewDashboardButton = document.getElementById('dashboardStatisticsButton');

addItemButton.addEventListener('click', () => switchView('addItem'));
viewItemsButton.addEventListener('click', () => switchView('allItems'));
viewOrdersButton.addEventListener('click', () => switchView('allOrders'));
viewDashboardButton.addEventListener('click', () => switchView('dashboardStatistics'));

function switchView(view) {
  state[view] = true;

  for (const key in state) { 
    if (key !== view) {
      state[key] = false;
    }
  }
  for (const key in state) {
    const container = document.getElementById(`admin-${key}-container`);
    const button = document.getElementById(`${key}Button`);
    if (container) {
      if (state[key]) {
        container.classList.add('container-active');
      } else {
        container.classList.remove('container-active');
      }
    }
    if (button) {
        if (state[key]) {
          button.classList.add('admin-button-active');
        } else {
          button.classList.remove('admin-button-active');
        }
      }
  }
}


// JS для відправки форми з файлом
document.getElementById('addItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  // FormData сама збирає всі поля включно з файлом

  const res = await fetch('/api/items', {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // НЕ встановлюємо Content-Type — браузер сам поставить multipart/form-data
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('formFileTypeError').style.display = 'none';
    document.getElementById('formFileSizeError').style.display = 'none';
    document.getElementById('addItemForm').reset(); // очищаємо форму після успішного додавання
  }
  if (data.error === 'File too large (max 5MB)') {
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('formFileTypeError').style.display = 'none';
    document.getElementById('formFileSizeError').style.display = 'block';
    
  }
  if (data.error === 'Only JPEG, PNG, WebP allowed') {
    document.getElementById('formSuccess').style.display = 'none';
    document.getElementById('formFileTypeError').style.display = 'block';
    document.getElementById('formFileSizeError').style.display = 'none';
  }
});

