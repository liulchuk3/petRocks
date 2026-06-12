const buttons = document.querySelectorAll(
    '.select-company-or-user-rocks-container button'
);

buttons.forEach(button => {
    button.addEventListener('click', () => {
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});