import { apiFetch } from '/js/index.js';

const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const formMessage = document.getElementById('formError');
const submitButton = document.getElementById('forgotPasswordButton');

forgotPasswordForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    formMessage.hidden = true;
    submitButton.disabled = true;
    forgotPasswordForm.dataset.loading = 'true';

    try {
        const response = await apiFetch('/auth/forgot-password', {
            method: 'POST',
            body: { email: document.getElementById('emailInput').value.trim() },
        });

        if (!response.ok) {
            formMessage.textContent = forgotPasswordForm.dataset.error;
            formMessage.dataset.state = 'error';
        } else {
            formMessage.textContent = forgotPasswordForm.dataset.success;
            formMessage.dataset.state = 'success';
            forgotPasswordForm.reset();
        }
    } catch (error) {
        console.error('Forgot password request failed:', error);
        formMessage.textContent = forgotPasswordForm.dataset.networkError;
        formMessage.dataset.state = 'error';
    } finally {
        formMessage.hidden = false;
        submitButton.disabled = false;
        delete forgotPasswordForm.dataset.loading;
    }
});