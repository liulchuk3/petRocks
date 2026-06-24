import express from "express";
import cookieParser from "cookie-parser"; // 1. Імпортуємо парсер кук
import path from "path";
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import * as i18nextMiddleware from 'i18next-http-middleware';
import pagesRoutes from "./routes/pages.routes.js";
import authRoutes from './routes/auth.routes.js';
import apiRoutes from './routes/api.routes.js';
import { syncLangWithUrl } from "./middleware/lang-sync.middleware.js";
import { Request, Response, NextFunction } from 'express';

const app = express();

// 2. Підключаємо cookie-parser ОБОВ'ЯЗКОВО перед мідлварою i18next
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));


// 3. Налаштування i18next
i18next
  .use(Backend) 
  .use(i18nextMiddleware.LanguageDetector) 
  .init({
    fallbackLng: 'uk', 
    preload: ['uk', 'en'], 
    backend: {
      loadPath: path.join(process.cwd(), 'locales/{{lng}}/{{ns}}.json') 
    },
    
    // 🔥 НАЛАШТУВАННЯ ТВОЄЇ ЛОГІКИ ВИЗНАЧЕННЯ ТА КЕШУВАННЯ:
    detection: {
      // order: визначає чергу перевірки. 
      // Спочатку дивимось у кукі (для старих користувачів). 
      // Якщо куки порожні — дивимось у заголовок браузера (header) для новачків.
      order: ['cookie', 'header'], 
      
      // caches: вказує, куди зберегти мову після того, як вона була визначена.
      // Пакет автоматично відправить куку клієнту!
      caches: ['cookie'], 
      
      // Налаштування самої куки
      lookupCookie: 'i18next', // назва куки, яка буде створена в браузері
      cookieMinutes: 60 * 24 * 365, // час життя куки (365 днів у хвилинах)
      cookiePath: '/' // доступно для всього сайту
    }
  });

// 4. Підключаємо хендлер i18next
app.use(i18nextMiddleware.handle(i18next));
app.use("/:lng", syncLangWithUrl, pagesRoutes); //Змінює мову на основі URL, якщо там є префікс /:lng

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

// 1. Головний роут для тих, хто зайшов БЕЗ мовного префіксу (наприклад, просто на "/")
app.get("/", (req, res) => {
  const userLang = req.language || "uk"; 
  res.redirect(`/${userLang}`);
});

app.use("/:lng", pagesRoutes);

app.use('/auth', authRoutes);

app.use('/api', apiRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log('File too large (max 5MB)');
    return res.status(400).json({ error: 'File too large (max 5MB)' });
  }
  if (err.message === 'Only JPEG, PNG, WebP allowed') {
    console.log('Only JPEG, PNG, WebP allowed');
    return res.status(400).json({ error: 'Only JPEG, PNG, WebP allowed' });
  }
  next(err);
});

export default app;