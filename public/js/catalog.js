const sortFilterBtn = document.getElementById('filter');
const closeSortFilterBtn = document.querySelector('.close-sort-filter');
const sortFilterBox = document.querySelector('.sort-filter-box');

if (sortFilterBtn && closeSortFilterBtn && sortFilterBox) {
    sortFilterBtn.addEventListener('click', () => {
        sortFilterBox.classList.add('sort-filter-box-active');
    });

    closeSortFilterBtn.addEventListener('click', () => {
        sortFilterBox.classList.remove('sort-filter-box-active');
    });
}