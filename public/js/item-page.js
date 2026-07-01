const toggleBtn = document.getElementById('desc-toggle');
const wrapper = document.querySelector('.description-wrapper');
const descText = document.getElementById('desc-text');

descText.addEventListener('click', () => {
  wrapper.classList.toggle('expanded');
  if (wrapper.classList.contains('expanded')) {
    toggleBtn.textContent = 'Згорнути';
  } else {
    toggleBtn.textContent = 'Читати далі';
  }
});

toggleBtn.addEventListener('click', () => {
  wrapper.classList.toggle('expanded');
  
  // Змінюємо текст кнопки залежно від стану
  if (wrapper.classList.contains('expanded')) {
    toggleBtn.textContent = 'Згорнути';
  } else {
    toggleBtn.textContent = 'Читати далі';
  }
});