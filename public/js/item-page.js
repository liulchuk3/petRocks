const toggleBtn = document.getElementById('desc-toggle');
const wrapper = document.getElementById('desc-wrapper');
const descText = document.getElementById('desc-text');

if (toggleBtn && wrapper && descText) {
  const updateToggleLabel = () => {
    toggleBtn.textContent = wrapper.classList.contains('expanded') ? 'Згорнути' : 'Читати далі';
  };

  const toggleDescription = () => {
    wrapper.classList.toggle('expanded');
    updateToggleLabel();
  };

  descText.addEventListener('click', toggleDescription);
  toggleBtn.addEventListener('click', toggleDescription);
  updateToggleLabel();
}