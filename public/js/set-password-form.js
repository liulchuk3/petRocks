const form = document.getElementById('setPasswordForm');
const message = document.getElementById('passwordResetMessage');
const submitButton = form?.querySelector('button[type="submit"]');

function setMessage(text, state) {
	message.textContent = text;
	message.dataset.state = state;
	message.hidden = false;
}

form?.addEventListener('submit', async (event) => {
	event.preventDefault();

	const password = document.getElementById('newPasswordInput').value;
	const confirmPassword = document.getElementById('confirmPasswordInput').value;
	const token = document.getElementById('tokenInput').value;
	const messages = form.dataset;

	if (password !== confirmPassword) {
		setMessage(messages.passwordMismatch, 'error');
		document.getElementById('confirmPasswordInput').focus();
		return;
	}

	submitButton.disabled = true;
	form.dataset.loading = 'true';
	message.hidden = true;

	try {
		const response = await fetch(`/auth/reset-password/${encodeURIComponent(token)}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password }),
		});

		const result = await response.json();
		if (!response.ok) {
			setMessage(messages.requestFailed, 'error');
			return;
		}

		setMessage(messages.success, 'success');
		form.reset();
		window.setTimeout(() => {
			window.location.href = `/${messages.language}/authorization-sign-in`;
		}, 1600);
	} catch (error) {
		console.error('Password reset failed:', error);
		setMessage(messages.networkError, 'error');
	} finally {
		submitButton.disabled = false;
		delete form.dataset.loading;
	}
});
