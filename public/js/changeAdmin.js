// JS для відправки форми з файлом
document.getElementById('changeItemForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);
  // FormData сама збирає всі поля включно з файлом

  const res = await fetch(form.action, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
    // НЕ встановлюємо Content-Type — браузер сам поставить multipart/form-data
  });

  const data = await res.json();
  if (data.success) {
    document.getElementById('formSuccess').style.display = 'block';
    document.getElementById('formFileTypeError').style.display = 'none';
    document.getElementById('formFileSizeError').style.display = 'none';
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