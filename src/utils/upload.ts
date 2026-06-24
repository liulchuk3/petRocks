// utils/upload.ts
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// Miggleware для обробки завантаження файлів (зображень) з фронтенду, котрий потім передається як req.file в контролер
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // максимум 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP allowed'));
    }
  },
});
// Функція для стиснення та збереження зображення
export const compressAndSave = async (file: Express.Multer.File): Promise<string> => {
  const uploadDir = path.join(process.cwd(), 'public/uploads/items');

  // Створюємо папку якщо не існує
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  const filepath = path.join(uploadDir, filename);

  // sharp стискає і конвертує в WebP
  await sharp(file.buffer)
    .resize(800, 800, {
      fit: 'inside',      // зберігає пропорції, не обрізає
      withoutEnlargement: true, // не збільшує маленькі зображення
    })
    .webp({ quality: 80 }) // конвертуємо в WebP з якістю 80%
    .toFile(filepath);

  return `/uploads/items/${filename}`; // повертаємо публічний шлях для БД
};