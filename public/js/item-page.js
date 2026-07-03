import { getCookie } from '/js/index.js'

const toggleBtn = document.getElementById('desc-toggle');
const wrapper = document.getElementById('desc-wrapper');
const descText = document.getElementById('desc-text');
const currentLng = getCookie('i18next') || 'en';

const more = currentLng === 'uk' ? 'Читати далі' : 'Read More';
const less = currentLng === 'uk' ? 'Згорнути' : 'Read Less';

if (toggleBtn && wrapper && descText) {
  const updateToggleLabel = () => {
    toggleBtn.textContent = wrapper.classList.contains('expanded') ? less : more;
  };

  const toggleDescription = () => {
    wrapper.classList.toggle('expanded');
    updateToggleLabel();
  };

  descText.addEventListener('click', toggleDescription);
  toggleBtn.addEventListener('click', toggleDescription);
  updateToggleLabel();
}

const containerTop = document.querySelector('.top-rocks-container');
const btnTopLeft   = document.querySelector('.scroll-btn-top-left');
const btnTopRight  = document.querySelector('.scroll-btn-top-right');

const STEP = 300; // пікселів за один клік
const catalogHeading = document.querySelector('.catalog-heading');

function updateTopButtons() {
    btnTopLeft.classList.toggle('hidden', containerTop.scrollLeft <= 0);
    btnTopRight.classList.toggle('hidden', 
        containerTop.scrollLeft >= containerTop.scrollWidth - containerTop.clientWidth - 1
    );
}


btnTopLeft.addEventListener('click',  () => containerTop.scrollBy({ left: -STEP, behavior: 'smooth' }));
btnTopRight.addEventListener('click', () => containerTop.scrollBy({ left:  STEP, behavior: 'smooth' }));
containerTop.addEventListener('scroll', updateTopButtons);

// Початковий стан кнопок
updateTopButtons();