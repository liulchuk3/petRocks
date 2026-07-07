const containerTop = document.querySelector('.top-rocks-container');
const btnTopLeft   = document.querySelector('.scroll-btn-top-left');
const btnTopRight  = document.querySelector('.scroll-btn-top-right');

const containerBottom = document.querySelector('.bottom-rocks-container');
const btnBottomLeft   = document.querySelector('.scroll-btn-bottom-left');
const btnBottomRight  = document.querySelector('.scroll-btn-bottom-right');

const STEP = 300; // пікселів за один клік
const catalogHeading = document.querySelector('.catalog-heading');

function updateTopButtons() {
    btnTopLeft.classList.toggle('hidden', containerTop.scrollLeft <= 0);
    btnTopRight.classList.toggle('hidden', 
        containerTop.scrollLeft >= containerTop.scrollWidth - containerTop.clientWidth - 1
    );
}

function updateBottomButtons() {
    btnBottomLeft.classList.toggle('hidden', containerBottom.scrollLeft <= 0);
    btnBottomRight.classList.toggle('hidden',
        containerBottom.scrollLeft >= containerBottom.scrollWidth - containerBottom.clientWidth - 1
    );
}

btnTopLeft.addEventListener('click',  () => containerTop.scrollBy({ left: -STEP, behavior: 'smooth' }));
btnTopRight.addEventListener('click', () => containerTop.scrollBy({ left:  STEP, behavior: 'smooth' }));
containerTop.addEventListener('scroll', updateTopButtons);

btnBottomLeft.addEventListener('click',  () => containerBottom.scrollBy({ left: -STEP, behavior: 'smooth' }));
btnBottomRight.addEventListener('click', () => containerBottom.scrollBy({ left:  STEP, behavior: 'smooth' }));
containerBottom.addEventListener('scroll', updateBottomButtons);

// Початковий стан кнопок
updateTopButtons();
updateBottomButtons();