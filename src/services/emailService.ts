import nodemailer from 'nodemailer';
export async function sendResetEmail(to, link) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Використовує SSL
  auth: {
    user: process.env.SMTP_USER, // Ваша нова пошта для пет-проєкту
    pass: process.env.SMTP_PASS       // 16-значний пароль додатка без пробілів
  }
});

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: 'Скидання паролю',
    html: `
      <p>Ви запросили скидання паролю.</p>
      <p>
        <a href="${link}">Натисніть тут, щоб скинути пароль</a>
      </p>
      <p>Посилання дійсне 1 годину.</p>
      <p>Якщо ви не робили цього запиту — проігноруйте цей лист.</p>
    `,
  });
}