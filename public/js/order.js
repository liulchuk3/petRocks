const cityInput = document.getElementById('city-input');
const cityList = document.getElementById('city-list');
const cityListStyle = document.querySelector('.dropdown');
const warehouseSelect = document.getElementById('warehouse-select');
const warehouseSelectStyle = document.querySelector('.warehouse-select');

let cityRef = null;

cityInput.addEventListener('input', async () => {
  const query = cityInput.value.trim();
  if (query.length < 2) {
    cityListStyle.classList.remove('open');
    cityList.innerHTML = '';
    return;
  }
    console.log(query);
  const res = await fetch(`/api/cities?query=${query}`);

  const cities = await res.json();

  console.log('Fetched cities:', cities); // Log the fetched cities for debugging

  cityListStyle.classList.add('open');
  cityList.innerHTML = cities.map(city => `
    <li data-ref="${city.DeliveryCity}" data-name="${city.Present}">
      ${city.Present}
    </li>
  `).join('');
});

cityList.addEventListener('click', async (e) => {
  const li = e.target.closest('li');
  if (!li) return;

  cityRef = li.dataset.ref;
  cityInput.value = li.dataset.name;
  cityList.innerHTML = '';

  // Завантажуємо відділення для обраного міста
  const res = await fetch(`/api/warehouses?cityRef=${cityRef}`);
  const warehouses = await res.json();

    console.log('Fetched warehouses:', warehouses); // Log the fetched warehouses for debugging
  warehouseSelect.innerHTML = warehouses.map(w => `
    <option value="${w.Ref}">${w.Description}</option>
  `).join('');
  cityListStyle.classList.remove('open');
  warehouseSelect.disabled = false;
});